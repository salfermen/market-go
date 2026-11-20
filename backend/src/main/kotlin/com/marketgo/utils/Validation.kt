package com.marketgo.utils

// Mismas reglas que src/utils/validations.js de la app: el backend también debe validar.
object Validation {
    private val EMAIL = Regex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$")
    private val PHONE = Regex("^3\\d{9}$")

    fun normalizeEmail(email: String) = email.trim().lowercase()

    fun requireEmail(email: String?) {
        if (email.isNullOrBlank()) throw BadRequest("Ingresa tu correo electrónico")
        if (!EMAIL.matches(email.trim())) throw BadRequest("El correo no tiene un formato válido")
    }

    fun requirePhone(phone: String?) {
        if (phone.isNullOrBlank() || !PHONE.matches(phone.replace(" ", ""))) {
            throw BadRequest("El celular debe tener 10 dígitos y empezar por 3")
        }
    }

    fun requirePassword(password: String?) {
        val value = password.orEmpty()
        val error = when {
            value.length < 8 -> "La contraseña debe tener mínimo 8 caracteres"
            !value.any { it.isUpperCase() } -> "La contraseña debe incluir al menos una mayúscula"
            !value.any { it.isLowerCase() } -> "La contraseña debe incluir al menos una minúscula"
            !value.any { it.isDigit() } -> "La contraseña debe incluir al menos un número"
            else -> null
        }
        if (error != null) throw BadRequest(error)
    }

    fun requireText(value: String?, message: String): String {
        if (value.isNullOrBlank()) throw BadRequest(message)
        return value.trim()
    }
}
