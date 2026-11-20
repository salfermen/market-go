package com.marketgo.config

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.marketgo.models.ErrorResponse
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.config.*
import io.ktor.server.response.*
import java.util.Date

const val AUTH_JWT = "auth-jwt"

data class JwtConfig(
    val secret: String,
    val issuer: String,
    val audience: String,
    val realm: String,
    val expiresInDays: Long,
) {
    private val algorithm = Algorithm.HMAC256(secret)

    val verifier = JWT.require(algorithm).withIssuer(issuer).withAudience(audience).build()

    // El token lleva el id del usuario; el backend identifica al usuario solo por el token
    fun createToken(userId: String): String = JWT.create()
        .withIssuer(issuer)
        .withAudience(audience)
        .withClaim("userId", userId)
        .withExpiresAt(Date(System.currentTimeMillis() + expiresInDays * 24 * 60 * 60 * 1000))
        .sign(algorithm)

    companion object {
        fun from(config: ApplicationConfig) = JwtConfig(
            secret = config.property("jwt.secret").getString(),
            issuer = config.property("jwt.issuer").getString(),
            audience = config.property("jwt.audience").getString(),
            realm = config.property("jwt.realm").getString(),
            expiresInDays = config.property("jwt.expiresInDays").getString().toLong(),
        )
    }
}

fun Application.configureSecurity(jwt: JwtConfig) {
    install(Authentication) {
        jwt(AUTH_JWT) {
            realm = jwt.realm
            verifier(jwt.verifier)
            validate { credential ->
                credential.payload.getClaim("userId").asString()?.let { JWTPrincipal(credential.payload) }
            }
            challenge { _, _ ->
                call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Tu sesión expiró, vuelve a iniciar sesión"))
            }
        }
    }
}
