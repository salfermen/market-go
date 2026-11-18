package com.marketgo.service

import com.google.cloud.firestore.FieldValue
import com.google.cloud.firestore.Firestore
import com.marketgo.models.*
import com.marketgo.repository.OrderRepository
import com.marketgo.repository.ProductRepository
import com.marketgo.repository.UserRepository
import com.marketgo.utils.*
import java.security.SecureRandom

class OrderService(
    private val db: Firestore,
    private val orders: OrderRepository,
    private val products: ProductRepository,
    private val users: UserRepository,
    private val voucherService: VoucherService,
    private val storeService: StoreService,
) {
    private val random = SecureRandom()

    // ---------------------------------------------------------------- Cliente

    suspend fun getMyOrders(userId: String): List<Order> =
        orders.findByUser(userId).sortedByDescending { it.createdAt }

    /**
     * Crea el pedido. Los precios y el total se calculan aquí con los datos de Firestore
     * (nunca se confía en el total que envía la app). En una sola transacción:
     * valida stock, descuenta unidades, suma vendidos, genera el número MG-xxxx y suma puntos.
     */
    suspend fun createOrder(userId: String, req: CreateOrderRequest): Order {
        if (req.items.isEmpty()) throw BadRequest("Tu carrito está vacío")
        if (req.items.any { it.quantity < 1 }) throw BadRequest("Las cantidades deben ser mayores a cero")
        val productIds = req.items.map { it.resolvedProductId() ?: throw BadRequest("Falta el producto en un ítem") }

        val address = req.address ?: throw BadRequest("Elige una dirección de entrega")
        val street = Validation.requireText(address.address, "Ingresa la dirección de entrega")
        val city = Validation.requireText(address.city, "Ingresa la ciudad de entrega")

        val baseShipping = SHIPPING_COST[req.shippingMethod] ?: throw BadRequest("Método de envío no válido")
        if (req.paymentMethod !in PAYMENT_METHODS) throw BadRequest("Método de pago no válido")
        val voucher = req.voucherCode?.takeIf { it.isNotBlank() }?.let { voucherService.requireUsable(it) }

        return db.runTransaction { tx ->
            // 1) Lecturas (Firestore exige leer todo antes de escribir)
            val productDocs = productIds.distinct().associateWith { tx.get(products.ref(it)).get() }
            val userDoc = tx.get(users.ref(userId)).get()
            val counterDoc = tx.get(orders.counterRef).get()

            val user = users.fromDocument(userDoc) ?: throw NotFound("Usuario no encontrado")
            val catalog = productDocs.mapValues { (id, doc) ->
                products.fromDocument(doc) ?: throw NotFound("El producto $id ya no existe")
            }

            // 2) Validar stock (sumando la misma referencia en distintos colores/tallas)
            val requested = req.items
                .groupBy { it.resolvedProductId()!! }
                .mapValues { (_, lines) -> lines.sumOf { it.quantity } }
            requested.forEach { (id, qty) ->
                val p = catalog.getValue(id)
                if (!p.active) throw Conflict("${p.name} ya no está disponible")
                if (p.stock < qty) throw Conflict("Solo quedan ${p.stock} unidades de ${p.name}")
            }

            // 3) Totales con los precios guardados en Firestore
            val items = req.items.map { item ->
                val p = catalog.getValue(item.resolvedProductId()!!)
                OrderItem(
                    productId = p.id, name = p.name, icon = p.icon, tone = p.tone, storeId = p.storeId,
                    subcategory = p.subcategory, quantity = item.quantity, price = p.price,
                    color = item.color, size = item.size,
                )
            }
            val subtotal = items.sumOf { it.price * it.quantity }
            var shipping = baseShipping
            var discount = 0L
            if (voucher != null) {
                if (subtotal < voucher.minPurchase) {
                    throw BadRequest("El cupón ${voucher.code} requiere una compra mínima de ${voucher.minPurchase} COP")
                }
                when (voucher.type) {
                    "percent" -> discount = Math.round(subtotal * voucher.value / 100.0)
                    "amount" -> discount = minOf(voucher.value, subtotal)
                    "shipping" -> shipping = 0
                }
            }
            val total = maxOf(0, subtotal - discount + shipping)

            val next = (counterDoc.getLong("value") ?: FIRST_ORDER_NUMBER) + 1
            val id = "MG-$next"
            val now = Dates.nowString()
            val newOrder = Order(
                id = id,
                userId = userId,
                customer = address.fullName?.trim()?.ifBlank { null } ?: user.name,
                city = city,
                date = now.take(10),
                createdAt = now,
                status = "paid",
                tracking = "LGS-" + (1..12).joinToString("") { random.nextInt(10).toString() },
                items = items,
                subtotal = subtotal,
                discount = discount,
                shipping = shipping,
                total = total,
                address = "$street, $city",
                paymentMethod = req.paymentMethod,
                shippingMethod = req.shippingMethod,
                voucherCode = voucher?.code,
                storeIds = items.map { it.storeId }.distinct(),
            )

            // 4) Escrituras
            requested.forEach { (pid, qty) ->
                tx.update(
                    products.ref(pid),
                    mapOf("stock" to FieldValue.increment(-qty.toLong()), "sold" to FieldValue.increment(qty.toLong())),
                )
            }
            tx.set(orders.counterRef, mapOf("value" to next))
            tx.set(orders.ref(id), orders.toMap(newOrder))
            tx.update(users.ref(userId), mapOf("points" to FieldValue.increment(total / 1000))) // 1 punto por cada $1.000
            newOrder
        }.await()
    }

    suspend fun markReviewed(orderId: String, userId: String): OkResponse {
        val order = orders.findById(orderId) ?: throw NotFound("Pedido no encontrado")
        if (order.userId != userId) throw Forbidden("Este pedido no te pertenece")
        orders.update(orderId, mapOf("reviewed" to true))
        return OkResponse()
    }

    // ---------------------------------------------------------------- Vendedor

    suspend fun getStoreOrders(storeId: String, userId: String): List<SellerOrder> {
        storeService.requireOwner(storeId, userId)
        return orders.findByStore(storeId).sortedByDescending { it.createdAt }.map { it.forSeller(storeId) }
    }

    /** El vendedor avanza el pedido: new → preparing → shipped → delivered (no se puede retroceder). */
    suspend fun updateStatus(orderId: String, userId: String, req: UpdateOrderStatusRequest): SellerOrder {
        val sellerStatus = req.status ?: throw BadRequest("Indica el nuevo estado")
        val newStatus = OrderStatus.fromSeller(sellerStatus) ?: throw BadRequest("Estado no válido: $sellerStatus")

        val order = orders.findById(orderId) ?: throw NotFound("Pedido no encontrado")
        val user = users.findById(userId) ?: throw NotFound("Usuario no encontrado")
        val storeId = user.storeId?.takeIf { it in order.storeIds } ?: throw Forbidden("Este pedido no es de tu tienda")

        val current = OrderStatus.CLIENT_FLOW.indexOf(order.status)
        if (OrderStatus.CLIENT_FLOW.indexOf(newStatus) <= current) {
            throw BadRequest("El pedido ya está en estado \"${OrderStatus.sellerLabel(order.status)}\"")
        }
        orders.update(orderId, mapOf("status" to newStatus))
        return order.copy(status = newStatus).forSeller(storeId)
    }

    private fun Order.forSeller(storeId: String): SellerOrder {
        val mine = items.filter { it.storeId == storeId }
        return SellerOrder(
            id = id,
            customer = customer,
            city = city,
            date = createdAt.take(16).ifBlank { date },
            status = OrderStatus.toSeller(status),
            items = mine,
            total = mine.sumOf { it.price * it.quantity },
        )
    }

    companion object {
        private const val FIRST_ORDER_NUMBER = 1048L
        val SHIPPING_COST = mapOf("standard" to 0L, "express" to 12000L)
        val PAYMENT_METHODS = setOf("card", "pse", "nequi", "cash")
    }
}
