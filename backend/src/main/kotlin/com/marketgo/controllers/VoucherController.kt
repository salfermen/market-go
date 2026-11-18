package com.marketgo.controllers

import com.marketgo.service.VoucherService
import com.marketgo.utils.pathParam
import io.ktor.server.application.*
import io.ktor.server.response.*

class VoucherController(private val service: VoucherService) {

    suspend fun list(call: ApplicationCall) = call.respond(service.list())

    suspend fun get(call: ApplicationCall) = call.respond(service.getByCode(call.pathParam("code")))
}
