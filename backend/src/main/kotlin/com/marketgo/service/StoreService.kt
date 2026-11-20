package com.marketgo.service

import com.marketgo.models.Store
import com.marketgo.repository.StoreRepository
import com.marketgo.utils.Forbidden
import com.marketgo.utils.NotFound

class StoreService(private val stores: StoreRepository) {

    suspend fun getStore(storeId: String): Store =
        stores.findById(storeId) ?: throw NotFound("Tienda no encontrada")

    suspend fun findStores(ids: Collection<String>): List<Store> = stores.findByIds(ids)

    /** Verifica que la tienda exista y que el usuario sea su dueño. */
    suspend fun requireOwner(storeId: String, userId: String): Store {
        val store = getStore(storeId)
        if (store.ownerId != userId) throw Forbidden("Esta tienda no te pertenece")
        return store
    }
}
