package com.marketgo.models

import kotlinx.serialization.Serializable

/** Tienda / emprendimiento (colección "stores"). */
@Serializable
data class Store(
    val id: String = "",
    val name: String = "",
    val owner: String = "",
    val ownerId: String? = null,
    val city: String = "Bogotá",
    val rating: Double = 0.0,
    val followers: Int = 0,
    val description: String = "Nueva tienda en MarketGO.",
)
