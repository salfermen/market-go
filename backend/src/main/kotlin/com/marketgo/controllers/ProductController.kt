package com.marketgo.controllers

import com.marketgo.models.CreateReviewRequest
import com.marketgo.models.ProductFilters
import com.marketgo.models.UpdateProductRequest
import com.marketgo.service.ProductService
import com.marketgo.service.ReviewService
import com.marketgo.utils.pathParam
import com.marketgo.utils.userId
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*

class ProductController(
    private val products: ProductService,
    private val reviews: ReviewService,
) {
    /** GET /products?query=&category=&minPrice=&sort=… */
    suspend fun list(call: ApplicationCall) {
        val q = call.request.queryParameters
        val filters = ProductFilters(
            query = q["query"],
            category = q["category"],
            subcategory = q["subcategory"],
            gender = q["gender"],
            storeId = q["storeId"],
            minPrice = q["minPrice"]?.toLongOrNull(),
            maxPrice = q["maxPrice"]?.toLongOrNull(),
            minRating = q["minRating"]?.toDoubleOrNull(),
            size = q["size"],
            color = q["color"],
            onlyDiscount = q["onlyDiscount"].toBoolean(),
            discount = q["discount"]?.toIntOrNull(),
            sort = q["sort"],
            flash = q["flash"].toBoolean(),
        )
        call.respond(products.getProducts(filters))
    }

    suspend fun get(call: ApplicationCall) = call.respond(products.getProduct(call.pathParam("id")))

    suspend fun categories(call: ApplicationCall) = call.respond(products.getCategories())

    suspend fun update(call: ApplicationCall) =
        call.respond(products.updateProduct(call.pathParam("id"), call.userId(), call.receive<UpdateProductRequest>()))

    suspend fun reviews(call: ApplicationCall) = call.respond(reviews.getReviews(call.pathParam("id")))

    suspend fun addReview(call: ApplicationCall) =
        call.respond(HttpStatusCode.Created, reviews.addReview(call.pathParam("id"), call.userId(), call.receive<CreateReviewRequest>()))
}
