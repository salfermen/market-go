package com.marketgo.models

import kotlinx.serialization.Serializable

@Serializable
data class ChartPoint(val label: String, val value: Long)

@Serializable
data class SalesTotals(
    val revenue: Long,
    val orders: Int,
    val revenueChange: Double,
    val ordersChange: Double,
    val avgTicket: Long,
    val conversion: Double,
)

/** GET /stores/{id}/sales — misma forma que getSalesSummary() en orders.api.js. */
@Serializable
data class SalesSummary(
    val weekly: List<ChartPoint>,
    val monthly: List<ChartPoint>,
    val byCategory: List<ChartPoint>,
    val totals: SalesTotals,
)
