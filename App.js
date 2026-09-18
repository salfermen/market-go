import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Agrega ./src/ en la ruta de las pantallas
import Start from './src/screens/Start';
import ShopClient from './src/screens/ShopClient';
import Categories from './src/screens/Categories';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen 
          name="Start" 
          component={Start} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ShopClient" 
          component={ShopClient} 
          options={{ title: 'Tienda' }} 
        />
        <Stack.Screen 
          name="Categories" 
          component={Categories} 
          options={{ title: 'Categorías' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}