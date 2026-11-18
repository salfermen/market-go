package com.marketgo.repository

import com.google.cloud.firestore.Firestore
import com.marketgo.models.RecoveryCode

/** Códigos de recuperación de contraseña. El id del documento es el correo del usuario. */
class RecoveryCodeRepository(db: Firestore) :
    FirestoreRepository<RecoveryCode>(db, "recoveryCodes", RecoveryCode.serializer())
