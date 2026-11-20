package com.marketgo.models

import kotlinx.serialization.Serializable

/**
 * Estados del pedido.
 * La app los nombra distinto según quién mira:
 *   cliente:  paid → packed → shipped → delivered
 *   vendedor: new  → preparing → shipped → delivered
 * En Firestore se guarda la versión del cliente; OrderService traduce para el vendedor.
 */
object OrderStatus {
    val CLIENT_FLOW = listOf("paid", "packed", "shipped", "delivered")
    val SELLER_FLOW = listOf("new", "preparing", "shipped", "delivered")

    private val SELLER_LABELS = mapOf(
        "new" to "Nuevo", "preparing" to "En preparación", "shipped" to "Enviado", "delivered" to "Entregado",
    )

    fun toSeller(status: String) = SELLER_FLOW.getOrElse(CLIENT_FLOW.indexOf(status)) { status }
    fun sellerLabel(status: String) = SELLER_LABELS[toSeller(status)] ?: status
    fun fromSeller(status: String) = CLIENT_FLOW.getOrNull(SELLER_FLOW.indexOf(status))
}

/** Línea del pedido: guarda una "foto" del producto para que el historial no cambie si se edita. */
@Serializable
data class OrderItem(
    val productId: String = "",
    val name: String = "",
    val icon: String? = null,
    val tone: String? = null,
    val storeId: String = "",
    val subcategory: String = "",
    val quantity: Int = 1,
    val price: Long = 0,
    val color: String? = null,
    val size: String? = null,
)

/** Pedido (colección "orders"). Es lo que recibe el cliente en GET /orders/me y POST /orders. */
@Serializable
data class Order(
    val id: String = "",
    val userId: String = "",
    val customer: String = "",
    val city: String = "",
    val date: String = "",
    val createdAt: String = "",
    val status: String = "paid",
    val tracking: String = "",
    val items: List<OrderItem> = emptyList(),
    val subtotal: Long = 0,
    val discount: Long = 0,
    val shipping: Long = 0,
    val total: Long = 0,
    val address: String = "",
    val paymentMethod: String = "",
    val shippingMethod: String = "standard",
    val voucherCode: String? = null,
    val reviewed: Boolean = false,
    /** Tiendas involucradas: permite consultar "los pedidos de mi tienda" con un solo filtro. */
    val storeIds: List<String> = emptyList(),
)

/** Pedido visto por el vendedor (GET /stores/{id}/orders): solo sus productos y su total. */
@Serializable
data class SellerOrder(
    val id: String,
    val customer: String,
    val city: String,
    val date: String,
    val status: String,
    val items: List<OrderItem>,
    val total: Long,
)

// ---- Peticiones ----

@Serializable
data class ProductRef(val id: String = "")

/**
 * Ítem del carrito tal como lo envía Payment.js: { product: {...}, quantity, color, size }.
 * También se acepta { productId, quantity } para probar desde Postman.
 */
@Serializable
data class CartItemRequest(
    val product: ProductRef? = null,
    val productId: String? = null,
    val quantity: Int = 1,
    val color: String? = null,
    val size: String? = null,
) {
    fun resolvedProductId(): String? = productId ?: product?.id
}

@Serializable
data class AddressRequest(
    val fullName: String? = null,
    val phone: String? = null,
    val city: String? = null,
    val address: String? = null,
)

@Serializable
data class CreateOrderRequest(
    val items: List<CartItemRequest> = emptyList(),
    val address: AddressRequest? = null,
    val shippingMethod: String = "standard",
    val paymentMethod: String = "card",
    val voucherCode: String? = null,
)

@Serializable
data class UpdateOrderStatusRequest(val status: String? = null)
