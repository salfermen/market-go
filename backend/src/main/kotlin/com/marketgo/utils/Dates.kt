package com.marketgo.utils

import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter

object Dates {
    val ZONE: ZoneId = ZoneId.of("America/Bogota")
    private val DATE_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss")

    fun today(): LocalDate = LocalDate.now(ZONE)
    fun now(): LocalDateTime = LocalDateTime.now(ZONE).withNano(0)

    /** "2026-10-19" — formato de las fechas de pedidos y reseñas en la app */
    fun todayString(): String = today().toString()

    /** "2026-10-19T10:42:05" — fecha y hora completas (createdAt). La app del vendedor usa los primeros 16 caracteres. */
    fun nowString(): String = now().format(DATE_TIME)

    fun format(dateTime: LocalDateTime): String = dateTime.format(DATE_TIME)

    fun parseDate(value: String): LocalDate = LocalDate.parse(value.take(10))
}
