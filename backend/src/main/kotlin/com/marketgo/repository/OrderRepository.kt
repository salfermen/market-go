package com.marketgo.repository

import com.google.cloud.firestore.Firestore
import com.marketgo.models.Order

class OrderRepository(db: Firestore) : FirestoreRepository<Order>(db, "orders", Order.serializer()) {

    /** Documento contador que genera los números de pedido consecutivos MG-1049, MG-1050… */
    val counterRef = db.collection("counters").document("orders")

    suspend fun findByUser(userId: String): List<Order> = findBy("userId", userId)

    suspend fun findByStore(storeId: String): List<Order> = list(collection.whereArrayContains("storeIds", storeId))
}
