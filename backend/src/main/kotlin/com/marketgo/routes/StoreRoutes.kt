package com.marketgo.routes

import com.marketgo.config.AUTH_JWT
import com.marketgo.controllers.StoreController
import io.ktor.server.auth.*
import io.ktor.server.routing.*

fun Route.storeRoutes(controller: StoreController) {
    route("/stores/{id}") {
        get { controller.get(call) } // pública

        // Panel del vendedor: solo el dueño de la tienda
        authenticate(AUTH_JWT) {
            get("/products") { controller.products(call) }
            post("/products") { controller.createProduct(call) }
            get("/reviews") { controller.reviews(call) }
            get("/orders") { controller.orders(call) }
            get("/sales") { controller.sales(call) }
        }
    }
}
