/**
 * Theme context for the bowling score app
 * Provides theme access throughout the application
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react';
import { useColorScheme } from 'react-native';
import { MMKV } from 'react-native-mmkv';

import { theme, darkTheme, Theme } from '../theme';

// Storage key for theme preference
const THEME_STORAGE_KEY = 'BowlingApp.ThemePreference';

// Theme modes
type ThemeMode = 'light' | 'dark' | 'system';

// Theme context interface
interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Storage instance for persisting theme preference
let storage: MMKV | null = null;

try {
  storage = new MMKV({
    id: 'bowling-app-storage',
  });
} catch (error) {
  console.error('Failed to initialize MMKV storage:', error);
  // Provide a fallback if MMKV fails to initialize
  storage = null;
}

// Theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Get system color scheme
  const colorScheme = useColorScheme();

  // Initialize theme mode from storage or default to system
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (storage) {
      const savedMode = storage.getString(THEME_STORAGE_KEY);
      return (savedMode as ThemeMode) || 'system';
    }
    return 'system';
  });

  // Determine if dark mode is active
  const isDark = useMemo(() => {
    if (mode === 'system') {
      return colorScheme === 'dark';
    }
    return mode === 'dark';
  }, [mode, colorScheme]);

  // Get current theme based on mode
  const currentTheme = useMemo(() => {
    return isDark ? darkTheme : theme;
  }, [isDark]);

  // Toggle between light and dark mode
  const toggleMode = () => {
    if (mode === 'light') {
      setMode('dark');
    } else {
      setMode('light');
    }
  };

  // Update stored theme preference when mode changes
  useEffect(() => {
    if (storage) {
      storage.set(THEME_STORAGE_KEY, mode);
    }
  }, [mode]);

  // Context value
  const contextValue = useMemo(
    () => ({
      theme: currentTheme,
      mode,
      isDark,
      setMode,
      toggleMode,
    }),
    [currentTheme, mode, isDark]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for accessing theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

export default ThemeProvider;
