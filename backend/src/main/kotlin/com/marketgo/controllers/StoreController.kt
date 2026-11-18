package com.marketgo.controllers

import com.marketgo.models.CreateProductRequest
import com.marketgo.service.*
import com.marketgo.utils.pathParam
import com.marketgo.utils.userId
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*

class StoreController(
    private val stores: StoreService,
    private val products: ProductService,
    private val reviews: ReviewService,
    private val orders: OrderService,
    private val sales: SalesService,
) {
    suspend fun get(call: ApplicationCall) = call.respond(stores.getStore(call.pathParam("id")))

    suspend fun products(call: ApplicationCall) =
        call.respond(products.getStoreProducts(call.pathParam("id"), call.userId()))

    suspend fun createProduct(call: ApplicationCall) =
        call.respond(HttpStatusCode.Created, products.createProduct(call.pathParam("id"), call.userId(), call.receive<CreateProductRequest>()))

    suspend fun reviews(call: ApplicationCall) =
        call.respond(reviews.getStoreReviews(call.pathParam("id"), call.userId()))

    suspend fun orders(call: ApplicationCall) =
        call.respond(orders.getStoreOrders(call.pathParam("id"), call.userId()))

    suspend fun sales(call: ApplicationCall) =
        call.respond(sales.summary(call.pathParam("id"), call.userId()))
}
