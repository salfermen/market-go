package com.marketgo.repository

import com.google.cloud.firestore.CollectionReference
import com.google.cloud.firestore.DocumentReference
import com.google.cloud.firestore.DocumentSnapshot
import com.google.cloud.firestore.Firestore
import com.google.cloud.firestore.Query
import com.marketgo.utils.FirestoreMapper
import com.marketgo.utils.await
import kotlinx.serialization.KSerializer

/**
 * Operaciones CRUD comunes a todas las colecciones (lo que en TiendaMaria hacía ProductoRepository).
 * Cada repositorio concreto solo indica la colección, el modelo y sus consultas propias.
 */
abstract class FirestoreRepository<T>(
    val db: Firestore,
    collectionName: String,
    private val serializer: KSerializer<T>,
    private val transientFields: Set<String> = emptySet(),
) {
    protected val collection: CollectionReference = db.collection(collectionName)

    fun ref(id: String): DocumentReference = collection.document(id)

    /** Genera un id nuevo de Firestore sin escribir nada todavía. */
    fun newId(): String = collection.document().id

    fun toMap(value: T): Map<String, Any?> = FirestoreMapper.toMap(serializer, value, transientFields)

    fun fromDocument(doc: DocumentSnapshot): T? = if (doc.exists()) FirestoreMapper.fromDocument(serializer, doc) else null

    suspend fun findAll(): List<T> = list(collection)

    suspend fun findById(id: String): T? = fromDocument(ref(id).get().await())

    suspend fun findBy(field: String, value: Any): List<T> = list(collection.whereEqualTo(field, value))

    /** Busca varios documentos por id (Firestore permite máximo 30 ids por consulta "in"). */
    suspend fun findByIds(ids: Collection<String>): List<T> =
        ids.distinct().chunked(30).flatMap { chunk ->
            db.getAll(*chunk.map { ref(it) }.toTypedArray()).await().mapNotNull { fromDocument(it) }
        }

    /** Crea o reemplaza el documento con ese id. */
    suspend fun save(id: String, value: T) {
        ref(id).set(toMap(value)).await()
    }

    /** Actualiza solo algunos campos. */
    suspend fun update(id: String, fields: Map<String, Any?>) {
        ref(id).update(fields).await()
    }

    suspend fun delete(id: String) {
        ref(id).delete().await()
    }

    suspend fun exists(id: String): Boolean = ref(id).get().await().exists()

    suspend fun isEmpty(): Boolean = collection.limit(1).get().await().isEmpty

    protected suspend fun list(query: Query): List<T> = query.get().await().documents.mapNotNull { fromDocument(it) }
}
