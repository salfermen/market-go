package com.marketgo.config

import com.google.cloud.firestore.Firestore
import com.marketgo.controllers.*
import com.marketgo.repository.*
import com.marketgo.service.*
import io.ktor.server.config.*

/**
 * "Inyección de dependencias" manual: crea cada capa una sola vez y la conecta con la siguiente.
 *   Routes → Controllers → Services → Repositories → Firestore
 */
class AppContainer private constructor(
    val firestore: Firestore,
    val jwtConfig: JwtConfig,
    recoveryFixedCode: String?,
) {
    // Repositorios (acceso a Firestore)
    val userRepository = UserRepository(firestore)
    val storeRepository = StoreRepository(firestore)
    val categoryRepository = CategoryRepository(firestore)
    val productRepository = ProductRepository(firestore)
    val reviewRepository = ReviewRepository(firestore)
    val orderRepository = OrderRepository(firestore)
    val voucherRepository = VoucherRepository(firestore)
    val recoveryRepository = RecoveryCodeRepository(firestore)

    // Servicios (reglas de negocio)
    val authService = AuthService(userRepository, recoveryRepository, jwtConfig, recoveryFixedCode)
    val userService = UserService(userRepository, storeRepository, productRepository)
    val storeService = StoreService(storeRepository)
    val productService = ProductService(productRepository, categoryRepository, storeService)
    val reviewService = ReviewService(reviewRepository, productRepository, userRepository, storeService)
    val voucherService = VoucherService(voucherRepository)
    val orderService = OrderService(firestore, orderRepository, productRepository, userRepository, voucherService, storeService)
    val salesService = SalesService(orderRepository, storeService)

    // Controladores (reciben la petición HTTP y devuelven la respuesta)
    val authController = AuthController(authService)
    val userController = UserController(userService)
    val productController = ProductController(productService, reviewService)
    val storeController = StoreController(storeService, productService, reviewService, orderService, salesService)
    val reviewController = ReviewController(reviewService)
    val orderController = OrderController(orderService)
    val voucherController = VoucherController(voucherService)

    companion object {
        fun create(firestore: Firestore, config: ApplicationConfig) = AppContainer(
            firestore = firestore,
            jwtConfig = JwtConfig.from(config),
            recoveryFixedCode = config.propertyOrNull("app.recoveryFixedCode")?.getString()?.ifBlank { null },
        )
    }
}
