import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Start from '../screens/Auth/Start';
import CreateAccount from '../screens/Auth/CreateAccount';
import Login from '../screens/Auth/Login';
import Password from '../screens/Auth/Password';
import PasswordRecovery from '../screens/Auth/PasswordRecovery';

// Flujo de autenticación (usuario sin sesión):
// Start -> (Bienvenida) -> CreateAccount | Login -> Password -> PasswordRecovery
const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Start" screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Start" component={Start} />
      <Stack.Screen name="CreateAccount" component={CreateAccount} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Password" component={Password} />
      <Stack.Screen name="PasswordRecovery" component={PasswordRecovery} />
    </Stack.Navigator>
  );
}
