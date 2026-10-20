import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/store/authStore';
import { ShopProvider } from './src/store/shopStore';
import { CartProvider } from './src/store/cartStore';
import { SellerProvider } from './src/store/sellerStore';
import { colors } from './src/theme';

// Punto de entrada de MarketGO.
// Orden de los providers: el carrito, la tienda y el panel del vendedor
// dependen del usuario, por eso AuthProvider va por fuera.
const navigationTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: colors.primary, background: colors.background },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ShopProvider>
          <CartProvider>
            <SellerProvider>
              <View style={styles.webFrame}>
                <View style={styles.app}>
                  <NavigationContainer theme={navigationTheme} documentTitle={{ formatter: () => 'MarketGO' }}>
                    <AppNavigator />
                  </NavigationContainer>
                </View>
              </View>
            </SellerProvider>
          </CartProvider>
        </ShopProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

// En web la app se centra con ancho de celular; en Android/iOS ocupa toda la pantalla.
const styles = StyleSheet.create({
  webFrame: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Platform.OS === 'web' ? '#ECEAF5' : colors.background,
  },
  app: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    backgroundColor: colors.background,
  },
});
