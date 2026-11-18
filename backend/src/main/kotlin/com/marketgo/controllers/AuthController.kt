package com.marketgo.controllers

import com.marketgo.models.*
import com.marketgo.service.AuthService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*

/** Controlador: lee la petición, llama al servicio y responde. No contiene reglas de negocio. */
class AuthController(private val service: AuthService) {

    suspend fun checkEmail(call: ApplicationCall) =
        call.respond(service.checkEmail(call.receive<EmailRequest>()))

    suspend fun login(call: ApplicationCall) =
        call.respond(service.login(call.receive<LoginRequest>()))

    suspend fun register(call: ApplicationCall) =
        call.respond(HttpStatusCode.Created, service.register(call.receive<RegisterRequest>()))

    suspend fun sendRecoveryCode(call: ApplicationCall) =
        call.respond(service.sendRecoveryCode(call.receive<RecoveryRequest>()))

    suspend fun verifyRecoveryCode(call: ApplicationCall) =
        call.respond(service.verifyRecoveryCode(call.receive<VerifyCodeRequest>()))

    suspend fun resetPassword(call: ApplicationCall) =
        call.respond(service.resetPassword(call.receive<ResetPasswordRequest>()))
}
