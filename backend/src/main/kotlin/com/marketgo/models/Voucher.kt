package com.marketgo.models

import kotlinx.serialization.Serializable

/** Cupón (colección "vouchers"). type: "percent" | "amount" | "shipping". */
@Serializable
data class Voucher(
    val id: String = "",
    val code: String = "",
    val title: String = "",
    val description: String = "",
    val type: String = "percent",
    val value: Long = 0,
    val minPurchase: Long = 0,
    val expires: String = "",
)
