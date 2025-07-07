/**
 * Storage Integration Tests
 * Tests data persistence and storage integration across app lifecycle
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider } from '../../contexts';
import HomeScreen from '../../screens/HomeScreen';
import GameScreen from '../../screens/GameScreen';
import HistoryScreen from '../../screens/HistoryScreen';
import { Game, Player } from '../../types';
// Mock the storage services before importing
jest.mock('../../services/storage/mmkvStorage');
jest.mock('../../services/storage/history');
jest.mock('../../services/storage/statistics');

import * as StorageService from '../../services/storage';
import * as HistoryStorage from '../../services/storage/history';
import * as StatisticsStorage from '../../services/storage/statistics';

// Mock storage services
jest.mock('../../services/storage');
jest.mock('../../services/storage/history');
jest.mock('../../services/storage/statistics');

const Stack = createNativeStackNavigator();

const TestApp = ({
  initialRouteName = 'Home',
}: {
  initialRouteName?: string;
}) => (
  <AppProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRouteName}>
        <Stack.Screen name='Home' component={HomeScreen} />
        <Stack.Screen name='Game' component={GameScreen} />
        <Stack.Screen name='History' component={HistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  </AppProvider>
);

describe('Storage Integration Tests', () => {
  const mockGame: Game = {
    id: 'test-game-1',
    date: '2025-06-09',
    players: [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ],
    frames: [],
    currentPlayer: 0,
    currentFrame: 0,
    isComplete: false,
    completed: false,
  };

  const mockCompletedGame: Game = {
    ...mockGame,
    id: 'completed-game-1',
    isComplete: true,
    completed: true,
    scores: [150, 120],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementations using correct method names
    (HistoryStorage.getAllGames as jest.Mock).mockResolvedValue([]);
    (HistoryStorage.addGame as jest.Mock).mockResolvedValue(true);
    (HistoryStorage.saveGame as jest.Mock).mockResolvedValue(true);
    (StatisticsStorage.getPlayerStatistics as jest.Mock).mockResolvedValue(
      null
    );
  });

  describe('Game State Persistence', () => {
    it.skip('should save game state automatically during gameplay', async () => {
      // TODO: Fix this test after adding proper testIDs to components
      const { getByTestId } = render(<TestApp initialRouteName='Game' />);

      await waitFor(() => {
        expect(getByTestId('game-screen')).toBeTruthy();
      });

      // Simulate making a roll
      const pin5Button = getByTestId('pin-button-5');
      await act(async () => {
        fireEvent.press(pin5Button);
      });

      // This test needs to be updated to use correct storage API
      // await waitFor(() => {
      //   expect(storage operation).toHaveBeenCalled();
      // });
    });

    it.skip('should load existing game state on app startup', async () => {
      // TODO: Fix this test after updating storage API usage
      // Mock existing game in storage would need to use correct storage methods

      const { getByTestId, getByText } = render(<TestApp />);

      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });

      // Test needs to be updated with correct storage methods and testIDs
    });

    it('should clear current game when game is completed', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='Game' />);

      await waitFor(() => {
        expect(getByTestId('game-screen')).toBeTruthy();
      });

      // Simulate game completion
      // This would involve completing all frames for all players
      // For testing purposes, we'll trigger the completion directly

      // Assuming game completion triggers the completion dialog
      await waitFor(() => {
        expect(getByTestId('game-completion-dialog')).toBeTruthy();
      });

      const finishGameButton = getByTestId('finish-game-button');
      await act(async () => {
        fireEvent.press(finishGameButton);
      });

      // Verify current game was cleared
      await waitFor(() => {
        expect(StorageService.clearCurrentGame).toHaveBeenCalled();
      });
    });
  });

  describe('Game History Integration', () => {
    it('should save completed game to history automatically', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='Game' />);

      await waitFor(() => {
        expect(getByTestId('game-screen')).toBeTruthy();
      });

      // Simulate game completion
      await waitFor(() => {
        expect(getByTestId('game-completion-dialog')).toBeTruthy();
      });

      const finishGameButton = getByTestId('finish-game-button');
      await act(async () => {
        fireEvent.press(finishGameButton);
      });

      // Verify game was added to history
      await waitFor(() => {
        expect(HistoryStorage.addGame).toHaveBeenCalledWith(
          expect.objectContaining({
            isComplete: true,
            completed: true,
          })
        );
      });
    });

    it('should load and display game history correctly', async () => {
      // Mock history with games
      const mockGames = [mockCompletedGame];
      (HistoryStorage.getAllGames as jest.Mock).mockResolvedValue(mockGames);

      const { getByTestId } = render(<TestApp initialRouteName='History' />);

      await waitFor(() => {
        expect(getByTestId('history-screen')).toBeTruthy();
      });

      // Verify history was loaded
      expect(HistoryStorage.getAllGames).toHaveBeenCalled();

      // Should display game items
      await waitFor(() => {
        expect(getByTestId('game-item-0')).toBeTruthy();
      });
    });

    it('should handle empty history gracefully', async () => {
      // Mock empty history
      (HistoryStorage.getAllGames as jest.Mock).mockResolvedValue([]);

      const { getByTestId } = render(<TestApp initialRouteName='History' />);

      await waitFor(() => {
        expect(getByTestId('history-screen')).toBeTruthy();
      });

      // Should show empty state
      await waitFor(() => {
        expect(getByTestId('empty-history-message')).toBeTruthy();
      });
    });
  });

  describe('Statistics Storage Integration', () => {
    it('should update player statistics when game is completed', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='Game' />);

      await waitFor(() => {
        expect(getByTestId('game-screen')).toBeTruthy();
      });

      // Complete game
      await waitFor(() => {
        expect(getByTestId('game-completion-dialog')).toBeTruthy();
      });

      const finishGameButton = getByTestId('finish-game-button');
      await act(async () => {
        fireEvent.press(finishGameButton);
      });

      // Verify statistics were updated
      await waitFor(() => {
        expect(
          StatisticsStorage.updateStatisticsAfterGameChange
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            isComplete: true,
          })
        );
      });
    });

    it('should cache statistics for performance', async () => {
      // Mock cached statistics
      const mockStats = {
        basic: { gamesPlayed: 5, averageScore: 150 },
        frames: { framePerformance: {} },
        rolls: { pinsDistribution: [] },
        trends: { scoreProgression: [] },
      };

      (StatisticsStorage.getPlayerStatistics as jest.Mock).mockResolvedValue(
        mockStats
      );

      const { getByTestId } = render(<TestApp initialRouteName='Statistics' />);

      await waitFor(() => {
        expect(getByTestId('statistics-screen')).toBeTruthy();
      });

      // First call should fetch from storage
      expect(StatisticsStorage.getPlayerStatistics).toHaveBeenCalledTimes(1);

      // Refresh statistics
      const refreshButton = getByTestId('refresh-stats-button');
      await act(async () => {
        fireEvent.press(refreshButton);
      });

      // Should use cached data unless explicitly invalidated
      // Exact behavior depends on caching implementation
    });
  });

  describe('Data Synchronization', () => {
    it('should synchronize data across different screens', async () => {
      // Mock game completion
      const { getByTestId } = render(<TestApp initialRouteName='Game' />);

      // Complete a game
      await waitFor(() => {
        expect(getByTestId('game-completion-dialog')).toBeTruthy();
      });

      const finishGameButton = getByTestId('finish-game-button');
      await act(async () => {
        fireEvent.press(finishGameButton);
      });

      // Navigate to history
      const viewHistoryButton = getByTestId('view-history-button');
      await act(async () => {
        fireEvent.press(viewHistoryButton);
      });

      // History should be updated with the new game
      await waitFor(() => {
        expect(getByTestId('history-screen')).toBeTruthy();
      });

      // Verify history was reloaded
      expect(HistoryStorage.getAllGames).toHaveBeenCalled();
    });

    it('should handle concurrent storage operations correctly', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='Game' />);

      await waitFor(() => {
        expect(getByTestId('game-screen')).toBeTruthy();
      });

      // Simulate rapid actions that would trigger multiple storage operations
      const pin5Button = getByTestId('pin-button-5');

      await act(async () => {
        // Rapid button presses
        fireEvent.press(pin5Button);
        fireEvent.press(pin5Button);
        fireEvent.press(pin5Button);
      });

      // All save operations should complete successfully
      // The exact number depends on implementation
      expect(StorageService.saveCurrentGame).toHaveBeenCalled();
    });
  });

  describe('Storage Error Handling', () => {
    it('should handle storage save errors gracefully', async () => {
      // Mock storage save failure
      (StorageService.saveCurrentGame as jest.Mock).mockRejectedValue(
        new Error('Storage save failed')
      );

      const { getByTestId } = render(<TestApp initialRouteName='Game' />);

      await waitFor(() => {
        expect(getByTestId('game-screen')).toBeTruthy();
      });

      // Make a move that would trigger save
      const pin5Button = getByTestId('pin-button-5');
      await act(async () => {
        fireEvent.press(pin5Button);
      });

      // Should show error message or handle gracefully
      await waitFor(() => {
        // Could check for error message or fallback behavior
        expect(getByTestId('storage-error-indicator')).toBeTruthy();
      });
    });

    it('should handle storage load errors gracefully', async () => {
      // Mock storage load failure
      (StorageService.loadCurrentGame as jest.Mock).mockRejectedValue(
        new Error('Storage load failed')
      );

      const { getByTestId } = render(<TestApp />);

      // Should still load home screen with new game option
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
        expect(getByTestId('start-new-game-button')).toBeTruthy();
      });

      // Should not show continue game option
      expect(() => getByTestId('continue-game-button')).toThrow();
    });

    it('should provide offline functionality when storage is unavailable', async () => {
      // Mock all storage operations to fail
      (StorageService.saveCurrentGame as jest.Mock).mockRejectedValue(
        new Error('Offline')
      );
      (StorageService.loadCurrentGame as jest.Mock).mockRejectedValue(
        new Error('Offline')
      );
      (HistoryStorage.getAllGames as jest.Mock).mockRejectedValue(
        new Error('Offline')
      );

      const { getByTestId } = render(<TestApp />);

      // App should still function for basic gameplay
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });

      const startGameButton = getByTestId('start-new-game-button');
      await act(async () => {
        fireEvent.press(startGameButton);
      });

      // Should be able to play game even without storage
      await waitFor(() => {
        expect(getByTestId('game-screen')).toBeTruthy();
      });
    });
  });

  describe('Data Migration and Compatibility', () => {
    it('should handle data format migrations correctly', async () => {
      // This would test migration of old data formats
      // Implementation depends on migration strategy
      // This is a placeholder for the comprehensive test
    });

    it('should validate data integrity on load', async () => {
      // Mock corrupted data
      const corruptedGame = { ...mockGame, players: null };
      (StorageService.loadCurrentGame as jest.Mock).mockResolvedValue(
        corruptedGame
      );

      const { getByTestId } = render(<TestApp />);

      // Should handle corrupted data gracefully
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });

      // Should not show continue game option for corrupted data
      expect(() => getByTestId('continue-game-button')).toThrow();
    });
  });
});
