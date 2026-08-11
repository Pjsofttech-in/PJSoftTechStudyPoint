import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '../store/authStore';

import UserLogin from '../screens/auth/UserLogin';
import DrawerNavigator from './DrawerNavigator';

const Stack = createStackNavigator();

export default function AuthNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={UserLogin} />
        ) : (
          <Stack.Screen name="MainApp" component={DrawerNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}