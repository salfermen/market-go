package com.marketgo.service

import com.google.cloud.firestore.FieldValue
import com.marketgo.models.*
import com.marketgo.repository.CategoryRepository
import com.marketgo.repository.ProductRepository
import com.marketgo.utils.*

class ProductService(
    private val products: ProductRepository,
    private val categories: CategoryRepository,
    private val storeService: StoreService,
) {
    // ---------------------------------------------------------------- Cliente

    /**
     * Catálogo con filtros y orden (equivalente a applyFilters() de products.api.js).
     * Firestore filtra por "active" y categoría; el resto se hace en memoria porque Firestore
     * no permite combinar tantos filtros de rango/texto en una sola consulta.
     */
    suspend fun getProducts(f: ProductFilters): List<Product> {
        val text = f.query?.trim()?.lowercase()?.ifBlank { null }

        val result = products.findActive(f.category).filter { p ->
            (text == null || "${p.name} ${p.subcategory} ${p.category}".lowercase().contains(text)) &&
                (f.subcategory.isNullOrBlank() || p.subcategory == f.subcategory) &&
                (f.gender.isNullOrBlank() || p.gender == f.gender || p.gender == "unisex") &&
                (f.storeId.isNullOrBlank() || p.storeId == f.storeId) &&
                (f.minPrice == null || p.price >= f.minPrice) &&
                (f.maxPrice == null || p.price <= f.maxPrice) &&
                (f.minRating == null || p.rating >= f.minRating) &&
                (f.size.isNullOrBlank() || f.size in p.sizes) &&
                (f.color.isNullOrBlank() || p.colors.any { it.name == f.color }) &&
                (!f.onlyDiscount || p.oldPrice != null) &&
                (f.discount == null || discountOf(p) >= f.discount) &&
                (!f.flash || p.isFlash)
        }

        return when (f.sort) {
            "price_asc" -> result.sortedBy { it.price }
            "price_desc" -> result.sortedByDescending { it.price }
            "rating" -> result.sortedByDescending { it.rating }
            "newest" -> result.sortedWith(compareByDescending<Product> { it.isNew }.thenByDescending { it.createdAt })
            "popular" -> result.sortedByDescending { it.sold }
            else -> result.sortedBy { it.id.removePrefix("p").toIntOrNull() ?: Int.MAX_VALUE }
        }
    }

    suspend fun getProduct(id: String): Product {
        val product = products.findById(id) ?: throw NotFound("Producto no encontrado")
        val store = runCatching { storeService.getStore(product.storeId) }.getOrNull()
        return product.copy(store = store)
    }

    suspend fun getCategories(): List<Category> = categories.findAll().sortedBy { it.position }

    // ---------------------------------------------------------------- Vendedor

    /** Inventario completo de la tienda (incluye productos pausados). */
    suspend fun getStoreProducts(storeId: String, userId: String): List<Product> {
        storeService.requireOwner(storeId, userId)
        return products.findByStore(storeId).sortedByDescending { it.createdAt }
    }

    suspend fun createProduct(storeId: String, userId: String, req: CreateProductRequest): Product {
        storeService.requireOwner(storeId, userId)
        val name = Validation.requireText(req.name, "Ingresa el nombre del producto")
        val price = req.price?.takeIf { it > 0 } ?: throw BadRequest("Ingresa un precio válido")
        val stock = req.stock?.takeIf { it >= 0 } ?: throw BadRequest("Ingresa las unidades disponibles")
        val category = categories.findById(Validation.requireText(req.category, "Elige una categoría"))
            ?: throw BadRequest("La categoría no existe")
        if (req.oldPrice != null && req.oldPrice <= price) throw BadRequest("El precio anterior debe ser mayor al actual")

        val id = products.newId()
        val product = Product(
            id = id,
            name = name,
            category = category.id,
            subcategory = category.name,
            gender = req.gender ?: "unisex",
            price = price,
            oldPrice = req.oldPrice,
            stock = stock,
            colors = req.colors.orEmpty(),
            sizes = req.sizes?.ifEmpty { null } ?: listOf("Única"),
            material = req.material?.ifBlank { null } ?: "—",
            storeId = storeId,
            badge = "Nuevo",
            icon = category.icon,
            tone = category.tone,
            image = req.image,
            isNew = true,
            description = req.description?.trim()?.ifBlank { null } ?: "Sin descripción.",
            createdAt = Dates.nowString(),
        )
        products.save(id, product)
        categories.update(category.id, mapOf("count" to FieldValue.increment(1)))
        return product
    }

    suspend fun updateProduct(productId: String, userId: String, req: UpdateProductRequest): Product {
        val product = products.findById(productId) ?: throw NotFound("Producto no encontrado")
        storeService.requireOwner(product.storeId, userId)

        val changes = mutableMapOf<String, Any?>()
        req.name?.let { changes["name"] = Validation.requireText(it, "Ingresa el nombre del producto") }
        req.price?.let {
            if (it <= 0) throw BadRequest("Ingresa un precio válido")
            changes["price"] = it
        }
        req.oldPrice?.let { changes["oldPrice"] = it.takeIf { v -> v > 0 } } // 0 = quitar el descuento
        req.stock?.let {
            if (it < 0) throw BadRequest("Las unidades no pueden ser negativas")
            changes["stock"] = it
        }
        req.description?.let { changes["description"] = it.trim().ifBlank { "Sin descripción." } }
        req.active?.let { changes["active"] = it }
        req.isFlash?.let { changes["isFlash"] = it }
        req.material?.let { changes["material"] = it }
        req.gender?.let { changes["gender"] = it }
        req.image?.let { changes["image"] = it.ifBlank { null } }
        req.sizes?.let { changes["sizes"] = it.ifEmpty { listOf("Única") } }
        req.colors?.let { list -> changes["colors"] = list.map { mapOf("name" to it.name, "hex" to it.hex) } }
        if (req.category != null && req.category != product.category) {
            val category = categories.findById(req.category) ?: throw BadRequest("La categoría no existe")
            changes += mapOf(
                "category" to category.id,
                "subcategory" to category.name,
                "icon" to category.icon,
                "tone" to category.tone,
            )
        }

        val newPrice = (changes["price"] as Long?) ?: product.price
        val newOldPrice = if (changes.containsKey("oldPrice")) changes["oldPrice"] as Long? else product.oldPrice
        if (newOldPrice != null && newOldPrice <= newPrice) {
            // Si el vendedor baja el precio por debajo del anterior se conserva la oferta; si no, se quita
            changes["oldPrice"] = null
        }

        if (changes.isNotEmpty()) products.update(productId, changes)
        return products.findById(productId)!!
    }

    private fun discountOf(p: Product): Int =
        if (p.oldPrice == null || p.oldPrice <= 0) 0 else Math.round((1 - p.price.toDouble() / p.oldPrice) * 100).toInt()
}
