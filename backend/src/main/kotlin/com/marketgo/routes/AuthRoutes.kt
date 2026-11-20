package com.marketgo.routes

import com.marketgo.controllers.AuthController
import io.ktor.server.routing.*

// Rutas públicas de autenticación
fun Route.authRoutes(controller: AuthController) {
    route("/auth") {
        post("/check-email") { controller.checkEmail(call) }
        post("/login") { controller.login(call) }
        post("/register") { controller.register(call) }
        post("/recovery") { controller.sendRecoveryCode(call) }
        post("/recovery/verify") { controller.verifyRecoveryCode(call) }
        post("/recovery/reset") { controller.resetPassword(call) }
    }
}
