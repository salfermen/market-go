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

tasks.test {
    // Las pruebas usan el emulador de Firestore: FIRESTORE_EMULATOR_HOST debe estar definido
    environment("GOOGLE_CLOUD_PROJECT", "marketgo-test")
}
