package com.marketgo

import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import kotlinx.serialization.json.*
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import kotlin.test.*

/**
 * Pruebas de integración contra el emulador de Firestore.
 *
 *   firebase emulators:start --only firestore --project marketgo-test
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8085 ./gradlew test
 *
 * Si FIRESTORE_EMULATOR_HOST no está definido, las pruebas se omiten (nunca tocan la base real).
 */
class ApiTest {
    private val emulator: String? = System.getenv("FIRESTORE_EMULATOR_HOST")
    private val project = System.getenv("GOOGLE_CLOUD_PROJECT") ?: "marketgo-test"

    @BeforeTest
    fun clearEmulator() {
        if (emulator == null) return
        // Borra todos los documentos del emulador para empezar cada prueba con los datos de demostración
        val request = HttpRequest.newBuilder(
            URI("http://$emulator/emulator/v1/projects/$project/databases/(default)/documents")
        ).DELETE().build()
        HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.discarding())
    }

    private fun apiTest(block: suspend ApplicationTestBuilder.() -> Unit) {
        if (emulator == null) {
            println("FIRESTORE_EMULATOR_HOST no está definido: se omite la prueba")
            return
        }
        testApplication {
            configure("application.yaml")
            block()
        }
    }

    private suspend fun ApplicationTestBuilder.call(
        method: HttpMethod, path: String, body: String? = null, token: String? = null,
    ): Pair<HttpStatusCode, JsonElement> {
        val response = client.request("/api$path") {
            this.method = method
            if (body != null) {
                contentType(ContentType.Application.Json)
                setBody(body)
            }
            if (token != null) bearerAuth(token)
        }
        return response.status to Json.parseToJsonElement(response.bodyAsText())
    }

    private suspend fun ApplicationTestBuilder.login(email: String): String {
        val (status, json) = call(HttpMethod.Post, "/auth/login", """{"email":"$email","password":"Market123"}""")
        assertEquals(HttpStatusCode.OK, status)
        return json.jsonObject["token"]!!.jsonPrimitive.content
    }

    private val JsonElement.obj get() = jsonObject
    private fun JsonElement.str(key: String) = jsonObject[key]!!.jsonPrimitive.content
    private fun JsonElement.long(key: String) = jsonObject[key]!!.jsonPrimitive.long

    @Test
    fun `login con usuario demo y clave incorrecta`() = apiTest {
        val (ok, session) = call(HttpMethod.Post, "/auth/login", """{"email":"ramona@marketgo.co","password":"Market123"}""")
        assertEquals(HttpStatusCode.OK, ok)
        assertEquals("s1", session.obj["user"]!!.str("storeId"))
        assertNull(session.obj["user"]!!.obj["passwordHash"], "nunca se envía el hash de la contraseña")

        val (bad, error) = call(HttpMethod.Post, "/auth/login", """{"email":"ramona@marketgo.co","password":"otra"}""")
        assertEquals(HttpStatusCode.Unauthorized, bad)
        assertEquals("Contraseña incorrecta", error.str("message"))
    }

    @Test
    fun `catalogo con filtros y detalle con tienda`() = apiTest {
        val (_, all) = call(HttpMethod.Get, "/products")
        assertEquals(18, all.jsonArray.size)

        val (_, shoes) = call(HttpMethod.Get, "/products?category=zapatos&sort=price_asc")
        assertEquals(listOf("p13", "p5", "p6"), shoes.jsonArray.map { it.str("id") })

        val (_, detail) = call(HttpMethod.Get, "/products/p1")
        assertEquals("Moda Ramona", detail.obj["store"]!!.str("name"))
    }

    @Test
    fun `compra completa con totales stock cupon y vista del vendedor`() = apiTest {
        val juan = login("juan@marketgo.co")
        val ramona = login("ramona@marketgo.co")

        val order = """
            {"items":[{"product":{"id":"p2"},"quantity":2,"color":"Negro"},{"product":{"id":"p7"},"quantity":1}],
             "address":{"fullName":"Juan Pérez","city":"Cali","address":"Cl 5 # 1-2"},
             "shippingMethod":"express","paymentMethod":"card","voucherCode":"BIENVENIDO10"}
        """
        val (created, json) = call(HttpMethod.Post, "/orders", order, juan)
        assertEquals(HttpStatusCode.Created, created)
        assertEquals("MG-1049", json.str("id"))
        assertEquals(59900L * 2 + 159900, json.long("subtotal"))
        assertEquals(10000L, json.long("discount"))
        assertEquals(12000L, json.long("shipping"))
        assertEquals(279700L - 10000 + 12000, json.long("total"))

        val (_, p2) = call(HttpMethod.Get, "/products/p2")
        assertEquals(20L, p2.long("stock"))

        // El vendedor de s1 solo ve sus productos del pedido
        val (_, sellerOrders) = call(HttpMethod.Get, "/stores/s1/orders", token = ramona)
        val mine = sellerOrders.jsonArray.first { it.str("id") == "MG-1049" }
        assertEquals("new", mine.str("status"))
        assertEquals(119800L, mine.long("total"))

        val (advanced, updated) = call(HttpMethod.Patch, "/orders/MG-1049/status", """{"status":"preparing"}""", ramona)
        assertEquals(HttpStatusCode.OK, advanced)
        assertEquals("preparing", updated.str("status"))

        // El cliente ve el mismo pedido como "packed"
        val (_, myOrders) = call(HttpMethod.Get, "/orders/me", token = juan)
        assertEquals("packed", myOrders.jsonArray.first { it.str("id") == "MG-1049" }.str("status"))
    }

    @Test
    fun `no se puede comprar sin stock ni administrar tiendas ajenas`() = apiTest {
        val juan = login("juan@marketgo.co")
        val noStock = """{"items":[{"productId":"p12","quantity":1}],"address":{"city":"Cali","address":"x"}}"""
        assertEquals(HttpStatusCode.Conflict, call(HttpMethod.Post, "/orders", noStock, juan).first)
        assertEquals(HttpStatusCode.Forbidden, call(HttpMethod.Get, "/stores/s1/orders", token = juan).first)
        assertEquals(HttpStatusCode.Unauthorized, call(HttpMethod.Get, "/orders/me").first)
    }
}
