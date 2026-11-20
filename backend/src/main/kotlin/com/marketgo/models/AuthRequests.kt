package com.marketgo.models

import kotlinx.serialization.Serializable

@Serializable
data class EmailRequest(val email: String? = null)

@Serializable
data class LoginRequest(val email: String? = null, val password: String? = null)

@Serializable
data class RegisterRequest(
    val name: String? = null,
    val email: String? = null,
    val password: String? = null,
    val phone: String? = null,
)

@Serializable
data class RecoveryRequest(val email: String? = null, val method: String = "email")

@Serializable
data class VerifyCodeRequest(val email: String? = null, val code: String? = null)

@Serializable
data class ResetPasswordRequest(val email: String? = null, val password: String? = null)

@Serializable
data class UpdateProfileRequest(
    val name: String? = null,
    val email: String? = null,
    val phone: String? = null,
)

@Serializable
data class CreateStoreRequest(val name: String? = null, val city: String? = null, val description: String? = null)
