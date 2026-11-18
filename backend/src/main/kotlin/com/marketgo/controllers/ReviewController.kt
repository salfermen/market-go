package com.marketgo.controllers

import com.marketgo.models.ReplyReviewRequest
import com.marketgo.service.ReviewService
import com.marketgo.utils.pathParam
import com.marketgo.utils.userId
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*

class ReviewController(private val service: ReviewService) {

    suspend fun reply(call: ApplicationCall) =
        call.respond(service.reply(call.pathParam("id"), call.userId(), call.receive<ReplyReviewRequest>()))
}
