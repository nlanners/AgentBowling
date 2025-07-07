import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/contexts';
import AppNavigator from './src/navigation';
import { ErrorBoundary } from './src/components/ui';
import { errorHandler } from './src/services/errorHandling';

// Main app component wrapped with app provider
export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary
        onError={(error, errorInfo) => {
          // Log React errors to our error handling service
          errorHandler.handleReactError(error, errorInfo, {
            location: 'App Root',
          });
        }}
        resetOnPropsChange={true}>
        <AppProvider>
          <StatusBar style='auto' />
          <AppNavigator />
        </AppProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
