package com.marketgo.repository

import com.google.cloud.firestore.Firestore
import com.marketgo.models.Store

class StoreRepository(db: Firestore) : FirestoreRepository<Store>(db, "stores", Store.serializer())
