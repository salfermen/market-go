package com.marketgo.config

import com.marketgo.models.ErrorResponse
import com.marketgo.utils.ApiException
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*

/**
 * Convierte cualquier error en una respuesta JSON { "message": "..." }.
 * La app (src/api/client.js) muestra ese mensaje al usuario.
 */
fun Application.configureErrorHandling() {
    install(StatusPages) {
        exception<ApiException> { call, cause ->
            call.respond(cause.status, ErrorResponse(cause.message))
        }
        exception<BadRequestException> { call, cause ->
            this@configureErrorHandling.log.warn("Petición inválida: ${cause.cause?.message ?: cause.message}")
            call.respond(HttpStatusCode.BadRequest, ErrorResponse("Los datos enviados no son válidos"))
        }
        exception<Throwable> { call, cause ->
            this@configureErrorHandling.log.error("Error no controlado", cause)
            call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Ocurrió un error en el servidor"))
        }
        status(HttpStatusCode.NotFound) { call, status ->
            call.respond(status, ErrorResponse("Ruta no encontrada"))
        }
    }
}
