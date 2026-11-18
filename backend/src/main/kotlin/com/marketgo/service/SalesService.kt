package com.marketgo.service

import com.marketgo.models.*
import com.marketgo.repository.OrderRepository
import com.marketgo.utils.Dates
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.YearMonth
import kotlin.math.round

/**
 * Indicadores del panel del vendedor, calculados a partir de los pedidos guardados en Firestore.
 * Solo se cuentan los productos de la tienda (un pedido puede tener productos de varias tiendas).
 */
class SalesService(
    private val orders: OrderRepository,
    private val storeService: StoreService,
) {
    private data class Sale(val date: LocalDate, val amount: Long, val units: Map<String, Int>)

    suspend fun summary(storeId: String, userId: String): SalesSummary {
        storeService.requireOwner(storeId, userId)
        val today = Dates.today()

        val sales = orders.findByStore(storeId).map { order ->
            val mine = order.items.filter { it.storeId == storeId }
            Sale(
                date = Dates.parseDate(order.date),
                amount = mine.sumOf { it.price * it.quantity },
                units = mine.groupBy { it.subcategory.ifBlank { "Otros" } }.mapValues { (_, l) -> l.sumOf { it.quantity } },
            )
        }

        // Últimos 7 días (hoy incluido)
        val weekly = (6 downTo 0).map { back ->
            val day = today.minusDays(back.toLong())
            ChartPoint(DAY_LABELS.getValue(day.dayOfWeek), sales.filter { it.date == day }.sumOf { it.amount })
        }

        // Últimos 6 meses (el actual incluido)
        val monthly = (5 downTo 0).map { back ->
            val month = YearMonth.from(today).minusMonths(back.toLong())
            ChartPoint(MONTH_LABELS[month.monthValue - 1], sales.filter { YearMonth.from(it.date) == month }.sumOf { it.amount })
        }

        // Porcentaje de unidades vendidas por subcategoría (top 4 + "Otros")
        val units = sales.flatMap { it.units.entries }.groupBy({ it.key }, { it.value }).mapValues { it.value.sum() }
        val totalUnits = units.values.sum()
        val ranked = units.entries.sortedByDescending { it.value }
        val top = if (ranked.size > 5) ranked.take(4) else ranked
        val byCategory = buildList {
            top.forEach { add(ChartPoint(it.key, percent(it.value, totalUnits))) }
            if (ranked.size > 5) add(ChartPoint("Otros", percent(ranked.drop(4).sumOf { it.value }, totalUnits)))
        }

        // Totales: últimos 30 días comparados con los 30 anteriores
        val current = sales.filter { it.date > today.minusDays(30) }
        val previous = sales.filter { it.date <= today.minusDays(30) && it.date > today.minusDays(60) }
        val revenue = current.sumOf { it.amount }
        val count = current.size

        return SalesSummary(
            weekly = weekly,
            monthly = monthly,
            byCategory = byCategory,
            totals = SalesTotals(
                revenue = revenue,
                orders = count,
                revenueChange = change(revenue.toDouble(), previous.sumOf { it.amount }.toDouble()),
                ordersChange = change(count.toDouble(), previous.size.toDouble()),
                avgTicket = if (count == 0) 0 else revenue / count,
                conversion = 0.0, // requiere registrar visitas a los productos (pendiente)
            ),
        )
    }

    private fun percent(part: Int, total: Int): Long = if (total == 0) 0 else Math.round(part * 100.0 / total)

    private fun change(current: Double, previous: Double): Double = when {
        previous == 0.0 && current == 0.0 -> 0.0
        previous == 0.0 -> 100.0
        else -> round((current - previous) / previous * 1000) / 10
    }

    companion object {
        private val DAY_LABELS = mapOf(
            DayOfWeek.MONDAY to "Lun", DayOfWeek.TUESDAY to "Mar", DayOfWeek.WEDNESDAY to "Mié",
            DayOfWeek.THURSDAY to "Jue", DayOfWeek.FRIDAY to "Vie", DayOfWeek.SATURDAY to "Sáb", DayOfWeek.SUNDAY to "Dom",
        )
        private val MONTH_LABELS = listOf("Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic")
    }
}
