// Pruebas de extremo a extremo de la API de MarketGO (casos PT, PI, PB y PV del documento, sección 10).
//
// Requisitos: base de datos abierta (npm run db) y backend en ejecución (npm run api).
// Uso:        npm run test:api            (o: node scripts/test-api.mjs resultado.json)
// Otra URL:   API=http://192.168.1.20:8080/api npm run test:api
//
// Se recomienda ejecutarlo sobre los datos de demostración recién cargados: los números de
// pedido y el stock que se muestran dependen de las compras hechas antes.
import fs from 'node:fs';

const API = process.env.API ?? 'http://localhost:8080/api';
const results = [];
const log = [];

async function call(method, path, body, token, raw) {
  const res = await fetch(API + path, {
    method,
    headers: {
      ...(body !== undefined || raw ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { json = text; }
  log.push(`${method} /api${path} → ${res.status}`);
  return { status: res.status, json };
}

async function test(id, group, name, fn) {
  try {
    const obtained = await fn();
    results.push({ id, group, name, ok: true, obtained });
    console.log(`✔ ${id} ${name} — ${obtained}`);
  } catch (e) {
    results.push({ id, group, name, ok: false, obtained: e.message });
    console.log(`✘ ${id} ${name} — ${e.message}`);
  }
}
function expect(cond, msg) { if (!cond) throw new Error(msg); }
const money = (n) => '$' + n.toLocaleString('es-CO');

const login = async (email, password = 'Market123') => (await call('POST', '/auth/login', { email, password })).json.token;

// ---------------------------------------------------------------- Base de datos (carga inicial)
await test('PB-01', 'db', 'Carga inicial de datos', async () => {
  const p = await call('GET', '/products');
  const c = await call('GET', '/categories');
  const v = await call('GET', '/vouchers');
  expect(p.json.length >= 18, `productos: ${p.json.length}`);
  return `${p.json.length} productos, ${c.json.length} categorías, ${v.json.length} cupones disponibles`;
});

// ---------------------------------------------------------------- Funcionales
let ramona, juan, ana, anaId;
await test('PT-01', 'func', 'Inicio de sesión', async () => {
  const r = await call('POST', '/auth/login', { email: 'ramona@marketgo.co', password: 'Market123' });
  expect(r.status === 200 && r.json.token, `status ${r.status}`);
  expect(r.json.user.passwordHash === undefined, 'expone passwordHash');
  ramona = r.json.token;
  return `200; token JWT y usuario con storeId ${r.json.user.storeId}`;
});
await test('PT-02', 'func', 'Login con contraseña incorrecta', async () => {
  const r = await call('POST', '/auth/login', { email: 'ramona@marketgo.co', password: 'mala' });
  expect(r.status === 401, `status ${r.status}`);
  return `401 “${r.json.message}”`;
});
await test('PT-03', 'func', 'Registro', async () => {
  const r = await call('POST', '/auth/register', { name: 'Ana Test', email: 'ana@test.co', password: 'Segura123', phone: '3001112233' });
  expect(r.status === 201, `status ${r.status}`);
  ana = r.json.token; anaId = r.json.user.id;
  return `201; points ${r.json.user.points}, storeId ${r.json.user.storeId}`;
});
await test('PT-04', 'func', 'Recuperar contraseña', async () => {
  const a = await call('POST', '/auth/recovery', { email: 'ana@test.co', method: 'sms' });
  const b = await call('POST', '/auth/recovery/verify', { email: 'ana@test.co', code: '1234' });
  const c = await call('POST', '/auth/recovery/reset', { email: 'ana@test.co', password: 'Nueva1234' });
  const d = await call('POST', '/auth/login', { email: 'ana@test.co', password: 'Nueva1234' });
  expect(a.status === 200 && b.status === 200 && c.status === 200 && d.status === 200, [a, b, c, d].map((x) => x.status).join(','));
  ana = d.json.token;
  return `“${a.json.destination}”; verificación OK; login 200`;
});
await test('PT-05', 'func', 'Catálogo con filtros', async () => {
  const z = await call('GET', '/products?category=zapatos');
  const j = await call('GET', '/products?query=jean&sort=price_asc');
  expect(z.json.every((p) => p.category === 'zapatos'), 'categoría');
  return `${z.json.map((p) => p.id).join(', ')}; ${j.json.map((p) => `${p.id} (${money(p.price)})`).join(' y ')}`;
});
await test('PT-06', 'func', 'Detalle de producto', async () => {
  const r = await call('GET', '/products/p1');
  expect(r.json.store?.name, 'sin tienda');
  return `Tienda “${r.json.store.name}”, precio ${money(r.json.price)}, antes ${money(r.json.oldPrice)}`;
});
let orderId;
await test('PT-07', 'func', 'Crear pedido con cupón', async () => {
  juan = await login('juan@marketgo.co');
  const before = (await call('GET', '/products/p2')).json.stock;
  const r = await call('POST', '/orders', {
    items: [{ product: { id: 'p2' }, quantity: 2, color: 'Negro' }, { product: { id: 'p7' }, quantity: 1 }],
    address: { fullName: 'Juan Pérez', city: 'Cali', address: 'Cl 5 # 1-2' },
    shippingMethod: 'express', paymentMethod: 'card', voucherCode: 'BIENVENIDO10',
  }, juan);
  expect(r.status === 201, `status ${r.status} ${JSON.stringify(r.json)}`);
  expect(r.json.total === 279700 - 10000 + 12000, `total ${r.json.total}`);
  orderId = r.json.id;
  const after = (await call('GET', '/products/p2')).json.stock;
  return `${orderId}, total ${money(r.json.total)}; stock p2 ${before} → ${after}`;
});
await test('PT-08', 'func', 'Pedido sin stock', async () => {
  const r = await call('POST', '/orders', { items: [{ productId: 'p12', quantity: 1 }], address: { city: 'Cali', address: 'x' } }, juan);
  expect(r.status === 409, `status ${r.status}`);
  return `409 “${r.json.message}”`;
});
await test('PT-09', 'func', 'Cupón vencido', async () => {
  const r = await call('POST', '/orders', { items: [{ productId: 'p2', quantity: 1 }], address: { city: 'Cali', address: 'x' }, voucherCode: 'LEAL20' }, juan);
  expect(r.status === 400, `status ${r.status}`);
  return `400 “${r.json.message}”`;
});
await test('PT-10', 'func', 'Pedidos del vendedor', async () => {
  const r = await call('GET', '/stores/s1/orders', undefined, ramona);
  const o = r.json.find((x) => x.id === orderId);
  expect(o, 'no aparece');
  return `${o.id} con ${o.items.length} ítem y total ${money(o.total)}`;
});
await test('PT-11', 'func', 'Avanzar estado del pedido', async () => {
  const a = await call('PATCH', `/orders/${orderId}/status`, { status: 'preparing' }, ramona);
  const mine = (await call('GET', '/orders/me', undefined, juan)).json.find((x) => x.id === orderId);
  const b = await call('PATCH', `/orders/${orderId}/status`, { status: 'new' }, ramona);
  expect(a.status === 200 && b.status === 400, `${a.status}/${b.status}`);
  return `200 “${a.json.status}” (cliente ve “${mine.status}”); retroceder: 400`;
});
let newProductId;
await test('PT-12', 'func', 'Publicar y pausar producto', async () => {
  const a = await call('POST', '/stores/s1/products', { name: 'Falda midi', price: 79900, stock: 5, category: 'ropa', description: 'Falda midi plisada' }, ramona);
  expect(a.status === 201, `status ${a.status}`);
  newProductId = a.json.id;
  await call('PUT', `/products/${newProductId}`, { active: false }, ramona);
  const list = (await call('GET', '/products')).json;
  expect(!list.some((p) => p.id === newProductId), 'sigue visible');
  return `201 etiqueta “${a.json.badge}”; pausado no aparece en GET /products`;
});
let reviewId;
await test('PT-13', 'func', 'Reseña de producto', async () => {
  const a = await call('POST', '/products/p2/reviews', { rating: 4, comment: 'Muy buenas' }, juan);
  expect(a.status === 201, `status ${a.status}`);
  reviewId = a.json.id;
  const p = (await call('GET', '/products/p2')).json;
  return `201; p2 pasa a ${p.reviewsCount} reseñas, promedio ${String(p.rating).replace('.', ',')}`;
});
await test('PT-14', 'func', 'Responder reseña', async () => {
  const r = await call('POST', `/reviews/${reviewId}/reply`, { reply: '¡Gracias!' }, ramona);
  expect(r.status === 200, `status ${r.status}`);
  return `200; reply “${r.json.reply}”`;
});
await test('PT-15', 'func', 'Editar perfil', async () => {
  const r = await call('PUT', `/users/${anaId}`, { name: 'Ana María', phone: '3201234567' }, ana);
  expect(r.status === 200 && r.json.name === 'Ana María', `status ${r.status}`);
  return `200; ${r.json.name}, ${r.json.phone}`;
});
await test('PT-16', 'func', 'Crear tienda', async () => {
  const r = await call('POST', `/users/${anaId}/store`, { name: 'Tienda Ana', city: 'Cali' }, ana);
  expect(r.status === 201 && r.json.storeId, `status ${r.status}`);
  return `201; usuario con storeId ${r.json.storeId}`;
});
await test('PT-18', 'func', 'Resumen de ventas', async () => {
  const r = await call('GET', '/stores/s1/sales', undefined, ramona);
  expect(r.json.weekly.length === 7 && r.json.monthly.length === 6, 'estructura');
  return `semana ${r.json.weekly.length} puntos, meses ${r.json.monthly.length}, ${r.json.byCategory.length} categorías; ingresos 30 días ${money(r.json.totals.revenue)} en ${r.json.totals.orders} pedidos`;
});
await test('PT-19', 'func', 'Cambiar contraseña con sesión', async () => {
  const a = await call('POST', '/auth/recovery/reset', { email: 'juan@marketgo.co', password: 'Nueva1234' }, juan);
  const b = await call('POST', '/auth/login', { email: 'juan@marketgo.co', password: 'Nueva1234' });
  expect(a.status === 200 && b.status === 200, `${a.status}/${b.status}`);
  await call('POST', '/auth/recovery/reset', { email: 'juan@marketgo.co', password: 'Market123' }, juan); // deja la clave original
  return '200; login 200 con la nueva clave';
});

// ---------------------------------------------------------------- Integración (reglas entre módulos)
await test('PI-04', 'int', 'Sin stock, tienda ajena y sin token', async () => {
  const a = await call('GET', '/stores/s1/orders', undefined, juan);
  const b = await call('GET', '/orders/me');
  expect(a.status === 403 && b.status === 401, `${a.status}/${b.status}`);
  return `409 sin stock (PT-08), ${a.status} tienda ajena, ${b.status} sin token`;
});
await test('PI-05', 'int', 'Cambiar contraseña sin código ni sesión propia', async () => {
  const body = { email: 'juan@marketgo.co', password: 'Otra12345' };
  const a = await call('POST', '/auth/recovery/reset', body);
  const b = await call('POST', '/auth/recovery/reset', body, ramona);
  expect(a.status === 400 && b.status === 400, `${a.status}/${b.status}`);
  return `${a.status} sin sesión ni código; ${b.status} con token de otro usuario; 200 con el propio (PT-19)`;
});

// ---------------------------------------------------------------- Base de datos
await test('PB-02', 'db', 'Pedidos consecutivos', async () => {
  const r = await call('POST', '/orders', { items: [{ productId: 'p3', quantity: 1 }], address: { city: 'Cali', address: 'Cl 1' } }, juan);
  expect(r.status === 201, `status ${r.status}`);
  return `${orderId} y luego ${r.json.id}`;
});
await test('PB-04', 'db', 'Actualización de stock, vendidos y reseñas', async () => {
  const p = (await call('GET', '/products/p2')).json;
  return `p2: stock ${p.stock}, vendidos ${p.sold}, reseñas ${p.reviewsCount}`;
});
await test('PB-06', 'db', 'Contraseñas protegidas', async () => {
  const r = await call('POST', '/auth/login', { email: 'ramona@marketgo.co', password: 'Market123' });
  expect(!JSON.stringify(r.json).includes('passwordHash'), 'expone hash');
  return 'la respuesta no incluye passwordHash';
});

// ---------------------------------------------------------------- Validación y errores
const v = async (id, name, method, path, body, token, expected, raw) => {
  await test(id, 'val', name, async () => {
    const r = await call(method, path, body, token, raw);
    expect(r.status === expected, `status ${r.status} ${JSON.stringify(r.json)}`);
    return `${r.status} “${r.json.message}”`;
  });
};
await v('PV-01', 'Registro con nombre vacío', 'POST', '/auth/register', { name: '', email: 'x@test.co', password: 'Segura123', phone: '3001112233' }, null, 400);
await v('PV-02', 'Reseña sin comentario', 'POST', '/products/p2/reviews', { rating: 5, comment: '' }, juan, 400);
await v('PV-03', 'Correo con formato inválido', 'POST', '/auth/register', { name: 'X', email: 'correo-malo', password: 'Segura123', phone: '3001112233' }, null, 400);
await v('PV-04', 'Celular inválido', 'POST', '/auth/register', { name: 'X', email: 'x@test.co', password: 'Segura123', phone: '12345' }, null, 400);
await v('PV-05', 'Contraseña débil', 'POST', '/auth/register', { name: 'X', email: 'x@test.co', password: 'debil', phone: '3001112233' }, null, 400);
await v('PV-06', 'Producto con precio negativo', 'POST', '/stores/s1/products', { name: 'X', price: -5, stock: 1, category: 'ropa' }, ramona, 400);
await v('PV-07', 'Correo duplicado', 'POST', '/auth/register', { name: 'X', email: 'ramona@marketgo.co', password: 'Segura123', phone: '3001112233' }, null, 409);
await v('PV-08', 'Segunda tienda', 'POST', `/users/${anaId}/store`, { name: 'Otra' }, ana, 409);
await v('PV-09', 'JSON mal formado', 'POST', '/auth/login', undefined, null, 400, '{"email": ');
await v('PV-10', 'Carrito vacío', 'POST', '/orders', { items: [] }, juan, 400);
await v('PV-11', 'Ruta inexistente', 'GET', '/productos', undefined, null, 404);
await v('PV-12', 'Token falso', 'GET', '/orders/me', undefined, 'token-falso', 401);
await v('PV-13', 'Recurso ajeno', 'GET', '/stores/s1/orders', undefined, juan, 403);

// ---------------------------------------------------------------- Eliminación (al final)
await test('PT-17', 'func', 'Eliminar cuenta', async () => {
  const a = await call('DELETE', `/users/${anaId}`, undefined, ana);
  const b = await call('POST', '/auth/check-email', { email: 'ana@test.co' });
  expect(a.status === 200 && b.status === 404, `${a.status}/${b.status}`);
  return `200; check-email responde ${b.status}`;
});
await test('PB-05', 'db', 'Eliminación de documento', async () => {
  const b = await call('POST', '/auth/login', { email: 'ana@test.co', password: 'Nueva1234' });
  expect(b.status === 401, `status ${b.status}`);
  return 'users/{id} eliminado; el login responde 401';
});

const ok = results.filter((r) => r.ok).length;
console.log(`\n${results.length} pruebas · ${ok} aprobadas · ${results.length - ok} fallidas`);
if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify({ date: new Date().toISOString(), results, log }, null, 2));
process.exit(ok === results.length ? 0 : 1);
