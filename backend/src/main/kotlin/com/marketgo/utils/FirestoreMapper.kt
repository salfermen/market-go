package com.marketgo.utils

import com.google.api.core.ApiFuture
import com.google.cloud.Timestamp
import com.google.cloud.firestore.DocumentSnapshot
import com.marketgo.config.AppJson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.KSerializer
import kotlinx.serialization.json.*
import java.util.concurrent.ExecutionException
import kotlin.math.abs
import kotlin.math.floor

/**
 * Convierte modelos @Serializable <-> Map<String, Any?> de Firestore.
 *
 * Se apoya en kotlinx.serialization (la misma configuración que las respuestas HTTP), así
 * no hay que escribir a mano "nombre = data["nombre"] as String" para cada campo como en
 * TiendaMaria, y un campo faltante en Firestore toma su valor por defecto en vez de fallar.
 */
object FirestoreMapper {

    /** Modelo -> Map para guardar. "id" y los campos de [exclude] no se guardan dentro del documento. */
    fun <T> toMap(serializer: KSerializer<T>, value: T, exclude: Set<String> = emptySet()): Map<String, Any?> {
        val obj = AppJson.encodeToJsonElement(serializer, value).jsonObject
        return obj.filterKeys { it != "id" && it !in exclude }.mapValues { (_, v) -> v.toPlain() }
    }

    /** Documento de Firestore -> modelo. El id del documento se copia en el campo "id". */
    fun <T> fromDocument(serializer: KSerializer<T>, doc: DocumentSnapshot): T? {
        val data = doc.data ?: return null
        val obj = JsonObject(data.mapValues { (_, v) -> v.toJsonElement() } + ("id" to JsonPrimitive(doc.id)))
        return AppJson.decodeFromJsonElement(serializer, obj)
    }

    fun JsonElement.toPlain(): Any? = when (this) {
        JsonNull -> null
        is JsonPrimitive -> when {
            isString -> content
            booleanOrNull != null -> boolean
            longOrNull != null -> long
            else -> double
        }
        is JsonObject -> mapValues { (_, v) -> v.toPlain() }
        is JsonArray -> map { it.toPlain() }
    }

    fun Any?.toJsonElement(): JsonElement = when (this) {
        null -> JsonNull
        is String -> JsonPrimitive(this)
        is Boolean -> JsonPrimitive(this)
        // Firestore devuelve Double para 5.0: se pasa a entero para que también encaje en campos Long/Int
        is Double -> if (floor(this) == this && abs(this) < 1e15) JsonPrimitive(toLong()) else JsonPrimitive(this)
        is Float -> toDouble().toJsonElement()
        is Number -> JsonPrimitive(toLong())
        is Map<*, *> -> JsonObject(entries.associate { (k, v) -> k.toString() to v.toJsonElement() })
        is List<*> -> JsonArray(map { it.toJsonElement() })
        is Timestamp -> JsonPrimitive(toDate().toInstant().toString())
        else -> JsonPrimitive(toString())
    }
}

/**
 * Las llamadas de Firestore devuelven ApiFuture y .get() bloquea el hilo.
 * await() hace la espera en el pool de I/O para no bloquear los hilos de Ktor.
 */
suspend fun <T> ApiFuture<T>.await(): T = withContext(Dispatchers.IO) {
    try {
        get()
    } catch (e: ExecutionException) {
        // Los errores lanzados dentro de una transacción llegan envueltos: se entrega el original
        throw e.cause ?: e
    }
}
