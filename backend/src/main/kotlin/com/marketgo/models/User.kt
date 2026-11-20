package com.marketgo.models

import kotlinx.serialization.Serializable

/** Documento de la colección "users". Incluye el hash de la contraseña: nunca se envía a la app. */
@Serializable
data class User(
    val id: String = "",
    val name: String = "",
    val email: String = "",
    val phone: String = "",
    val passwordHash: String = "",
    val points: Int = 0,
    val storeId: String? = null,
    val createdAt: String = "",
) {
    fun toPublic() = PublicUser(id, name, email, phone, points, storeId)
}

/** Lo que la app recibe como "user" (igual a toPublicUser() de auth.api.js). */
@Serializable
data class PublicUser(
    val id: String,
    val name: String,
    val email: String,
    val phone: String,
    val points: Int,
    val storeId: String?,
)

@Serializable
data class AuthResponse(val user: PublicUser, val token: String)

@Serializable
data class CheckEmailResponse(val name: String)

@Serializable
data class DestinationResponse(val destination: String)

@Serializable
data class OkResponse(val ok: Boolean = true)

@Serializable
data class ErrorResponse(val message: String)

/** Código de recuperación de contraseña (colección "recoveryCodes", id = correo). */
@Serializable
data class RecoveryCode(
    val id: String = "",
    val code: String = "",
    val expiresAt: Long = 0,
    val verified: Boolean = false,
    val attempts: Int = 0,
)
