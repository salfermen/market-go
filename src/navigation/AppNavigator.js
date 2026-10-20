import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../store/authStore';
import AuthStack from './AuthStack';
import ClientTabs from './ClientTabs';
import SellerTabs from './SellerTabs';

// Cliente
import Deliver from '../screens/Client/Deliver';
import History from '../screens/Client/History';
import Payment from '../screens/Client/Payment';
import RecentlyViewed from '../screens/Client/RecentlyViewed';
import UserRewards from '../screens/Client/UserRewards';
import Voucher from '../screens/Client/Voucher';
// Vendedor
import SellerReports from '../screens/Seller/SellerReports';
import SellerReviews from '../screens/Seller/SellerReviews';
// Compartidas
import About from '../screens/Shared/About';
import ChatSupport from '../screens/Shared/ChatSupport';
import EditInfo from '../screens/Shared/EditInfo';
import Filter from '../screens/Shared/Filter';
import FlashSale from '../screens/Shared/FlashSale';
import Product from '../screens/Shared/Product';
import Reviews from '../screens/Shared/Reviews';
import Search from '../screens/Shared/Search';
import Settings from '../screens/Shared/Settings';

import { colors } from '../theme';

// Navegador raíz. Decide qué flujo mostrar según el estado de la sesión:
//   sin usuario        -> AuthStack
//   modo comprador     -> ClientTabs + pantallas de detalle del cliente
//   modo vendedor      -> SellerTabs + pantallas de detalle del vendedor
// Al iniciar o cerrar sesión, React Navigation cambia de flujo automáticamente
// (no hace falta navegar "a mano" a Home o a Login).
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, mode } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {!user ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : mode === 'seller' ? (
        <Stack.Group key="seller">
          <Stack.Screen name="SellerTabs" component={SellerTabs} />
          <Stack.Screen name="SellerReports" component={SellerReports} />
          <Stack.Screen name="SellerReviews" component={SellerReviews} />
          <Stack.Screen name="Product" component={Product} />
          <Stack.Screen name="Reviews" component={Reviews} />
          <Stack.Screen name="ChatSupport" component={ChatSupport} />
          <Stack.Screen name="EditInfo" component={EditInfo} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="About" component={About} />
        </Stack.Group>
      ) : (
        <Stack.Group key="client">
          <Stack.Screen name="ClientTabs" component={ClientTabs} />
          <Stack.Screen name="Product" component={Product} />
          <Stack.Screen name="Search" component={Search} />
          <Stack.Screen name="Filter" component={Filter} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="FlashSale" component={FlashSale} />
          <Stack.Screen name="Reviews" component={Reviews} />
          <Stack.Screen name="Payment" component={Payment} />
          <Stack.Screen name="Deliver" component={Deliver} />
          <Stack.Screen name="History" component={History} />
          <Stack.Screen name="RecentlyViewed" component={RecentlyViewed} />
          <Stack.Screen name="UserRewards" component={UserRewards} />
          <Stack.Screen name="Voucher" component={Voucher} />
          <Stack.Screen name="ChatSupport" component={ChatSupport} />
          <Stack.Screen name="EditInfo" component={EditInfo} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="About" component={About} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
