package com.marketgo.models

import kotlinx.serialization.Serializable

/** Reseña de un producto (colección "reviews"). */
@Serializable
data class Review(
    val id: String = "",
    val productId: String = "",
    val userId: String? = null,
    val author: String = "",
    val rating: Int = 5,
    val comment: String = "",
    val date: String = "",
    val reply: String? = null,
    /** Solo en GET /stores/{id}/reviews. No se guarda en Firestore. */
    val productName: String? = null,
) {
    companion object {
        val TRANSIENT_FIELDS = setOf("productName")
    }
}

@Serializable
data class CreateReviewRequest(val rating: Int? = null, val comment: String? = null)

@Serializable
data class ReplyReviewRequest(val reply: String? = null)
