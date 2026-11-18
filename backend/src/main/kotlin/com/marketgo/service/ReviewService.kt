package com.marketgo.service

import com.marketgo.models.*
import com.marketgo.repository.ProductRepository
import com.marketgo.repository.ReviewRepository
import com.marketgo.repository.UserRepository
import com.marketgo.utils.*
import kotlin.math.round

class ReviewService(
    private val reviews: ReviewRepository,
    private val products: ProductRepository,
    private val users: UserRepository,
    private val storeService: StoreService,
) {
    private val newestFirst = compareByDescending<Review> { it.date }.thenByDescending { it.id }

    suspend fun getReviews(productId: String): List<Review> {
        if (!products.exists(productId)) throw NotFound("Producto no encontrado")
        return reviews.findByProduct(productId).sortedWith(newestFirst)
    }

    suspend fun addReview(productId: String, userId: String, req: CreateReviewRequest): Review {
        val rating = req.rating?.takeIf { it in 1..5 } ?: throw BadRequest("Elige una calificación de 1 a 5 estrellas")
        val comment = Validation.requireText(req.comment, "Escribe un comentario")
        val user = users.findById(userId) ?: throw NotFound("Usuario no encontrado")

        val id = reviews.newId()
        val review = Review(
            id = id,
            productId = productId,
            userId = userId,
            author = user.name,
            rating = rating,
            comment = comment,
            date = Dates.todayString(),
        )

        // Transacción: guarda la reseña y recalcula el promedio del producto sin perder reseñas simultáneas
        val db = reviews.db
        db.runTransaction { tx ->
            val snapshot = tx.get(products.ref(productId)).get()
            val product = products.fromDocument(snapshot) ?: throw NotFound("Producto no encontrado")
            val count = product.reviewsCount + 1
            val average = round(((product.rating * product.reviewsCount) + rating) / count * 10) / 10
            tx.update(products.ref(productId), mapOf("rating" to average, "reviewsCount" to count))
            tx.set(reviews.ref(id), reviews.toMap(review))
        }.await()

        return review
    }

    /** Reseñas de todos los productos de la tienda, con el nombre del producto. */
    suspend fun getStoreReviews(storeId: String, userId: String): List<Review> {
        storeService.requireOwner(storeId, userId)
        val storeProducts = products.findByStore(storeId).associateBy { it.id }
        return reviews.findByProducts(storeProducts.keys)
            .map { it.copy(productName = storeProducts[it.productId]?.name) }
            .sortedWith(newestFirst)
    }

    suspend fun reply(reviewId: String, userId: String, req: ReplyReviewRequest): Review {
        val text = Validation.requireText(req.reply, "Escribe una respuesta")
        val review = reviews.findById(reviewId) ?: throw NotFound("Reseña no encontrada")
        val product = products.findById(review.productId) ?: throw NotFound("Producto no encontrado")
        storeService.requireOwner(product.storeId, userId)

        reviews.update(reviewId, mapOf("reply" to text))
        return review.copy(reply = text, productName = product.name)
    }
}
