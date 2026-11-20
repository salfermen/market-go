package com.marketgo.config

import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import kotlinx.serialization.json.Json

// Configuración JSON compartida por las respuestas HTTP y el mapeo con Firestore
val AppJson = Json {
    ignoreUnknownKeys = true   // la app puede enviar campos de más (p. ej. el producto completo del carrito)
    encodeDefaults = true      // siempre se envían todos los campos, aunque tengan su valor por defecto
    explicitNulls = true
    coerceInputValues = true
}

fun Application.configureSerialization() {
    install(ContentNegotiation) {
        json(AppJson)
    }
}
