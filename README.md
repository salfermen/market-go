# MarketGO — Frontend (React Native + Expo)

Aplicación móvil que funciona como tienda virtual: conecta a **vendedores pequeños o informales** con **clientes** que buscan sus productos. Centraliza el catálogo, la búsqueda y la gestión de pedidos para que cualquier emprendimiento pueda vender desde el celular.

> Proyecto de la asignatura **Desarrollo de Aplicaciones Móviles** — Fundación Universitaria Konrad Lorenz.
> Segunda entrega: análisis, diseño UX/UI e implementación inicial del frontend.
> El backend en **Ktor** se integra en la siguiente entrega; por ahora la app usa **datos simulados**.

**Equipo:** Laura Daniela Galindo Casallas · Salim Ferez Mendez · Juan Sebastián Salas Castillo

---

## Características

- **32 pantallas** con navegación funcional (autenticación, comprador, vendedor y compartidas).
- **Dos modos en una misma cuenta:** comprador y vendedor (Perfil › *Mi tienda*).
- **Formularios con validación visual:** registro, inicio de sesión, recuperación de contraseña, dirección, tarjeta, producto, reseñas, perfil, filtros y cupones.
- **Carrito y checkout completos (simulados):** cantidades, cupones, envío estándar/express, métodos de pago (tarjeta, PSE, Nequi, contra entrega), pago aprobado o rechazado y seguimiento del envío.
- **Panel del vendedor:** indicadores, gráfica de ventas, inventario (crear/editar/pausar productos), pedidos con cambio de estado, reportes y respuesta a reseñas.
- **Capa de servicios lista para Ktor:** cambiar `EXPO_PUBLIC_USE_MOCK=false` hace que las pantallas consuman la API real sin modificarlas.

## Tecnologías

| Tecnología | Uso |
|---|---|
| React Native 0.88 + Expo SDK 58 | Base de la app móvil (Android / iOS / web) |
| JavaScript (ES2022) | Lenguaje del proyecto |
| React Navigation 7 (native-stack + bottom-tabs) | Navegación entre pantallas |
| React Context + `useReducer` | Estado global (sesión, carrito, compras, panel del vendedor) |
| `fetch` | Cliente HTTP (sin dependencias extra) |
| lucide-react-native + react-native-svg | Íconos y gráficas (dona) |
| react-native-safe-area-context | Respeto del notch y barras del sistema |

## Requisitos

- **Node.js 20 LTS o superior** (recomendado 22 LTS) y **npm**.
- Una de estas opciones para ejecutar la app:
  - **Expo Go** actualizado en un celular Android/iOS (compatible con SDK 58), en la misma red Wi-Fi que el computador.
  - **Emulador de Android** (Android Studio → Device Manager) o simulador de iOS (solo macOS).
  - Un navegador web (vista de prueba).

## Instalación

```bash
git clone https://github.com/salfermen/market-go.git
cd market-go
npm install
```

`npm install` descarga las dependencias de `package.json` respetando las versiones de `package-lock.json`.

## Variables de entorno

Copia el ejemplo (opcional en esta entrega; sin `.env` se usan los valores por defecto):

```bash
cp .env.example .env
```

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | `http://10.0.2.2:8080/api` | URL base del backend Ktor. `10.0.2.2` es el *localhost* del PC visto desde el emulador de Android. |
| `EXPO_PUBLIC_USE_MOCK` | `true` | `true` = datos simulados; `false` = API real. |

> Nunca subas el archivo `.env` al repositorio (ya está en `.gitignore`).

## Ejecución

```bash
npx expo start
```

En la terminal aparecerá un código QR y un menú:

| Tecla / acción | Resultado |
|---|---|
| Escanear el QR con **Expo Go** (Android) o la cámara (iOS) | Abre la app en el celular |
| `a` | Abre la app en el emulador de Android |
| `i` | Abre la app en el simulador de iOS (macOS) |
| `w` | Abre la versión web |
| `r` | Recarga la app |

Si el celular no conecta por la red local, usa: `npx expo start --tunnel`.

### Datos de prueba

| Dato | Valor |
|---|---|
| Cuenta de demostración (tiene tienda) | `ramona@marketgo.co` / `Market123` |
| Otra cuenta (sin tienda) | `juan@marketgo.co` / `Market123` |
| Código de recuperación de contraseña | `1234` |
| Cupones | `PRIMERA15`, `BIENVENIDO10`, `LEAL20`, `ENVIOGRATIS` |
| Tarjeta que se rechaza (para ver el error) | `4000 0000 0000 0002` (cualquier fecha futura y CVV) |

También puedes registrar una cuenta nueva: los datos viven en memoria y se reinician al recargar la app.

### Recorrido sugerido para la demostración

1. **Inicio** → *Empecemos* → tarjetas de bienvenida → *Iniciar sesión* → correo y contraseña de prueba.
2. **Tienda** → categoría o búsqueda → **Filtros** → **Detalle de producto** → elegir color/talla → *Agregar al carrito*.
3. **Carrito** → *Añadir cupón* → *Finalizar compra* → **Pago** → *Pagar* → **Seguimiento de envío**.
4. **Perfil** → Mis pedidos, Recompensas, Cupones, Editar información, Soporte, Configuración.
5. **Perfil › Mi tienda** → panel del vendedor: agregar producto, avanzar un pedido, ventas, reportes y reseñas.

## Build (exportar)

```bash
npx expo export -p android   # genera el bundle de Android en dist/
npx expo export -p web       # genera la versión web estática en dist/
```

Para un APK/AAB instalable se usará EAS Build en etapas posteriores: `npx eas-cli@latest build -p android --profile preview`.

## Estructura del proyecto

```text
market-go/
├── App.js                 # Providers de estado + NavigationContainer
├── index.js               # Registro del componente raíz
├── app.json               # Configuración de Expo (nombre, íconos, paquete)
├── assets/                # Ícono de la app y favicon
└── src/
    ├── api/               # Capa de servicios: client.js (fetch + JWT) y *.api.js
    ├── assets/            # Logo
    ├── components/
    │   ├── common/        # Texto, inputs, botones, modal, toast, pestañas…
    │   ├── layout/        # ScreenWrapper, encabezados, divisores, fondos
    │   ├── specific/      # Tarjetas de producto, carrito, pedido, gráficas…
    │   └── HelloCard.js   # Tarjeta de bienvenida
    ├── data/mockData.js   # Datos simulados (reemplazados por Ktor después)
    ├── hooks/             # useForm, useAsync, useDebounce, useToast, useCountdown
    ├── navigation/        # AppNavigator, AuthStack, ClientTabs, SellerTabs
    ├── screens/           # Auth (5), Client (11), Seller (7), Shared (9)
    ├── store/             # authStore, cartStore, shopStore, sellerStore (Context)
    ├── theme/             # Colores, tipografía y métricas
    └── utils/             # Validaciones, formateadores, íconos y constantes
```

## Arquitectura

```text
App.js (providers) → AppNavigator → AuthStack | ClientTabs | SellerTabs → Pantallas
Pantallas → componentes + hooks + store → src/api → (USE_MOCK) mockData.js | Backend Ktor
```

- **AppNavigator** decide el flujo según la sesión (`user`) y el modo (`client` / `seller`): al iniciar o cerrar sesión la navegación cambia sola.
- **Las pantallas nunca llaman a `fetch` directamente**: usan funciones de `src/api`, que hoy responden con datos simulados y mañana con Ktor.

## API prevista (Ktor)

| Módulo | Endpoints |
|---|---|
| Autenticación | `POST /auth/check-email`, `POST /auth/login`, `POST /auth/register`, `POST /auth/recovery`, `POST /auth/recovery/verify`, `POST /auth/recovery/reset` |
| Usuarios | `PUT /users/{id}`, `POST /users/{id}/store`, `DELETE /users/{id}` |
| Productos | `GET /products`, `GET /products/{id}`, `GET /categories`, `GET/POST /products/{id}/reviews` |
| Tiendas | `GET /stores/{id}`, `GET/POST /stores/{id}/products`, `PUT /products/{id}`, `GET /stores/{id}/reviews`, `POST /reviews/{id}/reply` |
| Pedidos | `GET /orders/me`, `POST /orders`, `PATCH /orders/{id}/reviewed`, `GET /stores/{id}/orders`, `PATCH /orders/{id}/status`, `GET /stores/{id}/sales` |

Todas las peticiones autenticadas envían `Authorization: Bearer <token>`.

## Limitaciones conocidas (entrega 2)

- Los datos son simulados y se pierden al recargar la app (no hay persistencia).
- Las imágenes de productos son ilustraciones provisionales (ícono de la categoría); el backend entregará las fotos.
- Pagos, notificaciones y exportación de reportes están simulados.

## Solución de problemas

| Problema | Solución |
|---|---|
| Expo Go dice que el proyecto usa otro SDK | Actualiza Expo Go desde la tienda de aplicaciones. |
| El celular no encuentra el servidor | Mismo Wi-Fi que el PC o `npx expo start --tunnel`. |
| Errores raros después de cambiar dependencias | `npx expo start -c` (limpia la caché de Metro). |
| Versiones incompatibles | `npx expo install --fix`. |
