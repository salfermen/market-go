package com.marketgo.service

import com.marketgo.models.*
import com.marketgo.repository.ProductRepository
import com.marketgo.repository.StoreRepository
import com.marketgo.repository.UserRepository
import com.marketgo.utils.*

class UserService(
    private val users: UserRepository,
    private val stores: StoreRepository,
    private val products: ProductRepository,
) {
    private suspend fun requireSelf(requesterId: String, userId: String): User {
        if (requesterId != userId) throw Forbidden()
        return users.findById(userId) ?: throw NotFound("Usuario no encontrado")
    }

    suspend fun updateProfile(requesterId: String, userId: String, req: UpdateProfileRequest): PublicUser {
        val user = requireSelf(requesterId, userId)
        val changes = mutableMapOf<String, Any?>()

        req.name?.let { changes["name"] = Validation.requireText(it, "Ingresa tu nombre") }
        req.phone?.let {
            Validation.requirePhone(it)
            changes["phone"] = it.replace(" ", "")
        }
        req.email?.let {
            Validation.requireEmail(it)
            val email = Validation.normalizeEmail(it)
            val other = users.findByEmail(email)
            if (other != null && other.id != userId) throw Conflict("Ese correo ya está en uso")
            changes["email"] = email
        }
        if (changes.isEmpty()) return user.toPublic()

        users.update(userId, changes)
        // Si cambia el nombre, también se actualiza el "dueño" que muestra su tienda
        val newName = changes["name"] as String?
        if (newName != null && user.storeId != null) stores.update(user.storeId, mapOf("owner" to newName))

        return users.findById(userId)!!.toPublic()
    }

    suspend fun createStore(requesterId: String, userId: String, req: CreateStoreRequest): PublicUser {
        val user = requireSelf(requesterId, userId)
        if (user.storeId != null) throw Conflict("Ya tienes una tienda creada")
        val name = Validation.requireText(req.name, "Ingresa el nombre de tu tienda")

        val storeId = stores.newId()
        val store = Store(
            id = storeId,
            name = name,
            owner = user.name,
            ownerId = user.id,
            city = req.city?.trim()?.ifBlank { null } ?: "Bogotá",
            description = req.description?.trim()?.ifBlank { null } ?: "Nueva tienda en MarketGO.",
        )
        // Se crea la tienda y se enlaza al usuario en una sola operación (todo o nada)
        val batch = stores.db.batch()
        batch.set(stores.ref(storeId), stores.toMap(store))
        batch.update(users.ref(userId), mapOf("storeId" to storeId))
        batch.commit().await()

        return user.copy(storeId = storeId).toPublic()
    }

    suspend fun deleteAccount(requesterId: String, userId: String): OkResponse {
        val user = requireSelf(requesterId, userId)
        // Los pedidos se conservan (historial de los vendedores); los productos de su tienda se pausan
        user.storeId?.let { storeId ->
            products.findByStore(storeId).forEach { products.update(it.id, mapOf("active" to false)) }
        }
        users.delete(userId)
        return OkResponse()
    }
}
