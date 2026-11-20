plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.serialization)
    alias(ktorLibs.plugins.ktor)
}

group = "com.marketgo"
version = "1.0.0"

application {
    mainClass = "com.marketgo.ApplicationKt"
}

kotlin {
    jvmToolchain(21)
}

dependencies {
    // Ktor (todas las piezas en la misma versión 3.x)
    implementation(ktorLibs.server.core)
    implementation(ktorLibs.server.netty)
    implementation(ktorLibs.server.config.yaml)
    implementation(ktorLibs.server.contentNegotiation)
    implementation(ktorLibs.serialization.kotlinx.json)
    implementation(ktorLibs.server.cors)
    implementation(ktorLibs.server.statusPages)
    implementation(ktorLibs.server.callLogging)
    implementation(ktorLibs.server.auth)
    implementation(ktorLibs.server.auth.jwt)
    implementation(libs.logback.classic)

    // Firebase Admin (Firestore)
    implementation(libs.firebase.admin)

    // Hash de contraseñas
    implementation(libs.jbcrypt)

    testImplementation(kotlin("test"))
    testImplementation(ktorLibs.server.testHost)
}

// Base de datos local de desarrollo (emulador de Firestore, `npm run db` en la raíz del proyecto)
val localFirestoreHost = "127.0.0.1:8085"

/**
 * `gradlew run`: si no hay llave de Firebase (backend/serviceAccountKey.json o FIREBASE_CREDENTIALS)
 * ni FIRESTORE_EMULATOR_HOST, el backend se conecta solo a la base local. Así funciona sin
 * configurar variables; al poner la llave se usa el proyecto real de Firebase.
 */
tasks.named<JavaExec>("run") {
    val credentialsPath = System.getenv("FIREBASE_CREDENTIALS")?.takeIf { it.isNotBlank() } ?: "serviceAccountKey.json"
    val usesEmulator = !System.getenv("FIRESTORE_EMULATOR_HOST").isNullOrBlank()
    if (!usesEmulator && !file(credentialsPath).exists()) {
        environment("FIRESTORE_EMULATOR_HOST", localFirestoreHost)
        environment("GOOGLE_CLOUD_PROJECT", "marketgo-dev")
    }
}

tasks.test {
    // Las pruebas siempre usan el emulador de Firestore (nunca la base real)
    if (System.getenv("FIRESTORE_EMULATOR_HOST").isNullOrBlank()) {
        environment("FIRESTORE_EMULATOR_HOST", localFirestoreHost)
    }
    environment("GOOGLE_CLOUD_PROJECT", "marketgo-test")
}
