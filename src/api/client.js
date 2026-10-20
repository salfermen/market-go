// Cliente HTTP base para comunicarse con el backend (Ktor, siguiente entrega).
//
// - API_BASE_URL y USE_MOCK se leen de variables de entorno EXPO_PUBLIC_* (ver .env.example).
// - Mientras USE_MOCK sea true, cada módulo de src/api responde con datos simulados
//   y un pequeño retardo para imitar la red. Las pantallas no notan la diferencia.
// - Se usa fetch (incluido en React Native) en lugar de Axios para no sumar dependencias.

// 10.0.2.2 es "localhost" del computador visto desde el emulador de Android.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080/api';
export const USE_MOCK = (process.env.EXPO_PUBLIC_USE_MOCK ?? 'true') !== 'false';

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
