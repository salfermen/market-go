package com.marketgo.seed

import com.marketgo.config.AppContainer
import com.marketgo.config.AppJson
import com.marketgo.models.*
import com.marketgo.service.AuthService
import com.marketgo.utils.Dates
import com.marketgo.utils.await
import kotlinx.serialization.Serializable
import org.slf4j.LoggerFactory
import java.time.LocalDate
import java.time.temporal.ChronoUnit

/**
 * Carga en Firestore los mismos datos de demostración que tenía la app en src/data/mockData.js
 * (archivo resources/seed/marketgo-seed.json). Solo se ejecuta si la colección "users" está vacía,
 * así que no borra ni duplica nada en una base que ya tiene datos.
 *
 * Las fechas de los pedidos se corren para que el más reciente sea "ayer": así las gráficas
 * del panel del vendedor (últimos 7 días / 30 días) muestran información desde el primer día.
 */
class DatabaseSeeder(private val c: AppContainer) {
    private val log = LoggerFactory.getLogger(DatabaseSeeder::class.java)

    @Serializable
    private data class SeedUser(
        val id: String, val name: String, val email: String, val phone: String,
        val password: String, val points: Int, val storeId: String? = null,
    )

    @Serializable
    private data class SeedItem(val productId: String, val quantity: Int, val price: Long)

    @Serializable
    private data class SeedOrder(
        val id: String, val date: String, val status: String, val items: List<SeedItem>, val total: Long,
        val tracking: String = "", val shipping: Long = 0, val address: String = "", val reviewed: Boolean = false,
        val userId: String = "", val customer: String = "", val city: String = "",
    )

    @Serializable
    private data class SeedFile(
        val categories: List<Category>, val stores: List<Store>, val users: List<SeedUser>,
        val products: List<Product>, val reviews: List<Review>, val vouchers: List<Voucher>,
        val clientOrders: List<SeedOrder>, val sellerOrders: List<SeedOrder>,
    )

    suspend fun seedIfEmpty() {
        if (!c.userRepository.isEmpty()) {
            log.info("Firestore ya tiene datos: no se cargan los datos de demostración")
            return
        }
        val text = javaClass.getResourceAsStream("/seed/marketgo-seed.json")!!.bufferedReader().use { it.readText() }
        val seed = AppJson.decodeFromString(SeedFile.serializer(), text)
        val now = Dates.nowString()
        val batch = c.firestore.batch()

        seed.categories.forEach { batch.set(c.categoryRepository.ref(it.id), c.categoryRepository.toMap(it)) }
        seed.stores.forEach { batch.set(c.storeRepository.ref(it.id), c.storeRepository.toMap(it)) }
        seed.products.forEach { batch.set(c.productRepository.ref(it.id), c.productRepository.toMap(it.copy(createdAt = now))) }
        seed.reviews.forEach { batch.set(c.reviewRepository.ref(it.id), c.reviewRepository.toMap(it)) }
        seed.vouchers.forEach { batch.set(c.voucherRepository.ref(it.id), c.voucherRepository.toMap(it)) }
        seed.users.forEach { u ->
            val user = User(
                id = u.id, name = u.name, email = u.email, phone = u.phone,
                passwordHash = AuthService.hashPassword(u.password), points = u.points,
                storeId = u.storeId, createdAt = now,
            )
            batch.set(c.userRepository.ref(u.id), c.userRepository.toMap(user))
        }

        // Pedidos: los del cliente (ya en estados paid/shipped/...) y los del vendedor (new/preparing/...)
        val products = seed.products.associateBy { it.id }
        val allOrders = seed.clientOrders.map { it to false } + seed.sellerOrders.map { it to true }
        val newest = allOrders.maxOf { LocalDate.parse(it.first.date.take(10)) }
        val shiftDays = ChronoUnit.DAYS.between(newest, Dates.today().minusDays(1))

        allOrders.forEach { (o, fromSeller) ->
            val day = LocalDate.parse(o.date.take(10)).plusDays(shiftDays)
            val time = if (o.date.length > 10) o.date.substring(11).padEnd(8, ':').replace(Regex(":$"), ":00").take(8) else "12:00:00"
            val items = o.items.map { i ->
                val p = products.getValue(i.productId)
                OrderItem(
                    productId = p.id, name = p.name, icon = p.icon, tone = p.tone, storeId = p.storeId,
                    subcategory = p.subcategory, quantity = i.quantity, price = i.price,
                )
            }
            val subtotal = items.sumOf { it.price * it.quantity }
            val order = Order(
                id = o.id,
                userId = o.userId,
                customer = o.customer,
                city = o.city,
                date = day.toString(),
                createdAt = "${day}T$time",
                status = if (fromSeller) OrderStatus.fromSeller(o.status) ?: "paid" else o.status,
                tracking = o.tracking.ifBlank { "LGS-9202783${o.id.takeLast(4)}00" },
                items = items,
                subtotal = subtotal,
                shipping = o.shipping,
                total = o.total,
                address = o.address.ifBlank { o.city },
                paymentMethod = "card",
                reviewed = o.reviewed,
                storeIds = items.map { it.storeId }.distinct(),
            )
            batch.set(c.orderRepository.ref(o.id), c.orderRepository.toMap(order))
        }
        val lastNumber = allOrders.maxOf { it.first.id.removePrefix("MG-").toLong() }
        batch.set(c.orderRepository.counterRef, mapOf("value" to lastNumber))

        batch.commit().await()
        log.info(
            "Datos de demostración cargados: ${seed.users.size} usuarios, ${seed.stores.size} tiendas, " +
                "${seed.products.size} productos, ${allOrders.size} pedidos"
        )
    }
}
