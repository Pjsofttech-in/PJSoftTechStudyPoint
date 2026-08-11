import 'react-native-gesture-handler'; // Recommended at top for gesture & navigator support
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { decode as atob } from 'base-64';
import AuthNavigator from './src/navigation/AuthNavigator';

// Polyfill atob for React Native environment
if (!global.atob) {
  global.atob = atob;
}

// Enable Network Tab inspection in React Native DevTools
if (__DEV__) {
  global.XMLHttpRequest = global.originalXMLHttpRequest || global.XMLHttpRequest;
  global.FormData = global.originalFormData || global.FormData;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthNavigator />
    </SafeAreaProvider>
  );
}