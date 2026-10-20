// Funciones HTTP para login, registro, recuperación de contraseña y perfil.
// Endpoints previstos en Ktor:
//   POST /auth/check-email   POST /auth/login       POST /auth/register
//   POST /auth/recovery      POST /auth/recovery/verify   POST /auth/recovery/reset
//   PUT  /users/{id}         POST /users/{id}/store       DELETE /users/{id}

import { request, USE_MOCK, mockResponse, mockError } from './client';
import { demoUsers, stores } from '../data/mockData';

// "Base de datos" en memoria del modo simulado
const usersDb = demoUsers.map((user) => ({ ...user }));

const findByEmail = (email) =>
  usersDb.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());

// Nunca se devuelve la contraseña a la app
const toPublicUser = ({ password, ...user }) => ({ ...user });

const fakeToken = (user) => `mock-jwt.${user.id}.${Date.now()}`;

export async function checkEmail(email) {
  if (!USE_MOCK) return request('/auth/check-email', { method: 'POST', body: { email } });
  const user = findByEmail(email);
  if (!user) return mockError('No encontramos una cuenta con ese correo', 404);
  return mockResponse({ name: user.name.split(' ')[0] });
}

export async function login(email, password) {
  if (!USE_MOCK) return request('/auth/login', { method: 'POST', body: { email, password } });
  const user = findByEmail(email);
  if (!user || user.password !== password) return mockError('Contraseña incorrecta', 401, 500);
  return mockResponse({ user: toPublicUser(user), token: fakeToken(user) }, 600);
}

export async function register({ name, email, password, phone }) {
  if (!USE_MOCK) return request('/auth/register', { method: 'POST', body: { name, email, password, phone } });
  if (findByEmail(email)) return mockError('Ya existe una cuenta con ese correo', 409);
  const user = {
    id: `u${usersDb.length + 1}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone,
    password,
    points: 100, // bono de bienvenida
    storeId: null,
  };
  usersDb.push(user);
  return mockResponse({ user: toPublicUser(user), token: fakeToken(user) }, 700);
}

export async function sendRecoveryCode({ email, method }) {
  if (!USE_MOCK) return request('/auth/recovery', { method: 'POST', body: { email, method } });
  const user = findByEmail(email);
  if (!user) return mockError('No encontramos una cuenta con ese correo', 404);
  const destination =
    method === 'sms'
      ? `+57 ${'*'.repeat(6)}${user.phone.slice(-2)}`
      : `${user.email[0]}*****@${user.email.split('@')[1]}`;
  return mockResponse({ destination });
}

// En modo simulado el código siempre es 1234
export async function verifyRecoveryCode({ email, code }) {
  if (!USE_MOCK) return request('/auth/recovery/verify', { method: 'POST', body: { email, code } });
  if (code !== '1234') return mockError('El código no es correcto', 400);
  return mockResponse({ ok: true });
}

export async function resetPassword({ email, password }) {
  if (!USE_MOCK) return request('/auth/recovery/reset', { method: 'POST', body: { email, password } });
  const user = findByEmail(email);
  if (user) user.password = password;
  return mockResponse({ ok: true }, 500);
}

export async function updateProfile(userId, changes) {
  if (!USE_MOCK) return request(`/users/${userId}`, { method: 'PUT', body: changes });
  const user = usersDb.find((u) => u.id === userId);
  const duplicated = changes.email && usersDb.some((u) => u.id !== userId && u.email === changes.email);
  if (duplicated) return mockError('Ese correo ya está en uso', 409);
  Object.assign(user, changes);
  return mockResponse(toPublicUser(user), 500);
}

export async function createStore(userId, { name, city }) {
  if (!USE_MOCK) return request(`/users/${userId}/store`, { method: 'POST', body: { name, city } });
  const user = usersDb.find((u) => u.id === userId);
  const store = {
    id: `s${stores.length + 1}`,
    name: name.trim(),
    owner: user.name,
    city: city || 'Bogotá',
    rating: 0,
    followers: 0,
    description: 'Nueva tienda en MarketGO.',
  };
  stores.push(store);
  user.storeId = store.id;
  return mockResponse(toPublicUser(user), 600);
}

export async function deleteAccount(userId) {
  if (!USE_MOCK) return request(`/users/${userId}`, { method: 'DELETE' });
  const index = usersDb.findIndex((u) => u.id === userId);
  if (index >= 0) usersDb.splice(index, 1);
  return mockResponse({ ok: true });
}
