package com.marketgo.service

import com.marketgo.config.JwtConfig
import com.marketgo.models.*
import com.marketgo.repository.RecoveryCodeRepository
import com.marketgo.repository.UserRepository
import com.marketgo.utils.*
import org.mindrot.jbcrypt.BCrypt
import org.slf4j.LoggerFactory
import java.security.SecureRandom

class AuthService(
    private val users: UserRepository,
    private val recoveryCodes: RecoveryCodeRepository,
    private val jwt: JwtConfig,
    /** Si se configura (p. ej. "1234" en desarrollo) el código de recuperación es siempre ese. */
    private val recoveryFixedCode: String?,
) {
    private val log = LoggerFactory.getLogger(AuthService::class.java)
    private val random = SecureRandom()

    suspend fun checkEmail(req: EmailRequest): CheckEmailResponse {
        Validation.requireEmail(req.email)
        val user = users.findByEmail(req.email!!) ?: throw NotFound("No encontramos una cuenta con ese correo")
        return CheckEmailResponse(name = user.name.substringBefore(" "))
    }

    suspend fun login(req: LoginRequest): AuthResponse {
        Validation.requireEmail(req.email)
        if (req.password.isNullOrEmpty()) throw BadRequest("Ingresa tu contraseña")
        val user = users.findByEmail(req.email!!)
        // Mismo mensaje si el correo no existe: no se revela qué cuentas existen
        if (user == null || !BCrypt.checkpw(req.password, user.passwordHash)) {
            throw Unauthorized("Contraseña incorrecta")
        }
        return AuthResponse(user.toPublic(), jwt.createToken(user.id))
    }

    suspend fun register(req: RegisterRequest): AuthResponse {
        val name = Validation.requireText(req.name, "Ingresa tu nombre")
        Validation.requireEmail(req.email)
        Validation.requirePassword(req.password)
        Validation.requirePhone(req.phone)

        val email = Validation.normalizeEmail(req.email!!)
        if (users.findByEmail(email) != null) throw Conflict("Ya existe una cuenta con ese correo")

        val id = users.newId()
        val user = User(
            id = id,
            name = name,
            email = email,
            phone = req.phone!!.replace(" ", ""),
            passwordHash = hashPassword(req.password!!),
            points = 100, // bono de bienvenida
            storeId = null,
            createdAt = Dates.nowString(),
        )
        users.save(id, user)
        return AuthResponse(user.toPublic(), jwt.createToken(id))
    }

    suspend fun sendRecoveryCode(req: RecoveryRequest): DestinationResponse {
        Validation.requireEmail(req.email)
        val user = users.findByEmail(req.email!!) ?: throw NotFound("No encontramos una cuenta con ese correo")

        val code = recoveryFixedCode ?: (1000 + random.nextInt(9000)).toString()
        recoveryCodes.save(
            user.email,
            RecoveryCode(code = code, expiresAt = System.currentTimeMillis() + CODE_TTL_MS),
        )
        // Aún no hay servicio de correo/SMS: el código se muestra en la consola del servidor
        log.info("Código de recuperación para ${user.email}: $code (vía ${req.method})")

        val destination = if (req.method == "sms") {
            "+57 ${"*".repeat(6)}${user.phone.takeLast(2)}"
        } else {
            "${user.email.first()}*****@${user.email.substringAfter("@")}"
        }
        return DestinationResponse(destination)
    }

    suspend fun verifyRecoveryCode(req: VerifyCodeRequest): OkResponse {
        Validation.requireEmail(req.email)
        val email = Validation.normalizeEmail(req.email!!)
        val saved = recoveryCodes.findById(email) ?: throw BadRequest("Solicita un código de recuperación primero")

        if (saved.expiresAt < System.currentTimeMillis()) throw BadRequest("El código expiró, solicita uno nuevo")
        if (saved.attempts >= MAX_ATTEMPTS) throw BadRequest("Demasiados intentos, solicita un código nuevo")
        if (saved.code != req.code?.trim()) {
            recoveryCodes.update(email, mapOf("attempts" to saved.attempts + 1))
            throw BadRequest("El código no es correcto")
        }
        recoveryCodes.update(email, mapOf("verified" to true))
        return OkResponse()
    }

    /**
     * Cambia la contraseña en dos casos:
     *  - Recuperación: el código enviado al correo/SMS ya fue verificado.
     *  - Sesión iniciada: la petición trae el token del mismo usuario (Configuración › Cambiar contraseña).
     */
    suspend fun resetPassword(req: ResetPasswordRequest, requesterId: String? = null): OkResponse {
        Validation.requireEmail(req.email)
        Validation.requirePassword(req.password)
        val email = Validation.normalizeEmail(req.email!!)
        val user = users.findByEmail(email) ?: throw NotFound("No encontramos una cuenta con ese correo")

        val isOwnSession = requesterId != null && requesterId == user.id
        if (!isOwnSession) {
            val saved = recoveryCodes.findById(email)
            if (saved == null || !saved.verified || saved.expiresAt < System.currentTimeMillis()) {
                throw BadRequest("Primero verifica el código de recuperación")
            }
        }
        users.update(user.id, mapOf("passwordHash" to hashPassword(req.password!!)))
        recoveryCodes.delete(email)
        return OkResponse()
    }

    companion object {
        private const val CODE_TTL_MS = 10 * 60 * 1000L // 10 minutos
        private const val MAX_ATTEMPTS = 5

        fun hashPassword(password: String): String = BCrypt.hashpw(password, BCrypt.gensalt())
    }
}
