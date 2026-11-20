package com.marketgo.routes

import com.marketgo.config.AUTH_JWT
import com.marketgo.controllers.UserController
import io.ktor.server.auth.*
import io.ktor.server.routing.*

// Requieren token: cada usuario solo puede modificar su propia cuenta
fun Route.userRoutes(controller: UserController) {
    authenticate(AUTH_JWT) {
        route("/users/{id}") {
            put { controller.updateProfile(call) }
            delete { controller.deleteAccount(call) }
            post("/store") { controller.createStore(call) }
        }
    }
}
