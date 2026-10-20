import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { useAuth } from './authStore';
import { formatPrice } from '../utils/formatters';

// Lógica para agregar, eliminar y calcular el total de los ítems del carrito,
// además de los datos del checkout (dirección, envío, método de pago y cupón).
// Se usa useReducer: todas las modificaciones pasan por acciones con nombre,
// lo que hace fácil seguir qué cambió y por qué.

export const SHIPPING_OPTIONS = {
  standard: { id: 'standard', label: 'Estándar', time: '5 a 7 días hábiles', cost: 0 },
  express: { id: 'express', label: 'Express', time: '1 a 2 días hábiles', cost: 12000 },
};

export const PAYMENT_TYPES = {
  card: 'Tarjeta',
  pse: 'PSE',
  nequi: 'Nequi',
  cash: 'Contra entrega',
};

const DEMO_ADDRESS = {
  id: 'a1',
  label: 'Casa',
  fullName: 'Ramona Díaz',
  phone: '3001234567',
  city: 'Bogotá',
  address: 'Cra. 7 # 45-10, Apto 302',
};

const initialState = {
  items: [], // { key, product, quantity, color, size }
  voucher: null,
  shippingMethod: 'standard',
  addresses: [DEMO_ADDRESS],
  selectedAddressId: 'a1',
  savedCards: [{ id: 'c1', brand: 'Visa', last4: '4242', holder: 'RAMONA DIAZ', expiry: '08/28' }],
  payment: { type: 'card', cardId: 'c1' },
};

// La "llave" distingue el mismo producto en distinto color o talla
const itemKey = (productId, color, size) => `${productId}|${color ?? ''}|${size ?? ''}`;

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity = 1, color = null, size = null } = action.payload;
      const key = itemKey(product.id, color, size);
      const existing = state.items.find((i) => i.key === key);
      const items = existing
        ? state.items.map((i) => (i.key === key ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) } : i))
        : [...state.items, { key, product, quantity, color, size }];
      return { ...state, items };
    }
    case 'UPDATE_QUANTITY': {
      const { key, quantity } = action.payload;
      if (quantity <= 0) return { ...state, items: state.items.filter((i) => i.key !== key) };
      return { ...state, items: state.items.map((i) => (i.key === key ? { ...i, quantity } : i)) };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.key !== action.payload) };
    case 'APPLY_VOUCHER':
      return { ...state, voucher: action.payload };
    case 'REMOVE_VOUCHER':
      return { ...state, voucher: null };
    case 'SET_SHIPPING':
      return { ...state, shippingMethod: action.payload };
    case 'ADD_ADDRESS':
      return { ...state, addresses: [...state.addresses, action.payload], selectedAddressId: action.payload.id };
    case 'SELECT_ADDRESS':
      return { ...state, selectedAddressId: action.payload };
    case 'ADD_CARD':
      return {
        ...state,
        savedCards: [...state.savedCards, action.payload],
        payment: { type: 'card', cardId: action.payload.id },
      };
    case 'SET_PAYMENT':
      return { ...state, payment: action.payload };
    case 'CLEAR_CART':
      return { ...state, items: [], voucher: null };
    case 'RESET':
      return action.payload;
    default:
      return state;
  }
}

// Calcula subtotal, descuento, envío y total. Se exporta para poder probarla aislada.
export function calculateTotals(state) {
  const subtotal = state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const count = state.items.reduce((sum, i) => sum + i.quantity, 0);
  let shipping = SHIPPING_OPTIONS[state.shippingMethod].cost;
  let discount = 0;
  let voucherError = null;

  const v = state.voucher;
  if (v) {
    if (subtotal < v.minPurchase) {
      voucherError = `Este cupón requiere una compra mínima de ${formatPrice(v.minPurchase)}`;
    } else if (v.type === 'percent') {
      discount = Math.round((subtotal * v.value) / 100);
    } else if (v.type === 'amount') {
      discount = Math.min(v.value, subtotal);
    } else if (v.type === 'shipping') {
      shipping = 0;
    }
  }

  return { subtotal, count, shipping, discount, voucherError, total: Math.max(0, subtotal - discount + shipping) };
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Cada vez que cambia el usuario (login/logout) el carrito empieza vacío
  useEffect(() => {
    const fresh = user
      ? { ...initialState, addresses: [{ ...DEMO_ADDRESS, fullName: user.name, phone: user.phone }] }
      : initialState;
    dispatch({ type: 'RESET', payload: fresh });
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo(() => {
    const totals = calculateTotals(state);
    return {
      ...state,
      ...totals,
      selectedAddress: state.addresses.find((a) => a.id === state.selectedAddressId) ?? null,
      addItem: (product, options = {}) => dispatch({ type: 'ADD_ITEM', payload: { product, ...options } }),
      updateQuantity: (key, quantity) => dispatch({ type: 'UPDATE_QUANTITY', payload: { key, quantity } }),
      removeItem: (key) => dispatch({ type: 'REMOVE_ITEM', payload: key }),
      applyVoucher: (voucher) => dispatch({ type: 'APPLY_VOUCHER', payload: voucher }),
      removeVoucher: () => dispatch({ type: 'REMOVE_VOUCHER' }),
      setShippingMethod: (method) => dispatch({ type: 'SET_SHIPPING', payload: method }),
      addAddress: (address) => dispatch({ type: 'ADD_ADDRESS', payload: { ...address, id: `a${Date.now()}` } }),
      selectAddress: (id) => dispatch({ type: 'SELECT_ADDRESS', payload: id }),
      addCard: (card) => dispatch({ type: 'ADD_CARD', payload: { ...card, id: `c${Date.now()}` } }),
      setPayment: (payment) => dispatch({ type: 'SET_PAYMENT', payload: payment }),
      clearCart: () => dispatch({ type: 'CLEAR_CART' }),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return context;
}
