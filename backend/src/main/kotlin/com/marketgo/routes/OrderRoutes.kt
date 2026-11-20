package com.marketgo.routes

import com.marketgo.config.AUTH_JWT
import com.marketgo.controllers.OrderController
import io.ktor.server.auth.*
import io.ktor.server.routing.*

fun Route.orderRoutes(controller: OrderController) {
    authenticate(AUTH_JWT) {
        route("/orders") {
            get("/me") { controller.myOrders(call) }
            post { controller.create(call) }
            patch("/{id}/reviewed") { controller.markReviewed(call) }
            patch("/{id}/status") { controller.updateStatus(call) } // vendedor
        }
    }
}
