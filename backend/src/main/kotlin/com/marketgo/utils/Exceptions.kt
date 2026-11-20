package com.marketgo.utils

import io.ktor.http.*

// Error controlado: StatusPages lo convierte en { "message": ... } con el código HTTP indicado
open class ApiException(val status: HttpStatusCode, override val message: String) : RuntimeException(message)

class BadRequest(message: String) : ApiException(HttpStatusCode.BadRequest, message)
class Unauthorized(message: String) : ApiException(HttpStatusCode.Unauthorized, message)
class Forbidden(message: String = "No tienes permiso para realizar esta acción") : ApiException(HttpStatusCode.Forbidden, message)
class NotFound(message: String) : ApiException(HttpStatusCode.NotFound, message)
class Conflict(message: String) : ApiException(HttpStatusCode.Conflict, message)
