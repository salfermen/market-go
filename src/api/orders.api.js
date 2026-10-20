// Endpoints de pedidos (cliente y vendedor).
// Endpoints previstos en Ktor:
//   GET  /orders/me              POST /orders            PATCH /orders/{id}/reviewed
//   GET  /stores/{id}/orders     PATCH /orders/{id}/status
//   GET  /stores/{id}/sales

import { request, USE_MOCK, mockResponse } from './client';
import {
  clientOrders,
  sellerOrders,
  products,
  weeklySales,
  monthlySales,
  salesByCategory,
} from '../data/mockData';

// Cada línea del pedido guarda una "foto" del producto (nombre, ícono, color),
// igual que lo hará el backend, para que el historial no cambie si el producto se edita.
const snapshot = (item) => {
  const p = products.find((x) => x.id === item.productId);
  return { ...item, name: p?.name ?? 'Producto', icon: p?.icon, tone: p?.tone, storeId: p?.storeId };
};
const enrich = (order) => ({ ...order, items: order.items.map(snapshot) });

// Los pedidos de ejemplo pertenecen a los usuarios de demostración
const DEMO_USER_IDS = ['u1', 'u2'];
const myOrdersDb = clientOrders.map((o) => ({ ...enrich(o), userId: 'demo' }));
const belongsTo = (order, userId) =>
  order.userId === userId || (order.userId === 'demo' && DEMO_USER_IDS.includes(userId));
const storeOrdersDb = sellerOrders.map(enrich);

// userId solo lo usa el modo simulado; el backend identificará al usuario por el token
export async function getMyOrders(userId) {
  if (!USE_MOCK) return request('/orders/me');
  return mockResponse(myOrdersDb.filter((o) => belongsTo(o, userId)));
}

export async function createOrder({ userId, items, address, shippingMethod, paymentMethod, voucherCode, totals }) {
  if (!USE_MOCK) {
    return request('/orders', {
      method: 'POST',
      body: { items, address, shippingMethod, paymentMethod, voucherCode },
    });
  }
  const id = `MG-${1049 + myOrdersDb.length}`;
  const order = {
    id,
    userId,
    date: new Date().toISOString().slice(0, 10),
    status: 'paid',
    tracking: `LGS-${Math.floor(100000000000 + Math.random() * 899999999999)}`,
    items: items.map((i) => ({
      productId: i.product.id,
      name: i.product.name,
      icon: i.product.icon,
      tone: i.product.tone,
      quantity: i.quantity,
      price: i.product.price,
      color: i.color,
      size: i.size,
    })),
    shipping: totals.shipping,
    total: totals.total,
    address: `${address.address}, ${address.city}`,
    paymentMethod,
    shippingMethod,
    reviewed: false,
  };
  myOrdersDb.unshift(order);
  return mockResponse(order, 1500); // el pago tarda un poco más
}

export async function markOrderReviewed(orderId) {
  if (!USE_MOCK) return request(`/orders/${orderId}/reviewed`, { method: 'PATCH' });
  const order = myOrdersDb.find((o) => o.id === orderId);
  if (order) order.reviewed = true;
  return mockResponse({ ok: true }, 200);
}

// ---------------------------------------------------------------------------
// Vendedor
// ---------------------------------------------------------------------------
export async function getStoreOrders(storeId) {
  if (!USE_MOCK) return request(`/stores/${storeId}/orders`);
  // En el modo simulado solo la tienda de demostración (s1) tiene pedidos
  return mockResponse(storeId === 's1' ? [...storeOrdersDb] : []);
}

export async function updateOrderStatus(orderId, status) {
  if (!USE_MOCK) return request(`/orders/${orderId}/status`, { method: 'PATCH', body: { status } });
  const order = storeOrdersDb.find((o) => o.id === orderId);
  if (order) order.status = status;
  return mockResponse({ ...order }, 300);
}

export async function getSalesSummary(storeId) {
  if (!USE_MOCK) return request(`/stores/${storeId}/sales`);
  const hasData = storeId === 's1';
  const zero = (list) => list.map((x) => ({ ...x, value: 0 }));
  return mockResponse({
    weekly: hasData ? weeklySales : zero(weeklySales),
    monthly: hasData ? monthlySales : zero(monthlySales),
    byCategory: hasData ? salesByCategory : [],
    totals: hasData
      ? { revenue: 12480000, orders: 248, revenueChange: 18.2, ordersChange: 12.5, avgTicket: 50300, conversion: 3.4 }
      : { revenue: 0, orders: 0, revenueChange: 0, ordersChange: 0, avgTicket: 0, conversion: 0 },
  });
}
