import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import * as authApi from '../api/auth.api';
import { setAuthToken } from '../api/client';

// Guarda los datos del usuario logueado, su modo actual (comprador/vendedor)
// y el token de sesión. Se implementa con React Context para no agregar
// librerías de estado: el proyecto todavía es pequeño.
//
// mode: 'client'  -> pestañas del comprador (ClientTabs)
//       'seller'  -> pestañas del vendedor (SellerTabs)
// Un mismo usuario puede comprar y, si activa su tienda, vender.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [mode, setMode] = useState('client');

  // Inicia la sesión con la respuesta { user, token } del backend
  const startSession = useCallback((session) => {
    setAuthToken(session.token);
    setToken(session.token);
    setUser(session.user);
    setMode('client');
    return session.user;
  }, []);

  const login = useCallback(
    async (email, password) => startSession(await authApi.login(email, password)),
    [startSession],
  );

  // El registro devuelve la sesión SIN iniciarla, para que la pantalla pueda
  // mostrar primero la confirmación de cuenta creada.
  const signUp = useCallback((data) => authApi.register(data), []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setMode('client');
  }, []);

  const updateUser = useCallback(
    async (changes) => {
      const updated = await authApi.updateProfile(user.id, changes);
      setUser(updated);
      return updated;
    },
    [user],
  );

  const createStore = useCallback(
    async (storeData) => {
      const updated = await authApi.createStore(user.id, storeData);
      setUser(updated);
      return updated;
    },
    [user],
  );

  const deleteAccount = useCallback(async () => {
    await authApi.deleteAccount(user.id);
    logout();
  }, [user, logout]);

  const changePoints = useCallback((delta) => {
    setUser((current) => (current ? { ...current, points: Math.max(0, current.points + delta) } : current));
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      mode,
      isSeller: mode === 'seller',
      setMode,
      startSession,
      login,
      signUp,
      logout,
      updateUser,
      createStore,
      deleteAccount,
      changePoints,
    }),
    [user, token, mode, startSession, login, signUp, logout, updateUser, createStore, deleteAccount, changePoints],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
}
