package com.marketgo.models

import kotlinx.serialization.Serializable

@Serializable
data class ColorOption(val name: String = "", val hex: String = "")

/**
 * Producto (colección "products"). Precios en pesos colombianos.
 * icon + tone son la imagen provisional de la app; image queda lista para la URL de la foto real.
 */
@Serializable
data class Product(
    val id: String = "",
    val name: String = "",
    val category: String = "",
    val subcategory: String = "General",
    val gender: String = "unisex",
    val price: Long = 0,
    val oldPrice: Long? = null,
    val rating: Double = 0.0,
    val reviewsCount: Int = 0,
    val stock: Int = 0,
    val sold: Int = 0,
    val colors: List<ColorOption> = emptyList(),
    val sizes: List<String> = listOf("Única"),
    val material: String = "—",
    val origin: String = "Colombia",
    val storeId: String = "",
    val badge: String? = null,
    val icon: String = "Package",
    val tone: String = "#EDE9FE",
    val image: String? = null,
    val isNew: Boolean = false,
    val isPopular: Boolean = false,
    val isFlash: Boolean = false,
    val active: Boolean = true,
    val description: String = "Sin descripción.",
    val createdAt: String = "",
    /** Solo en GET /products/{id}: la tienda que lo vende. No se guarda en Firestore. */
    val store: Store? = null,
) {
    companion object {
        val TRANSIENT_FIELDS = setOf("store")
    }
}

/** POST /stores/{id}/products — mismos campos que el formulario del vendedor. */
@Serializable
data class CreateProductRequest(
    val name: String? = null,
    val price: Long? = null,
    val stock: Int? = null,
    val category: String? = null,
    val description: String? = null,
    val oldPrice: Long? = null,
    val colors: List<ColorOption>? = null,
    val sizes: List<String>? = null,
    val material: String? = null,
    val gender: String? = null,
    val image: String? = null,
)

/** PUT /products/{id} — solo se cambian los campos enviados (los null se ignoran). */
@Serializable
data class UpdateProductRequest(
    val name: String? = null,
    val price: Long? = null,
    val oldPrice: Long? = null,
    val stock: Int? = null,
    val category: String? = null,
    val description: String? = null,
    val active: Boolean? = null,
    val colors: List<ColorOption>? = null,
    val sizes: List<String>? = null,
    val material: String? = null,
    val gender: String? = null,
    val image: String? = null,
    val isFlash: Boolean? = null,
)

/** Filtros de GET /products (mismos nombres que applyFilters() en products.api.js). */
data class ProductFilters(
    val query: String? = null,
    val category: String? = null,
    val subcategory: String? = null,
    val gender: String? = null,
    val storeId: String? = null,
    val minPrice: Long? = null,
    val maxPrice: Long? = null,
    val minRating: Double? = null,
    val size: String? = null,
    val color: String? = null,
    val onlyDiscount: Boolean = false,
    val discount: Int? = null,
    val sort: String? = null,
    val flash: Boolean = false,
)
