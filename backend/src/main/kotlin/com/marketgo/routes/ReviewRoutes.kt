package com.marketgo.routes

import com.marketgo.config.AUTH_JWT
import com.marketgo.controllers.ReviewController
import io.ktor.server.auth.*
import io.ktor.server.routing.*

fun Route.reviewRoutes(controller: ReviewController) {
    authenticate(AUTH_JWT) {
        post("/reviews/{id}/reply") { controller.reply(call) }
    }
}
