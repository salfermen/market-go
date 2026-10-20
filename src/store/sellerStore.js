import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './authStore';
import * as productsApi from '../api/products.api';
import * as ordersApi from '../api/orders.api';

// Estado del panel del vendedor: productos de su tienda, pedidos recibidos,
// reseñas y resumen de ventas. Se carga cuando el usuario entra en modo vendedor.

export const ORDER_FLOW = ['new', 'preparing', 'shipped', 'delivered'];

export const ORDER_STATUS = {
  new: { label: 'Nuevo', next: 'Preparar pedido' },
  preparing: { label: 'En preparación', next: 'Marcar como enviado' },
  shipped: { label: 'Enviado', next: 'Marcar como entregado' },
  delivered: { label: 'Entregado', next: null },
};

// Umbral para considerar "bajo stock"
export const LOW_STOCK = 5;

const SellerContext = createContext(null);

export function SellerProvider({ children }) {
  const { user, mode } = useAuth();
  const storeId = user?.storeId;
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [sales, setSales] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!storeId || mode !== 'seller') return undefined;
    let active = true;
    setLoading(true);
    Promise.all([
      productsApi.getStoreProducts(storeId),
      ordersApi.getStoreOrders(storeId),
      productsApi.getStoreReviews(storeId),
      ordersApi.getSalesSummary(storeId),
    ])
      .then(([p, o, r, s]) => {
        if (!active) return;
        setProducts(p);
        setOrders(o);
        setReviews(r);
        setSales(s);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [storeId, mode, reloadKey]);

  const addProduct = useCallback(
    async (data) => {
      const product = await productsApi.createProduct(storeId, data);
      setProducts((prev) => [product, ...prev]);
      return product;
    },
    [storeId],
  );

  const editProduct = useCallback(async (productId, changes) => {
    const updated = await productsApi.updateProduct(productId, changes);
    setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
    return updated;
  }, []);

  const toggleProductActive = useCallback(
    (product) => editProduct(product.id, { active: !product.active }),
    [editProduct],
  );

  const advanceOrder = useCallback(async (order) => {
    const nextStatus = ORDER_FLOW[ORDER_FLOW.indexOf(order.status) + 1];
    if (!nextStatus) return;
    await ordersApi.updateOrderStatus(order.id, nextStatus);
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o)));
  }, []);

  const replyToReview = useCallback(async (reviewId, reply) => {
    const updated = await productsApi.replyReview(reviewId, reply);
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, reply: updated.reply } : r)));
  }, []);

  const value = useMemo(() => {
    const active = products.filter((p) => p.active);
    const inventory = {
      normal: active.filter((p) => p.stock > LOW_STOCK).length,
      low: active.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK).length,
      out: active.filter((p) => p.stock === 0).length,
    };
    const rated = reviews.filter((r) => r.rating);
    const averageRating = rated.length ? rated.reduce((s, r) => s + r.rating, 0) / rated.length : 0;
    return {
      storeId,
      products,
      orders,
      reviews,
      sales,
      loading,
      inventory,
      activeProducts: active.length,
      pendingOrders: orders.filter((o) => o.status === 'new' || o.status === 'preparing').length,
      newOrders: orders.filter((o) => o.status === 'new').length,
      averageRating,
      answeredRate: reviews.length ? reviews.filter((r) => r.reply).length / reviews.length : 0,
      addProduct,
      editProduct,
      toggleProductActive,
      advanceOrder,
      replyToReview,
      reload: () => setReloadKey((k) => k + 1),
    };
  }, [storeId, products, orders, reviews, sales, loading, addProduct, editProduct, toggleProductActive, advanceOrder, replyToReview]);

  return <SellerContext.Provider value={value}>{children}</SellerContext.Provider>;
}

export function useSeller() {
  const context = useContext(SellerContext);
  if (!context) throw new Error('useSeller debe usarse dentro de <SellerProvider>');
  return context;
}
