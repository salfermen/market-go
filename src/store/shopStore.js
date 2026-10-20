import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './authStore';
import { getMyOrders, markOrderReviewed } from '../api/orders.api';
import { demoUsers } from '../data/mockData';

// Estado de compra del cliente que no es el carrito:
// favoritos, vistos recientemente, historial de búsqueda, tiendas seguidas,
// cupones obtenidos y pedidos realizados.

const ShopContext = createContext(null);

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

// Datos iniciales para que los usuarios de demostración vean la app "con vida"
const demoSeed = () => ({
  wishlist: ['p3', 'p9', 'p6', 'p15'],
  recentlyViewed: [
    { productId: 'p1', viewedAt: daysAgo(0) },
    { productId: 'p7', viewedAt: daysAgo(0) },
    { productId: 'p5', viewedAt: daysAgo(0) },
    { productId: 'p10', viewedAt: daysAgo(1) },
    { productId: 'p11', viewedAt: daysAgo(1) },
    { productId: 'p4', viewedAt: daysAgo(1) },
  ],
  searchHistory: ['vestido', 'mochila wayuu', 'tenis blancos'],
  claimedVoucherIds: ['v1', 'v2'],
});

const emptySeed = () => ({ wishlist: [], recentlyViewed: [], searchHistory: [], claimedVoucherIds: ['v1'] });

export function ShopProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [followedStores, setFollowedStores] = useState([]);
  const [claimedVoucherIds, setClaimedVoucherIds] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Al iniciar sesión se cargan los datos del usuario; al cerrar sesión se limpian
  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }
    const seed = demoUsers.some((d) => d.id === user.id) ? demoSeed() : emptySeed();
    setWishlist(seed.wishlist);
    setRecentlyViewed(seed.recentlyViewed);
    setSearchHistory(seed.searchHistory);
    setClaimedVoucherIds(seed.claimedVoucherIds);
    setFollowedStores([]);

    let active = true;
    setOrdersLoading(true);
    getMyOrders(user.id)
      .then((list) => active && setOrders(list))
      .finally(() => active && setOrdersLoading(false));
    return () => {
      active = false;
    };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleWishlist = useCallback((productId) => {
    setWishlist((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [productId, ...prev]));
  }, []);

  const addRecentlyViewed = useCallback((productId) => {
    setRecentlyViewed((prev) => [
      { productId, viewedAt: new Date().toISOString() },
      ...prev.filter((item) => item.productId !== productId),
    ].slice(0, 20));
  }, []);

  const addSearch = useCallback((term) => {
    const clean = term.trim().toLowerCase();
    if (!clean) return;
    setSearchHistory((prev) => [clean, ...prev.filter((t) => t !== clean)].slice(0, 8));
  }, []);

  const toggleFollowStore = useCallback((storeId) => {
    setFollowedStores((prev) => (prev.includes(storeId) ? prev.filter((id) => id !== storeId) : [...prev, storeId]));
  }, []);

  const claimVoucher = useCallback((voucherId) => {
    setClaimedVoucherIds((prev) => (prev.includes(voucherId) ? prev : [...prev, voucherId]));
  }, []);

  const addOrder = useCallback((order) => setOrders((prev) => [order, ...prev]), []);

  const setOrderReviewed = useCallback(async (orderId) => {
    await markOrderReviewed(orderId);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, reviewed: true } : o)));
  }, []);

  const value = useMemo(
    () => ({
      wishlist,
      isInWishlist: (id) => wishlist.includes(id),
      toggleWishlist,
      recentlyViewed,
      addRecentlyViewed,
      clearRecentlyViewed: () => setRecentlyViewed([]),
      searchHistory,
      addSearch,
      clearSearchHistory: () => setSearchHistory([]),
      followedStores,
      toggleFollowStore,
      claimedVoucherIds,
      claimVoucher,
      orders,
      ordersLoading,
      addOrder,
      setOrderReviewed,
    }),
    [wishlist, toggleWishlist, recentlyViewed, addRecentlyViewed, searchHistory, addSearch, followedStores,
      toggleFollowStore, claimedVoucherIds, claimVoucher, orders, ordersLoading, addOrder, setOrderReviewed],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop debe usarse dentro de <ShopProvider>');
  return context;
}
