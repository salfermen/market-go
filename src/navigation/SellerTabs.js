import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ChartColumn, ClipboardList, LayoutDashboard, Package, Store } from 'lucide-react-native';

import StartSeller from '../screens/Seller/StartSeller';
import SellerProducts from '../screens/Seller/SellerProducts';
import SellerOrders from '../screens/Seller/SellerOrders';
import SellerSales from '../screens/Seller/SellerSales';
import SellerProfile from '../screens/Seller/SellerProfile';
import { useSeller } from '../store/sellerStore';
import { tabScreenOptions } from './tabOptions';

// Flujo de vendedor: navegación de pestañas inferiores
// (Panel, Productos/Inventario, Pedidos, Ventas, Perfil de la tienda).
const Tab = createBottomTabNavigator();

export default function SellerTabs() {
  const { newOrders } = useSeller();

  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen
        name="StartSeller"
        component={StartSeller}
        options={{ title: 'Panel', tabBarIcon: ({ color }) => <LayoutDashboard size={22} color={color} />, tabBarButtonTestID: 'tab-StartSeller' }}
      />
      <Tab.Screen
        name="SellerProducts"
        component={SellerProducts}
        options={{ title: 'Productos', tabBarIcon: ({ color }) => <Package size={22} color={color} />, tabBarButtonTestID: 'tab-SellerProducts' }}
      />
      <Tab.Screen
        name="SellerOrders"
        component={SellerOrders}
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color }) => <ClipboardList size={22} color={color} />,
          tabBarBadge: newOrders > 0 ? newOrders : undefined,
          tabBarButtonTestID: 'tab-SellerOrders',
        }}
      />
      <Tab.Screen
        name="SellerSales"
        component={SellerSales}
        options={{ title: 'Ventas', tabBarIcon: ({ color }) => <ChartColumn size={22} color={color} />, tabBarButtonTestID: 'tab-SellerSales' }}
      />
      <Tab.Screen
        name="SellerProfile"
        component={SellerProfile}
        options={{ title: 'Tienda', tabBarIcon: ({ color }) => <Store size={22} color={color} />, tabBarButtonTestID: 'tab-SellerProfile' }}
      />
    </Tab.Navigator>
  );
}
