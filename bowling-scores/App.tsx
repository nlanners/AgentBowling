import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text } from 'react-native';
import ThemeProvider, { useTheme } from './src/contexts/ThemeContext';

// Main app component wrapped with theme provider
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

// App content using theme
const AppContent = () => {
  const { theme, isDark } = useTheme();

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.default },
      ]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Text style={[styles.text, { color: theme.colors.text.primary }]}>
        Bowling Score App
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
