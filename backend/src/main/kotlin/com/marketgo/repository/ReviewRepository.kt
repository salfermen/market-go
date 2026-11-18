package com.marketgo.repository

import com.google.cloud.firestore.Firestore
import com.marketgo.models.Review

class ReviewRepository(db: Firestore) :
    FirestoreRepository<Review>(db, "reviews", Review.serializer(), Review.TRANSIENT_FIELDS) {

    suspend fun findByProduct(productId: String): List<Review> = findBy("productId", productId)

    suspend fun findByProducts(productIds: Collection<String>): List<Review> =
        productIds.distinct().chunked(30).flatMap { chunk -> list(collection.whereIn("productId", chunk)) }
}
