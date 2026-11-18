package com.marketgo.repository

import com.google.cloud.firestore.Firestore
import com.marketgo.models.User

class UserRepository(db: Firestore) : FirestoreRepository<User>(db, "users", User.serializer()) {

    suspend fun findByEmail(email: String): User? =
        list(collection.whereEqualTo("email", email.trim().lowercase()).limit(1)).firstOrNull()
}
