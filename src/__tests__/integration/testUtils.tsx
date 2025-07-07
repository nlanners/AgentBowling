/**
 * Test utilities for integration tests
 * Provides mock data, helper functions, and common test components
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider } from '../../contexts';
import HomeScreen from '../../screens/HomeScreen';
import GameScreen from '../../screens/GameScreen';
import HistoryScreen from '../../screens/HistoryScreen';
import StatisticsScreen from '../../screens/StatisticsScreen';
import { Game, Player, Frame, PlayerStatistics } from '../../types';

// Mock navigation stack
const Stack = createNativeStackNavigator();

// Render component with providers
export const renderWithProviders = (component: React.ReactElement) => {
  return render(<AppProvider>{component}</AppProvider>);
};

// Create a full app for testing complete flows
export const TestApp = ({
  initialRouteName = 'Home',
  initialParams = {},
}: {
  initialRouteName?: string;
  initialParams?: Record<string, any>;
}) => (
  <AppProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRouteName}>
        <Stack.Screen
          name='Home'
          component={HomeScreen}
          initialParams={initialParams}
        />
        <Stack.Screen name='Game' component={GameScreen} />
        <Stack.Screen name='History' component={HistoryScreen} />
        <Stack.Screen name='Statistics' component={StatisticsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  </AppProvider>
);

// Mock data generators
export const createMockPlayer = (
  id: string = '1',
  name: string = 'Test Player'
): Player => ({
  id,
  name,
});

export const createMockPlayers = (count: number = 2): Player[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockPlayer(`${index + 1}`, `Player ${index + 1}`)
  );
};

export const createMockFrame = (
  rolls: number[] = [5, 3],
  options: {
    isStrike?: boolean;
    isSpare?: boolean;
    score?: number;
    cumulativeScore?: number;
  } = {}
): Frame => {
  const totalPins = rolls.reduce((sum, roll) => sum + roll, 0);
  const {
    isStrike = totalPins === 10 && rolls.length === 1,
    isSpare = totalPins === 10 && rolls.length === 2,
    score = totalPins,
    cumulativeScore = 0, // This would be calculated by scoring logic
  } = options;

  return {
    rolls,
    isStrike,
    isSpare,
    score: totalPins,
    cumulativeScore: 0, // This would be calculated by scoring logic
  };
};

export const createMockGame = (
  options: {
    id?: string;
    players?: Player[];
    frames?: Frame[][];
    currentPlayer?: number;
    currentFrame?: number;
    isComplete?: boolean;
    scores?: number[];
  } = {}
): Game => {
  const {
    id = 'test-game-1',
    players = createMockPlayers(2),
    frames = [],
    currentPlayer = 0,
    currentFrame = 0,
    isComplete = false,
    scores = [],
  } = options;

  return {
    id,
    date: new Date().toISOString().split('T')[0],
    players,
    frames,
    currentPlayer,
    currentFrame,
    isComplete,
    completed: isComplete,
    scores,
  };
};

export const createCompletedMockGame = (): Game => {
  const players = createMockPlayers(2);
  const frames = [
    [createMockFrame([10], { isStrike: true, score: 10 })], // Strike
    [createMockFrame([7, 3], { isSpare: true, score: 10 })], // Spare
    [createMockFrame([5, 2], { score: 7 })], // Open frame
  ];

  return {
    id: 'completed-game-1',
    date: new Date().toISOString().split('T')[0],
    players,
    frames,
    currentPlayer: 0,
    currentFrame: 10,
    isComplete: true,
    completed: true,
    scores: [180, 165],
  };
};

export const createMockStatistics = (): PlayerStatistics => ({
  basic: {
    gamesPlayed: 10,
    highScore: 200,
    lowScore: 90,
    averageScore: 145,
    totalPins: 1450,
    totalFrames: 100,
  },
  frames: {
    framePerformance: {
      1: {
        strikes: 3,
        spares: 2,
        opens: 5,
        average: 7.5,
        strikePercentage: 30,
        sparePercentage: 20,
      },
      2: {
        strikes: 2,
        spares: 3,
        opens: 5,
        average: 7.2,
        strikePercentage: 20,
        sparePercentage: 30,
      },
    },
  },
  rolls: {
    firstRollAverage: 6.5,
    secondRollAverage: 2.8,
    pinsDistribution: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  trends: {
    recentGames: [120, 135, 150, 165, 180],
    scoreProgression: [120, 128, 135, 142, 150],
    consistency: 0.85,
  },
});

// Simulation helpers
export const simulateGameplay = async (
  gameContext: any,
  moves: { pins: number; player?: number }[]
) => {
  for (const move of moves) {
    if (move.player !== undefined) {
      // Switch to specific player if needed
      // This would depend on your actual game context API
    }

    // Simulate pin input
    // This would depend on your actual game context API
    await gameContext.addRoll(move.pins);
  }
};

// Storage mocking utilities
export const createStorageMocks = () => {
  const mockStorage = {};

  return {
    get: jest.fn((key: string) => mockStorage[key] || null),
    set: jest.fn((key: string, value: any) => {
      mockStorage[key] = value;
    }),
    delete: jest.fn((key: string) => {
      delete mockStorage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    }),
    getAllKeys: jest.fn(() => Object.keys(mockStorage)),
  };
};

export const simulateStorageError = (
  errorMessage: string = 'Storage error'
) => {
  return {
    get: jest.fn().mockRejectedValue(new Error(errorMessage)),
    set: jest.fn().mockRejectedValue(new Error(errorMessage)),
    delete: jest.fn().mockRejectedValue(new Error(errorMessage)),
    clear: jest.fn().mockRejectedValue(new Error(errorMessage)),
    getAllKeys: jest.fn().mockRejectedValue(new Error(errorMessage)),
  };
};

// Performance testing utilities
export const measureRenderTime = async (renderFn: () => any) => {
  const start = performance.now();
  await renderFn();
  const end = performance.now();
  return end - start;
};

// Accessibility testing helpers
export const accessibilityHelpers = {
  findByA11yLabel: (getByLabelText: any, label: string) => {
    try {
      return getByLabelText(label);
    } catch (error) {
      return null;
    }
  },

  findByA11yHint: (getByA11yHint: any, hint: string) => {
    try {
      return getByA11yHint(hint);
    } catch (error) {
      return null;
    }
  },

  checkElementAccessibility: (element: any) => {
    // Basic accessibility checks
    const hasLabel =
      element.props.accessibilityLabel || element.props['aria-label'];
    const hasRole = element.props.accessibilityRole || element.props.role;

    return {
      hasLabel: !!hasLabel,
      hasRole: !!hasRole,
      isAccessible: hasLabel && hasRole,
    };
  },
};

// Common test IDs for consistent testing
export const TEST_IDS = {
  // Home screen
  HOME_SCREEN: 'home-screen',
  START_NEW_GAME_BUTTON: 'start-new-game-button',
  CONTINUE_GAME_BUTTON: 'continue-game-button',
  VIEW_HISTORY_BUTTON: 'view-history-button',
  VIEW_STATISTICS_BUTTON: 'view-statistics-button',

  // Game screen
  GAME_SCREEN: 'game-screen',
  SCOREBOARD: 'scoreboard',
  PIN_INPUT: 'pin-input',
  PIN_BUTTON: (pins: number) => `pin-button-${pins}`,
  PLAYER_ROW: (index: number) => `player-row-${index}`,
  CURRENT_PLAYER_INDICATOR: (index: number) =>
    `current-player-indicator-${index}`,
  FRAME_CELL: (player: number, frame: number) =>
    `frame-cell-${player}-${frame}`,
  GAME_COMPLETION_DIALOG: 'game-completion-dialog',
  FINISH_GAME_BUTTON: 'finish-game-button',
  BACK_TO_HOME_BUTTON: 'back-to-home-button',

  // History screen
  HISTORY_SCREEN: 'history-screen',
  GAME_ITEM: (index: number) => `game-item-${index}`,
  EMPTY_HISTORY_MESSAGE: 'empty-history-message',
  BACK_BUTTON: 'back-button',
  VIEW_GAME_HISTORY_BUTTON: 'view-game-history-button',

  // Statistics screen
  STATISTICS_SCREEN: 'statistics-screen',
  REFRESH_STATS_BUTTON: 'refresh-stats-button',
  CHART_LOADING: 'chart-loading',

  // Common UI elements
  ERROR_MESSAGE: 'error-message',
  LOADING_INDICATOR: 'loading-indicator',
  STRIKE_INDICATOR: 'strike-indicator',
  SPARE_INDICATOR: 'spare-indicator',

  // Storage and error states
  STORAGE_ERROR_INDICATOR: 'storage-error-indicator',

  // Loading states
  LOADING_INDICATOR: 'loading-indicator',
  CHART_LOADING: 'chart-loading',
};

export default {
  renderWithProviders,
  TestApp,
  createMockPlayer,
  createMockPlayers,
  createMockGame,
  createCompletedMockGame,
  createMockStatistics,
  simulateGameplay,
  createStorageMocks,
  simulateStorageError,
  measureRenderTime,
  accessibilityHelpers,
  TEST_IDS,
};
