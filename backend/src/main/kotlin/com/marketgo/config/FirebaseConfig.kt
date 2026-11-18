package com.marketgo.config

import com.google.auth.oauth2.GoogleCredentials
import com.google.cloud.NoCredentials
import com.google.cloud.firestore.Firestore
import com.google.cloud.firestore.FirestoreOptions
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.cloud.FirestoreClient
import io.ktor.server.application.*
import java.io.File
import java.io.InputStream

/**
 * Conexión con Firebase / Cloud Firestore.
 *
 * Orden de búsqueda de credenciales:
 *  1. Si existe la variable FIRESTORE_EMULATOR_HOST se usa el emulador local (sin credenciales).
 *  2. Archivo indicado en firebase.credentialsPath (variable FIREBASE_CREDENTIALS).
 *  3. Archivo serviceAccountKey.json dentro de src/main/resources (como en TiendaMaria).
 *
 * El archivo serviceAccountKey.json NUNCA se sube a GitHub (está en .gitignore).
 */
fun Application.configureFirebase(): Firestore {
    val config = environment.config
    val emulatorHost = System.getenv("FIRESTORE_EMULATOR_HOST")

    if (!emulatorHost.isNullOrBlank()) {
        val projectId = System.getenv("GOOGLE_CLOUD_PROJECT")
            ?: config.propertyOrNull("firebase.projectId")?.getString()?.ifBlank { null }
            ?: "marketgo-dev"
        log.info("Usando el emulador de Firestore en $emulatorHost (proyecto $projectId)")
        val channel = FirestoreOptions.getDefaultTransportChannelProviderBuilder()
            .setEndpoint(emulatorHost)
            .setChannelConfigurator { it.usePlaintext() } // el emulador no usa TLS
            .build()
        return FirestoreOptions.newBuilder()
            .setProjectId(projectId)
            .setHost(emulatorHost)
            .setChannelProvider(channel)
            .setCredentials(NoCredentials.getInstance())
            .build()
            .service
    }

    if (FirebaseApp.getApps().isEmpty()) { // evita la doble inicialización
        val path = config.propertyOrNull("firebase.credentialsPath")?.getString().orEmpty()
        val credentials = openCredentials(path)
            ?: error(
                "No se encontró la llave de Firebase. Descarga serviceAccountKey.json desde " +
                    "Firebase Console › Configuración del proyecto › Cuentas de servicio y colócala en " +
                    "backend/serviceAccountKey.json o define la variable FIREBASE_CREDENTIALS con su ruta."
            )

        val options = credentials.use {
            FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(it))
                .build()
        }
        FirebaseApp.initializeApp(options)
        log.info("Firebase inicializado (proyecto ${FirebaseApp.getInstance().options.projectId})")
    }
    return FirestoreClient.getFirestore()
}

private fun openCredentials(path: String): InputStream? {
    if (path.isNotBlank()) {
        val file = File(path)
        if (file.exists()) return file.inputStream()
    }
    return Thread.currentThread().contextClassLoader.getResourceAsStream("serviceAccountKey.json")
}
