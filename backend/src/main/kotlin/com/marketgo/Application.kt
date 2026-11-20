package com.marketgo

import com.marketgo.config.configureErrorHandling
import com.marketgo.config.configureFirebase
import com.marketgo.config.configureHttp
import com.marketgo.config.configureSecurity
import com.marketgo.config.configureSerialization
import com.marketgo.config.AppContainer
import com.marketgo.routes.configureRouting
import com.marketgo.seed.DatabaseSeeder
import io.ktor.server.application.*
import io.ktor.server.netty.*
import kotlinx.coroutines.runBlocking

// Punto de entrada: lee src/main/resources/application.yaml (puerto, módulos, JWT, Firebase)
fun main(args: Array<String>) = EngineMain.main(args)

// Módulo principal de Ktor: instala los plugins y registra las rutas.
fun Application.module() {
    val firestore = configureFirebase()
    val container = AppContainer.create(firestore, environment.config)

    configureSerialization()
    configureHttp()
    configureErrorHandling()
    configureSecurity(container.jwtConfig)
    configureRouting(container)

    // Carga los datos de demostración (los mismos de mockData.js) si la base está vacía
    if (environment.config.propertyOrNull("app.seed")?.getString()?.toBoolean() == true) {
        runBlocking { DatabaseSeeder(container).seedIfEmpty() }
    }
}
