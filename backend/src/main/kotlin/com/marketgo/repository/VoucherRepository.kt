package com.marketgo.repository

import com.google.cloud.firestore.Firestore
import com.marketgo.models.Voucher

class VoucherRepository(db: Firestore) : FirestoreRepository<Voucher>(db, "vouchers", Voucher.serializer()) {

    suspend fun findByCode(code: String): Voucher? =
        list(collection.whereEqualTo("code", code.trim().uppercase()).limit(1)).firstOrNull()
}
