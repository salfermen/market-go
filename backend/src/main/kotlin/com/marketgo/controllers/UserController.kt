package com.marketgo.controllers

import com.marketgo.models.CreateStoreRequest
import com.marketgo.models.UpdateProfileRequest
import com.marketgo.service.UserService
import com.marketgo.utils.pathParam
import com.marketgo.utils.userId
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*

class UserController(private val service: UserService) {

    suspend fun updateProfile(call: ApplicationCall) =
        call.respond(service.updateProfile(call.userId(), call.pathParam("id"), call.receive<UpdateProfileRequest>()))

    suspend fun createStore(call: ApplicationCall) =
        call.respond(HttpStatusCode.Created, service.createStore(call.userId(), call.pathParam("id"), call.receive<CreateStoreRequest>()))

    suspend fun deleteAccount(call: ApplicationCall) =
        call.respond(service.deleteAccount(call.userId(), call.pathParam("id")))
}
