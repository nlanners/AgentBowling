/**
 * Integration Test Utilities
 * Common utilities and helpers for integration testing
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider } from '../../contexts';
import { Game, Player, Frame, Roll } from '../../types';

// Import all screens for testing
import HomeScreen from '../../screens/HomeScreen';
import GameScreen from '../../screens/GameScreen';
import HistoryScreen from '../../screens/HistoryScreen';
import StatisticsScreen from '../../screens/StatisticsScreen';
import GameDetailsScreen from '../../screens/GameDetailsScreen';

const Stack = createNativeStackNavigator();

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRouteName?: string;
  initialParams?: Record<string, any>;
}

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: CustomRenderOptions
) => {
  const { initialRouteName, initialParams, ...renderOptions } = options || {};

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRouteName || 'Home'}>
          <Stack.Screen
            name='Home'
            component={HomeScreen}
            initialParams={initialParams}
          />
          <Stack.Screen name='Game' component={GameScreen} />
          <Stack.Screen name='History' component={HistoryScreen} />
          <Stack.Screen name='Statistics' component={StatisticsScreen} />
          <Stack.Screen
            name='GameDetails'
            component={GameDetailsScreen as any}
          />
        </Stack.Navigator>
      </NavigationContainer>
      {children}
    </AppProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
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
        <Stack.Screen name='GameDetails' component={GameDetailsScreen as any} />
      </Stack.Navigator>
    </NavigationContainer>
  </AppProvider>
);

// Mock data generators
export const createMockPlayer = (id: string, name: string): Player => ({
  id,
  name,
});

export const createMockPlayers = (count: number = 2): Player[] => {
  const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];
  return Array.from({ length: count }, (_, index) =>
    createMockPlayer(`player-${index}`, names[index] || `Player ${index + 1}`)
  );
};

export const createMockFrame = (
  rollValues: number[] = [],
  isComplete: boolean = false
): Frame => {
  const rolls: Roll[] = rollValues.map((pins) => ({ pinsKnocked: pins }));
  const totalPins = rollValues.reduce((sum, pins) => sum + pins, 0);

  return {
    rolls,
    isStrike: rollValues.length === 1 && rollValues[0] === 10,
    isSpare:
      rollValues.length === 2 && totalPins === 10 && rollValues[0] !== 10,
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
    scores: isComplete ? scores : undefined,
  };
};

// Create a complete game for testing
export const createCompletedMockGame = (players?: Player[]): Game => {
  const gameId = 'completed-game-' + Date.now();
  const testPlayers = players || createMockPlayers(2);

  // Create 10 frames for each player with realistic scores
  const frames: Frame[][] = [];
  const playerScores: number[] = [];

  testPlayers.forEach((player, playerIndex) => {
    let cumulativeScore = 0;
    const playerFrames: Frame[] = [];

    for (let frameIndex = 0; frameIndex < 10; frameIndex++) {
      let rollValues: number[];
      let frameScore: number;

      // Generate realistic bowling scores
      const rand = Math.random();
      if (rand < 0.1) {
        // 10% chance of strike
        rollValues = [10];
        frameScore = 10;
      } else if (rand < 0.3) {
        // 20% chance of spare
        const firstRoll = Math.floor(Math.random() * 9) + 1;
        rollValues = [firstRoll, 10 - firstRoll];
        frameScore = 10;
      } else {
        // Regular frame
        const firstRoll = Math.floor(Math.random() * 10);
        const secondRoll = Math.floor(Math.random() * (10 - firstRoll));
        rollValues =
          firstRoll === 0 && secondRoll === 0
            ? [1, 2]
            : [firstRoll, secondRoll];
        frameScore = rollValues.reduce((sum, roll) => sum + roll, 0);
      }

      cumulativeScore += frameScore;

      playerFrames.push(createMockFrame(rollValues, true));
    }

    frames.push(playerFrames);
    playerScores.push(cumulativeScore);
  });

  return {
    ...createMockGame(),
    id: gameId,
    players: testPlayers,
    frames,
    currentPlayer: 0,
    currentFrame: 10,
    isComplete: true,
    completed: true,
    scores: playerScores,
  };
};

// Test data for statistics
export const createMockStatistics = () => ({
  basic: {
    gamesPlayed: 15,
    averageScore: 145.2,
    highScore: 234,
    lowScore: 89,
    totalPins: 2178,
    totalFrames: 150,
  },
  frames: {
    framePerformance: {
      1: { strikePercentage: 15, sparePercentage: 35, averageScore: 7.2 },
      2: { strikePercentage: 12, sparePercentage: 38, averageScore: 7.5 },
      3: { strikePercentage: 18, sparePercentage: 32, averageScore: 7.8 },
      4: { strikePercentage: 14, sparePercentage: 36, averageScore: 7.1 },
      5: { strikePercentage: 16, sparePercentage: 34, averageScore: 7.6 },
      6: { strikePercentage: 13, sparePercentage: 37, averageScore: 7.3 },
      7: { strikePercentage: 19, sparePercentage: 31, averageScore: 7.9 },
      8: { strikePercentage: 11, sparePercentage: 39, averageScore: 6.9 },
      9: { strikePercentage: 17, sparePercentage: 33, averageScore: 7.7 },
      10: { strikePercentage: 20, sparePercentage: 30, averageScore: 8.1 },
    },
  },
  rolls: {
    firstRollAverage: 6.8,
    secondRollAverage: 2.1,
    pinsDistribution: [5, 12, 18, 25, 22, 28, 31, 24, 19, 14, 42], // Index = pins knocked down
  },
  trends: {
    scoreProgression: [
      125, 134, 142, 151, 148, 156, 162, 158, 165, 169, 145, 172, 178, 181, 185,
    ],
    recentPerformance: {
      last5Games: 168.4,
      last10Games: 162.7,
      trend: 'improving',
    },
    consistency: {
      standardDeviation: 23.4,
      consistencyRating: 'good',
    },
  },
});

// Helper functions for simulating user interactions
export const simulateGameplay = {
  rollStrike: () => ({ pins: 10, rolls: [10] }),
  rollSpare: (firstRoll: number) => ({
    pins: 10,
    rolls: [firstRoll, 10 - firstRoll],
  }),
  rollRegular: (firstRoll: number, secondRoll: number) => ({
    pins: firstRoll + secondRoll,
    rolls: [firstRoll, secondRoll],
  }),
  rollGutter: () => ({ pins: 0, rolls: [0, 0] }),
};

// Async helpers for testing
export const waitForAsync = (ms: number = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Storage mock helpers
export const createStorageMocks = () => ({
  saveCurrentGame: jest.fn().mockResolvedValue(undefined),
  loadCurrentGame: jest.fn().mockResolvedValue(null),
  clearCurrentGame: jest.fn().mockResolvedValue(undefined),
  getAllGames: jest.fn().mockResolvedValue([]),
  addGame: jest.fn().mockResolvedValue(undefined),
  updateGame: jest.fn().mockResolvedValue(undefined),
  deleteGame: jest.fn().mockResolvedValue(undefined),
  getPlayerStatistics: jest.fn().mockResolvedValue(null),
  updateStatisticsAfterGameChange: jest.fn().mockResolvedValue(undefined),
  invalidatePlayerStatsCache: jest.fn().mockResolvedValue(undefined),
});

// Error simulation helpers
export const simulateStorageError = (
  mockFn: jest.Mock,
  errorMessage: string
) => {
  mockFn.mockRejectedValue(new Error(errorMessage));
};

export const simulateNetworkError = () => {
  // This would simulate network-related errors if the app had online features
  return new Error('Network unavailable');
};

// Performance testing helpers
export const measureRenderTime = async (renderFn: () => any) => {
  const startTime = performance.now();
  const result = await renderFn();
  const endTime = performance.now();
  return {
    result,
    renderTime: endTime - startTime,
  };
};

// Accessibility testing helpers
export const accessibilityHelpers = {
  findByRole: (role: string) => `[role="${role}"]`,
  findByLabel: (label: string) => `[accessibilityLabel="${label}"]`,
  findByHint: (hint: string) => `[accessibilityHint="${hint}"]`,
};

// Test assertion helpers
export const assertGameState = (game: Game, expectedState: Partial<Game>) => {
  Object.keys(expectedState).forEach((key) => {
    expect(game[key as keyof Game]).toEqual(expectedState[key as keyof Game]);
  });
};

export const assertPlayerScore = (
  game: Game,
  playerIndex: number,
  expectedScore: number
) => {
  expect(game.scores?.[playerIndex]).toBe(expectedScore);
};

export const assertFrameState = (
  frame: Frame,
  expectedFrame: Partial<Frame>
) => {
  Object.keys(expectedFrame).forEach((key) => {
    expect(frame[key as keyof Frame]).toEqual(
      expectedFrame[key as keyof Frame]
    );
  });
};

// Integration test constants
export const TEST_IDS = {
  // Screen identifiers
  HOME_SCREEN: 'home-screen',
  GAME_SCREEN: 'game-screen',
  HISTORY_SCREEN: 'history-screen',
  STATISTICS_SCREEN: 'statistics-screen',
  GAME_DETAILS_SCREEN: 'game-details-screen',

  // Navigation buttons
  START_NEW_GAME: 'start-new-game-button',
  CONTINUE_GAME: 'continue-game-button',
  VIEW_HISTORY: 'view-history-button',
  VIEW_STATISTICS: 'view-statistics-button',
  BACK_BUTTON: 'back-button',

  // Game components
  SCOREBOARD: 'scoreboard',
  PIN_INPUT: 'pin-input',
  PLAYER_ROW: (index: number) => `player-row-${index}`,
  FRAME_CELL: (player: number, frame: number) =>
    `frame-cell-${player}-${frame}`,
  PIN_BUTTON: (pins: number) => `pin-button-${pins}`,

  // Game state indicators
  CURRENT_PLAYER_INDICATOR: (index: number) =>
    `current-player-indicator-${index}`,
  GAME_COMPLETION_DIALOG: 'game-completion-dialog',
  FRAME_SCORE: (index: number) => `frame-score-${index}`,

  // History components
  GAME_ITEM: (index: number) => `game-item-${index}`,
  FILTER_BUTTON: 'filter-button',
  EMPTY_HISTORY_MESSAGE: 'empty-history-message',

  // Statistics components
  PLAYER_SELECTOR: 'player-selector',
  PLAYER_OPTION: (index: number) => `player-option-${index}`,
  PLAYER_STATISTICS: (index: number) => `player-statistics-${index}`,
  REFRESH_STATS_BUTTON: 'refresh-stats-button',

  // Error states
  ERROR_MESSAGE: 'error-message',
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
  assertGameState,
  assertPlayerScore,
  assertFrameState,
  TEST_IDS,
};
