package com.marketgo.repository

import com.google.cloud.firestore.Firestore
import com.marketgo.models.Product

class ProductRepository(db: Firestore) :
    FirestoreRepository<Product>(db, "products", Product.serializer(), Product.TRANSIENT_FIELDS) {

    /** Productos visibles en la tienda (los pausados por el vendedor no aparecen). */
    suspend fun findActive(category: String? = null): List<Product> {
        var query = collection.whereEqualTo("active", true)
        if (!category.isNullOrBlank()) query = query.whereEqualTo("category", category)
        return list(query)
    }

    suspend fun findByStore(storeId: String): List<Product> = findBy("storeId", storeId)
}
