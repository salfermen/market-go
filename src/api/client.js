// Cliente HTTP base para comunicarse con el backend Ktor (carpeta backend/).
//
// - USE_MOCK y la URL de la API se pueden cambiar con variables EXPO_PUBLIC_* (ver .env.example).
// - Con USE_MOCK = true cada módulo de src/api responde con datos simulados
//   y un pequeño retardo para imitar la red. Las pantallas no notan la diferencia.
// - Se usa fetch (incluido en React Native) en lugar de Axios para no sumar dependencias.
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const API_PORT = 8080;

/**
 * URL de la API si no se define EXPO_PUBLIC_API_URL:
 * - Web: el mismo equipo que sirve la página (localhost).
 * - Celular o emulador con Expo: la IP del computador que ejecuta `npx expo start`
 *   (Expo la conoce porque de ahí descarga la app), así no hay que escribirla a mano.
 * - Respaldo: 10.0.2.2, que es "localhost" del computador visto desde el emulador de Android.
 */
function defaultApiUrl() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `http://${window.location.hostname || 'localhost'}:${API_PORT}/api`;
  }
  const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${devHost || '10.0.2.2'}:${API_PORT}/api`;
}

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || defaultApiUrl();
// La app usa la API real; EXPO_PUBLIC_USE_MOCK=true activa los datos simulados (sin backend).
export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

let authToken = null;

// El authStore llama a esta función después del login para que todas las
// peticiones lleven el JWT en la cabecera Authorization.
export function setAuthToken(token) {
  authToken = token;
}

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function request(path, { method = 'GET', body, timeout = 10000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new ApiError(data?.message ?? `Error ${response.status}`, response.status);
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError') throw new ApiError('El servidor tardó demasiado en responder');
    if (error instanceof ApiError) throw error;
    throw new ApiError('No hay conexión con el servidor');
  } finally {
    clearTimeout(timer);
  }
}

// Construye "?a=1&b=2" ignorando valores vacíos
export function toQuery(params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (entries.length === 0) return '';
  return `?${entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')}`;
}

// ---------------------------------------------------------------------------
// Utilidades del modo simulado
// ---------------------------------------------------------------------------
export function mockResponse(data, delay = 350) {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
}

export function mockError(message, status = 400, delay = 350) {
  return new Promise((_, reject) => setTimeout(() => reject(new ApiError(message, status)), delay));
}
