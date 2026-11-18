package com.marketgo.controllers

import com.marketgo.models.CreateOrderRequest
import com.marketgo.models.UpdateOrderStatusRequest
import com.marketgo.service.OrderService
import com.marketgo.utils.pathParam
import com.marketgo.utils.userId
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*

class OrderController(private val service: OrderService) {

    suspend fun myOrders(call: ApplicationCall) = call.respond(service.getMyOrders(call.userId()))

    suspend fun create(call: ApplicationCall) =
        call.respond(HttpStatusCode.Created, service.createOrder(call.userId(), call.receive<CreateOrderRequest>()))

    suspend fun markReviewed(call: ApplicationCall) =
        call.respond(service.markReviewed(call.pathParam("id"), call.userId()))

    suspend fun updateStatus(call: ApplicationCall) =
        call.respond(service.updateStatus(call.pathParam("id"), call.userId(), call.receive<UpdateOrderStatusRequest>()))
}
