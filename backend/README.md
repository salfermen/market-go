# MarketGO — Backend (Ktor + Firebase Firestore)

API REST de MarketGO escrita en **Kotlin + Ktor 3**, con **Cloud Firestore** como base de datos.
Implementa exactamente los endpoints que consume la app (`src/api/*.api.js`), así que basta con
poner `EXPO_PUBLIC_USE_MOCK=false` para que la app deje de usar los datos simulados.

Sigue la misma arquitectura por capas del proyecto **TiendaMaria**:

```text
Petición HTTP
   │
routes/        → define las URL y el método (GET /api/products/{id} …)
   │
controllers/   → lee parámetros y cuerpo, llama al servicio y responde (sin lógica de negocio)
   │
service/       → reglas de negocio: validaciones, permisos, totales, stock, puntos…
   │
repository/    → única capa que habla con Firestore
   │
models/        → data classes @Serializable (lo que se guarda y lo que viaja en JSON)
```

Es un MVC adaptado a una API: el **Modelo** son `models/` + `repository/`, el **Controlador** es `controllers/`
(con `routes/` como enrutador) y la **Vista** es el JSON que recibe la app en React Native.

## Estructura

```text
backend/
├── build.gradle.kts            # Dependencias (Ktor 3.4, Firebase Admin, JWT, BCrypt)
├── gradle/libs.versions.toml   # Versiones
├── src/main/kotlin/com/marketgo/
│   ├── Application.kt          # main + módulo de Ktor
│   ├── config/                 # Firebase, JSON, CORS, JWT, manejo de errores, AppContainer (conecta las capas)
│   ├── models/                 # User, Store, Category, Product, Review, Order, Voucher, Sales + peticiones
│   ├── repository/             # FirestoreRepository (CRUD genérico) + un repositorio por colección
│   ├── service/                # AuthService, UserService, ProductService, ReviewService, OrderService, SalesService…
│   ├── controllers/            # AuthController, ProductController, StoreController, OrderController…
│   ├── routes/                 # Routing.kt (prefijo /api) + un archivo de rutas por módulo
│   ├── seed/DatabaseSeeder.kt  # Carga los datos de demostración si Firestore está vacío
│   └── utils/                  # Mapper Firestore ↔ modelos, errores, validaciones, fechas
├── src/main/resources/
│   ├── application.yaml        # Puerto, JWT, Firebase, seed
│   └── seed/marketgo-seed.json # Mismos datos de src/data/mockData.js de la app
└── src/test/kotlin/…/ApiTest.kt  # Pruebas de integración con el emulador de Firestore
```

## Requisitos

- **JDK 21** (IntelliJ IDEA lo puede descargar: *File › Project Structure › SDK*).
- Un proyecto de **Firebase** con **Cloud Firestore** activado.
- No hace falta instalar Gradle: se usa el wrapper `./gradlew` (Windows: `gradlew.bat`).

## 1. Conectar con Firebase

1. Firebase Console › tu proyecto › **Firestore Database** › *Crear base de datos* (modo producción).
2. ⚙️ **Configuración del proyecto › Cuentas de servicio › Generar nueva clave privada**.
3. Guarda el archivo descargado como `backend/serviceAccountKey.json`.

> ⚠️ Esa llave da acceso total a la base de datos. Está en `.gitignore`: **nunca la subas a GitHub**.
> Si alguna vez se compartió (por ejemplo dentro de un .zip/.rar), genera una nueva en la consola y elimina la anterior.

También puedes guardarla en otra ruta y definir la variable `FIREBASE_CREDENTIALS=/ruta/a/la/llave.json`.

Como el backend usa el **Admin SDK**, ignora las reglas de seguridad de Firestore. Para que nadie pueda leer
la base directamente desde internet, deja las reglas cerradas:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }
  }
}
```

## 2. Ejecutar

```bash
cd backend
./gradlew run
```

En Windows: `gradlew.bat run`. Desde la raíz del proyecto también sirve `npm run api`.

**¿Qué base de datos usa?**

- Si existe `backend/serviceAccountKey.json` (o `FIREBASE_CREDENTIALS`), usa el proyecto real de Firebase.
- Si no, `gradlew run` se conecta solo a la **base local** (emulador de Firestore en `127.0.0.1:8085`).
  Ábrela antes, desde la raíz del proyecto, con `npm run db` (configuración en `firebase.json`;
  los datos se guardan en `backend/.firestore-data` al cerrarla con Ctrl+C). Si no está abierta, el
  backend se detiene con un mensaje que lo indica.

Al arrancar por primera vez, si la colección `users` está vacía, se cargan los datos de demostración
(mismos usuarios, tiendas, productos, reseñas, cupones y pedidos que tenía la app). Las fechas de los pedidos
se ajustan para que el más reciente sea "ayer" y así el panel del vendedor muestre gráficas desde el primer día.

```text
INFO  DatabaseSeeder - Datos de demostración cargados: 2 usuarios, 4 tiendas, 18 productos, 9 pedidos
INFO  Application - Responding at http://0.0.0.0:8080
```

Prueba rápida: <http://localhost:8080/api/products>

### Variables de entorno (opcionales)

| Variable | Por defecto | Uso |
|---|---|---|
| `PORT` | `8080` | Puerto del servidor |
| `FIREBASE_CREDENTIALS` | `serviceAccountKey.json` | Ruta de la llave de Firebase |
| `JWT_SECRET` | valor de desarrollo | Secreto para firmar los tokens. **Cámbialo en producción** |
| `SEED_DATA` | `true` | Cargar datos de demostración si la base está vacía |
| `RECOVERY_FIXED_CODE` | `1234` | Código fijo de recuperación de contraseña para la demo. Vacío = código aleatorio |
| `FIRESTORE_EMULATOR_HOST` | — | Si se define (p. ej. `127.0.0.1:8085`) usa el emulador local en vez de Firebase |

## 3. Conectar la app (React Native)

En la raíz del proyecto (`market-go/`) crea `.env` a partir de `.env.example`:

```bash
EXPO_PUBLIC_USE_MOCK=false
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080/api
```

| Dónde corre la app | `EXPO_PUBLIC_API_URL` |
|---|---|
| Emulador de Android | `http://10.0.2.2:8080/api` |
| Simulador de iOS / web | `http://localhost:8080/api` |
| Celular con Expo Go | `http://<IP del PC en el Wi-Fi>:8080/api` (ej. `http://192.168.1.20:8080/api`; en Windows la IP sale con `ipconfig`) |

Reinicia Expo con `npx expo start -c` después de cambiar el `.env`.

**Cuentas de prueba:** `ramona@marketgo.co` / `Market123` (tiene la tienda *Moda Ramona*) y `juan@marketgo.co` / `Market123`.

## Endpoints

Todas las rutas empiezan por `/api`. 🔒 = requiere `Authorization: Bearer <token>`.
Los errores siempre responden `{ "message": "..." }` con el código HTTP correspondiente.

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/check-email` | `{email}` → `{name}` (primer nombre) o 404 |
| POST | `/auth/login` | `{email, password}` → `{user, token}` |
| POST | `/auth/register` | `{name, email, password, phone}` → `{user, token}` (100 puntos de bienvenida) |
| POST | `/auth/recovery` | `{email, method: "email"\|"sms"}` → `{destination}`. El código se imprime en la consola del servidor |
| POST | `/auth/recovery/verify` | `{email, code}` → `{ok}` (máx. 5 intentos, vence en 10 min) |
| POST | `/auth/recovery/reset` | `{email, password}` → `{ok}` (solo después de verificar el código) |
| PUT 🔒 | `/users/{id}` | Editar nombre, correo o celular (solo el propio usuario) |
| POST 🔒 | `/users/{id}/store` | `{name, city}` crea la tienda del usuario → usuario con `storeId` |
| DELETE 🔒 | `/users/{id}` | Eliminar la cuenta |
| GET | `/products` | Catálogo. Filtros: `query, category, subcategory, gender, storeId, minPrice, maxPrice, minRating, size, color, onlyDiscount, discount, flash, sort (popular\|newest\|price_asc\|price_desc\|rating)` |
| GET | `/products/{id}` | Detalle + `store` |
| GET | `/categories` | Categorías |
| GET | `/products/{id}/reviews` | Reseñas del producto |
| POST 🔒 | `/products/{id}/reviews` | `{rating, comment}` — recalcula el promedio del producto |
| GET | `/vouchers`, `/vouchers/{code}` | Cupones |
| GET | `/stores/{id}` | Datos de la tienda |
| GET 🔒 | `/stores/{id}/products` | Inventario (incluye pausados) — solo el dueño |
| POST 🔒 | `/stores/{id}/products` | `{name, price, stock, category, description}` |
| PUT 🔒 | `/products/{id}` | Cambios parciales: `name, price, stock, category, description, active…` |
| GET 🔒 | `/stores/{id}/reviews` | Reseñas de los productos de la tienda |
| POST 🔒 | `/reviews/{id}/reply` | `{reply}` responde una reseña |
| GET 🔒 | `/orders/me` | Pedidos del usuario |
| POST 🔒 | `/orders` | `{items, address, shippingMethod, paymentMethod, voucherCode}` |
| PATCH 🔒 | `/orders/{id}/reviewed` | Marca el pedido como reseñado |
| GET 🔒 | `/stores/{id}/orders` | Pedidos recibidos por la tienda |
| PATCH 🔒 | `/orders/{id}/status` | `{status: "preparing"\|"shipped"\|"delivered"}` (solo avanza) |
| GET 🔒 | `/stores/{id}/sales` | Resumen: `weekly, monthly, byCategory, totals` |

### Reglas de negocio importantes

- **Pedidos:** el servidor recalcula precios, envío (estándar $0 / express $12.000) y cupón con los datos de Firestore;
  nunca usa el total que manda la app. En una sola transacción valida y descuenta stock, suma vendidos,
  genera el número consecutivo `MG-1049, MG-1050…` y suma 1 punto por cada $1.000.
- **Estados:** se guardan como los ve el cliente (`paid → packed → shipped → delivered`) y se traducen
  para el vendedor (`new → preparing → shipped → delivered`).
- **Contraseñas:** se guardan con hash BCrypt; nunca se devuelven. Mismas reglas que la app (8+ caracteres, mayúscula, minúscula y número).
- **Permisos:** cada usuario solo modifica su cuenta; solo el dueño de una tienda ve/edita su inventario, pedidos, reseñas y ventas.

## Colecciones en Firestore

`users`, `stores`, `categories`, `products`, `reviews`, `orders`, `vouchers`, `recoveryCodes`, `counters`.
Las consultas usan solo filtros de igualdad/`array-contains`, así que **no hay que crear índices compuestos**.

## Pruebas

Las pruebas usan el **emulador de Firestore** (nunca tocan la base real):

```bash
npm run db          # en la raíz del proyecto (emulador en 127.0.0.1:8085)
```

En otra terminal:

```bash
cd backend
./gradlew test      # Windows: gradlew.bat test
```

Las pruebas usan el proyecto `marketgo-test` dentro del emulador, separado de los datos de desarrollo (`marketgo-dev`).

## Limitaciones conocidas

- El código de recuperación no se envía por correo/SMS todavía: se imprime en la consola del servidor.
- El pago es simulado (no hay pasarela). La tarjeta `…0002` se rechaza en la app, no en el servidor.
- Un pedido con productos de varias tiendas comparte un solo estado de envío.
- `conversion` en el resumen de ventas es 0 porque aún no se registran visitas a los productos.
- Los filtros del catálogo se aplican en memoria después de traer los productos activos (adecuado para un catálogo pequeño).
