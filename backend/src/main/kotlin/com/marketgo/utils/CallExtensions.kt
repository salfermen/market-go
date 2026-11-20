package com.marketgo.utils

import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*

/** Id del usuario autenticado (viene en el token JWT). */
fun ApplicationCall.userId(): String =
    principal<JWTPrincipal>()?.payload?.getClaim("userId")?.asString()
        ?: throw Unauthorized("Debes iniciar sesión")

/** Id del usuario si la petición trae un token válido (rutas con autenticación opcional). */
fun ApplicationCall.userIdOrNull(): String? =
    principal<JWTPrincipal>()?.payload?.getClaim("userId")?.asString()

/** Parámetro de ruta obligatorio, p. ej. {id} en /products/{id}. */
fun ApplicationCall.pathParam(name: String): String =
    parameters[name]?.takeIf { it.isNotBlank() } ?: throw BadRequest("Falta el parámetro $name")
