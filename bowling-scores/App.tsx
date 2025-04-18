import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/contexts';
import AppNavigator from './src/navigation';

// Main app component wrapped with app provider
export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style='auto' />
        <AppNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}
