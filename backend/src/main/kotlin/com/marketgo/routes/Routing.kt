package com.marketgo.routes

import com.marketgo.config.AppContainer
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

/** Todas las rutas cuelgan de /api (la app usa EXPO_PUBLIC_API_URL = http://<ip>:8080/api). */
fun Application.configureRouting(c: AppContainer) {
    routing {
        get("/") { call.respondText("MarketGO API funcionando. Endpoints en /api") }

        route("/api") {
            get("/health") { call.respond(mapOf("status" to "ok")) }

            authRoutes(c.authController)
            userRoutes(c.userController)
            productRoutes(c.productController, c.voucherController)
            storeRoutes(c.storeController)
            reviewRoutes(c.reviewController)
            orderRoutes(c.orderController)
        }
    }
}
