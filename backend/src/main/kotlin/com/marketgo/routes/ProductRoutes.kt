package com.marketgo.routes

import com.marketgo.config.AUTH_JWT
import com.marketgo.controllers.ProductController
import com.marketgo.controllers.VoucherController
import io.ktor.server.auth.*
import io.ktor.server.routing.*

fun Route.productRoutes(controller: ProductController, vouchers: VoucherController) {
    // Públicas: se puede ver el catálogo sin iniciar sesión
    get("/categories") { controller.categories(call) }
    get("/vouchers") { vouchers.list(call) }
    get("/vouchers/{code}") { vouchers.get(call) }

    route("/products") {
        get { controller.list(call) }
        get("/{id}") { controller.get(call) }
        get("/{id}/reviews") { controller.reviews(call) }

        authenticate(AUTH_JWT) {
            put("/{id}") { controller.update(call) }          // solo el dueño de la tienda
            post("/{id}/reviews") { controller.addReview(call) }
        }
    }
}
