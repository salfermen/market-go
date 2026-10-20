// Endpoints para listar, crear o editar productos, categorías, tiendas y reseñas.
// Endpoints previstos en Ktor:
//   GET  /products?query=&category=...      GET  /products/{id}
//   GET  /categories                         GET  /stores/{id}
//   GET  /products/{id}/reviews              POST /products/{id}/reviews
//   GET  /stores/{id}/products               POST /stores/{id}/products
//   PUT  /products/{id}                      GET  /stores/{id}/reviews
//   POST /reviews/{id}/reply

import { request, toQuery, USE_MOCK, mockResponse, mockError } from './client';
import { getDiscount } from '../utils/formatters';
import {
  products as mockProducts,
  categories as mockCategories,
  reviews as mockReviews,
  stores,
} from '../data/mockData';

// "Base de datos" en memoria del modo simulado
const productsDb = mockProducts.map((p) => ({ active: true, ...p }));
const reviewsDb = mockReviews.map((r) => ({ ...r }));

// Simula el filtrado y ordenamiento que hará el backend
function applyFilters(list, filters = {}) {
  const {
    query, category, subcategory, gender, storeId, minPrice, maxPrice,
    minRating, size, color, onlyDiscount, discount, sort,
  } = filters;
  const text = query?.trim().toLowerCase();

  let result = list.filter((p) => {
    if (text && !`${p.name} ${p.subcategory} ${p.category}`.toLowerCase().includes(text)) return false;
    if (category && p.category !== category) return false;
    if (subcategory && p.subcategory !== subcategory) return false;
    if (gender && p.gender !== gender && p.gender !== 'unisex') return false;
    if (storeId && p.storeId !== storeId) return false;
    if (minPrice && p.price < Number(minPrice)) return false;
    if (maxPrice && p.price > Number(maxPrice)) return false;
    if (minRating && p.rating < Number(minRating)) return false;
    if (size && !p.sizes.includes(size)) return false;
    if (color && !p.colors.some((c) => c.name === color)) return false;
    if (onlyDiscount && !p.oldPrice) return false;
    if (discount && getDiscount(p.price, p.oldPrice) < Number(discount)) return false;
    return true;
  });

  const sorters = {
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating,
    newest: (a, b) => Number(b.isNew) - Number(a.isNew),
    popular: (a, b) => b.sold - a.sold,
  };
  if (sorters[sort]) result = [...result].sort(sorters[sort]);
  return result;
}

export async function getProducts(filters = {}) {
  if (!USE_MOCK) return request(`/products${toQuery(filters)}`);
  return mockResponse(applyFilters(productsDb.filter((p) => p.active), filters));
}

export async function getProductById(id) {
  if (!USE_MOCK) return request(`/products/${id}`);
  const product = productsDb.find((p) => p.id === id);
  if (!product) return mockError('Producto no encontrado', 404);
  const store = stores.find((s) => s.id === product.storeId);
  return mockResponse({ ...product, store });
}

export async function getCategories() {
  if (!USE_MOCK) return request('/categories');
  return mockResponse(mockCategories, 200);
}

export async function getStore(storeId) {
  if (!USE_MOCK) return request(`/stores/${storeId}`);
  const store = stores.find((s) => s.id === storeId);
  if (!store) return mockError('Tienda no encontrada', 404);
  return mockResponse(store, 200);
}

export async function getReviews(productId) {
  if (!USE_MOCK) return request(`/products/${productId}/reviews`);
  const list = reviewsDb.filter((r) => r.productId === productId).sort((a, b) => b.date.localeCompare(a.date));
  return mockResponse(list);
}

export async function addReview(productId, { rating, comment, author }) {
  if (!USE_MOCK) return request(`/products/${productId}/reviews`, { method: 'POST', body: { rating, comment } });
  const review = {
    id: `r${reviewsDb.length + 1}`,
    productId,
    author,
    rating,
    comment: comment.trim(),
    date: new Date().toISOString().slice(0, 10),
    reply: null,
  };
  reviewsDb.unshift(review);
  return mockResponse(review, 500);
}

// ---------------------------------------------------------------------------
// Vendedor
// ---------------------------------------------------------------------------
export async function getStoreProducts(storeId) {
  if (!USE_MOCK) return request(`/stores/${storeId}/products`);
  return mockResponse(productsDb.filter((p) => p.storeId === storeId));
}

export async function createProduct(storeId, data) {
  if (!USE_MOCK) return request(`/stores/${storeId}/products`, { method: 'POST', body: data });
  const category = mockCategories.find((c) => c.id === data.category);
  const product = {
    id: `p${productsDb.length + 1}`,
    name: data.name.trim(),
    category: data.category,
    subcategory: category?.name ?? 'General',
    gender: 'unisex',
    price: Number(data.price),
    oldPrice: null,
    rating: 0,
    reviewsCount: 0,
    stock: Number(data.stock),
    sold: 0,
    colors: [],
    sizes: ['Única'],
    material: '—',
    origin: 'Colombia',
    storeId,
    badge: 'Nuevo',
    icon: category?.icon ?? 'Package',
    tone: category?.tone ?? '#EDE9FE',
    isNew: true,
    isPopular: false,
    isFlash: false,
    active: true,
    description: data.description?.trim() || 'Sin descripción.',
  };
  productsDb.unshift(product);
  return mockResponse(product, 600);
}

export async function updateProduct(productId, changes) {
  if (!USE_MOCK) return request(`/products/${productId}`, { method: 'PUT', body: changes });
  const product = productsDb.find((p) => p.id === productId);
  if (!product) return mockError('Producto no encontrado', 404);
  Object.assign(product, changes);
  return mockResponse({ ...product }, 400);
}

export async function getStoreReviews(storeId) {
  if (!USE_MOCK) return request(`/stores/${storeId}/reviews`);
  const ids = productsDb.filter((p) => p.storeId === storeId).map((p) => p.id);
  const list = reviewsDb
    .filter((r) => ids.includes(r.productId))
    .map((r) => ({ ...r, productName: productsDb.find((p) => p.id === r.productId)?.name }))
    .sort((a, b) => b.date.localeCompare(a.date));
  return mockResponse(list);
}

export async function replyReview(reviewId, reply) {
  if (!USE_MOCK) return request(`/reviews/${reviewId}/reply`, { method: 'POST', body: { reply } });
  const review = reviewsDb.find((r) => r.id === reviewId);
  review.reply = reply.trim();
  return mockResponse({ ...review }, 400);
}
