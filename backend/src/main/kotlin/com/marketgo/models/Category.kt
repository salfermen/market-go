package com.marketgo.models

import kotlinx.serialization.Serializable

/** Categoría (colección "categories"). icon = nombre del ícono de lucide en la app. */
@Serializable
data class Category(
    val id: String = "",
    val name: String = "",
    val icon: String = "Package",
    val tone: String = "#EDE9FE",
    val count: Int = 0,
    /** Orden en que se muestran en la app */
    val position: Int = 0,
)
