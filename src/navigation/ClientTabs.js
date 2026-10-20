import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Heart, House, LayoutGrid, ShoppingBag, UserRound } from 'lucide-react-native';

import ShopClient from '../screens/Client/ShopClient';
import Wishlist from '../screens/Client/Wishlist';
import Categories from '../screens/Client/Categories';
import Cart from '../screens/Client/Cart';
import ProfileClient from '../screens/Client/ProfileClient';
import { useCart } from '../store/cartStore';
import { tabScreenOptions } from './tabOptions';

// Flujo de comprador: navegación de pestañas inferiores
// (Inicio, Favoritos, Categorías, Carrito, Perfil), igual que en el prototipo.
const Tab = createBottomTabNavigator();

export default function ClientTabs() {
  const { count } = useCart();

  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen
        name="ShopClient"
        component={ShopClient}
        options={{ title: 'Inicio', tabBarIcon: ({ color }) => <House size={22} color={color} />, tabBarButtonTestID: 'tab-ShopClient' }}
      />
      <Tab.Screen
        name="Wishlist"
        component={Wishlist}
        options={{ title: 'Favoritos', tabBarIcon: ({ color }) => <Heart size={22} color={color} />, tabBarButtonTestID: 'tab-Wishlist' }}
      />
      <Tab.Screen
        name="Categories"
        component={Categories}
        options={{ title: 'Categorías', tabBarIcon: ({ color }) => <LayoutGrid size={22} color={color} />, tabBarButtonTestID: 'tab-Categories' }}
      />
      <Tab.Screen
        name="Cart"
        component={Cart}
        options={{
          title: 'Carrito',
          tabBarIcon: ({ color }) => <ShoppingBag size={22} color={color} />,
          tabBarBadge: count > 0 ? count : undefined,
          tabBarButtonTestID: 'tab-Cart',
        }}
      />
      <Tab.Screen
        name="ProfileClient"
        component={ProfileClient}
        options={{ title: 'Perfil', tabBarIcon: ({ color }) => <UserRound size={22} color={color} />, tabBarButtonTestID: 'tab-ProfileClient' }}
      />
    </Tab.Navigator>
  );
}
