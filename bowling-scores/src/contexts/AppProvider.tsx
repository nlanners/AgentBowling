/**
 * Application Provider Component
 * Combines all context providers into a single wrapper component
 */

import React from 'react';
import ThemeProvider from './ThemeContext';
import GameProvider from './GameContext';
import PlayerProvider from './PlayerContext';
import HistoryProvider from './HistoryContext';

interface AppProviderProps {
  children: React.ReactNode;
}

/**
 * App Provider combines all context providers for the application
 * Ordering matters - providers that depend on other contexts should be nested inside them
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <PlayerProvider>
        <HistoryProvider>
          <GameProvider>{children}</GameProvider>
        </HistoryProvider>
      </PlayerProvider>
    </ThemeProvider>
  );
};

export default AppProvider;
