package com.marketgo.repository

import com.google.cloud.firestore.Firestore
import com.marketgo.models.Category

class CategoryRepository(db: Firestore) : FirestoreRepository<Category>(db, "categories", Category.serializer())
