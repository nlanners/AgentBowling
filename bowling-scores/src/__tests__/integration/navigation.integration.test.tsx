/**
 * Navigation Integration Tests
 * Tests navigation flows and screen transitions
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider } from '../../contexts';
import HomeScreen from '../../screens/HomeScreen';
import GameScreen from '../../screens/GameScreen';
import HistoryScreen from '../../screens/HistoryScreen';
import StatisticsScreen from '../../screens/StatisticsScreen';
import { Player } from '../../types';

// Create a test navigator with all main screens
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
        <Stack.Screen name='Statistics' component={StatisticsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  </AppProvider>
);

describe('Navigation Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Home Screen Navigation', () => {
    it('should navigate to new game when start game button is pressed', async () => {
      const { getByTestId, getByText } = render(<TestApp />);

      // Wait for home screen to load
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });

      // Find and press the "Start New Game" button
      const startGameButton = getByTestId('start-new-game-button');

      await act(async () => {
        fireEvent.press(startGameButton);
      });

      // Should navigate to game screen
      await waitFor(() => {
        expect(getByTestId('game-screen')).toBeTruthy();
      });
    });

    it('should navigate to history when view history button is pressed', async () => {
      const { getByTestId } = render(<TestApp />);

      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });

      const historyButton = getByTestId('view-history-button');

      await act(async () => {
        fireEvent.press(historyButton);
      });

      await waitFor(() => {
        expect(getByTestId('history-screen')).toBeTruthy();
      });
    });

    it('should navigate to statistics when view statistics button is pressed', async () => {
      const { getByTestId } = render(<TestApp />);

      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });

      const statisticsButton = getByTestId('view-statistics-button');

      await act(async () => {
        fireEvent.press(statisticsButton);
      });

      await waitFor(() => {
        expect(getByTestId('statistics-screen')).toBeTruthy();
      });
    });

    it('should navigate to game with existing players when continue game button is pressed', async () => {
      const { getByTestId } = render(<TestApp />);

      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });

      // Assuming there's an existing game
      const continueGameButton = getByTestId('continue-game-button');

      await act(async () => {
        fireEvent.press(continueGameButton);
      });

      await waitFor(() => {
        expect(getByTestId('game-screen')).toBeTruthy();
      });
    });
  });

  describe('Game Screen Navigation', () => {
    it('should navigate back to home when back button is pressed', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='Game' />);

      await waitFor(() => {
        expect(getByTestId('game-screen')).toBeTruthy();
      });

      const backButton = getByTestId('back-to-home-button');

      await act(async () => {
        fireEvent.press(backButton);
      });

      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });
    });

    it('should show game completion dialog when game is finished', async () => {
      const { getByTestId, getByText } = render(
        <TestApp initialRouteName='Game' />
      );

      await waitFor(() => {
        expect(getByTestId('game-screen')).toBeTruthy();
      });

      // Simulate game completion
      // This would require completing all frames for all players
      // For now, we'll test the dialog appearance

      // Simulate completing the game (this would be done through actual gameplay)
      // For the test, we can trigger the completion dialog directly
      const gameCompletionDialog = getByTestId('game-completion-dialog');

      expect(gameCompletionDialog).toBeTruthy();
      expect(getByText('Game Complete!')).toBeTruthy();
    });

    it('should navigate to statistics from game completion dialog', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='Game' />);

      // Assuming game is completed and dialog is shown
      await waitFor(() => {
        expect(getByTestId('game-completion-dialog')).toBeTruthy();
      });

      const viewStatsButton = getByTestId('view-stats-button');

      await act(async () => {
        fireEvent.press(viewStatsButton);
      });

      await waitFor(() => {
        expect(getByTestId('statistics-screen')).toBeTruthy();
      });
    });
  });

  describe('History Screen Navigation', () => {
    it('should navigate back to home when back button is pressed', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='History' />);

      await waitFor(() => {
        expect(getByTestId('history-screen')).toBeTruthy();
      });

      const backButton = getByTestId('back-button');

      await act(async () => {
        fireEvent.press(backButton);
      });

      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });
    });

    it('should navigate to game details when a game item is pressed', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='History' />);

      await waitFor(() => {
        expect(getByTestId('history-screen')).toBeTruthy();
      });

      // Assuming there are game items in the history
      const gameItem = getByTestId('game-item-0');

      await act(async () => {
        fireEvent.press(gameItem);
      });

      await waitFor(() => {
        expect(getByTestId('game-details-screen')).toBeTruthy();
      });
    });

    it('should filter games correctly when filter is applied', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='History' />);

      await waitFor(() => {
        expect(getByTestId('history-screen')).toBeTruthy();
      });

      // Open filter
      const filterButton = getByTestId('filter-button');
      await act(async () => {
        fireEvent.press(filterButton);
      });

      // Apply a filter
      const playerFilter = getByTestId('player-filter-input');
      await act(async () => {
        fireEvent.changeText(playerFilter, 'Alice');
      });

      const applyFilterButton = getByTestId('apply-filter-button');
      await act(async () => {
        fireEvent.press(applyFilterButton);
      });

      // Verify filter is applied
      await waitFor(() => {
        expect(getByTestId('filtered-games-list')).toBeTruthy();
      });
    });
  });

  describe('Statistics Screen Navigation', () => {
    it('should navigate back to home when back button is pressed', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='Statistics' />);

      await waitFor(() => {
        expect(getByTestId('statistics-screen')).toBeTruthy();
      });

      const backButton = getByTestId('back-button');

      await act(async () => {
        fireEvent.press(backButton);
      });

      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });
    });

    it('should navigate to history when view history button is pressed', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='Statistics' />);

      await waitFor(() => {
        expect(getByTestId('statistics-screen')).toBeTruthy();
      });

      const viewHistoryButton = getByTestId('view-game-history-button');

      await act(async () => {
        fireEvent.press(viewHistoryButton);
      });

      await waitFor(() => {
        expect(getByTestId('history-screen')).toBeTruthy();
      });
    });

    it('should switch between different players in statistics view', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='Statistics' />);

      await waitFor(() => {
        expect(getByTestId('statistics-screen')).toBeTruthy();
      });

      // Assuming multiple players exist
      const playerSelector = getByTestId('player-selector');

      await act(async () => {
        fireEvent.press(playerSelector);
      });

      // Select a different player
      const player2Option = getByTestId('player-option-1');

      await act(async () => {
        fireEvent.press(player2Option);
      });

      // Verify statistics updated for the new player
      await waitFor(() => {
        expect(getByTestId('player-statistics-1')).toBeTruthy();
      });
    });
  });

  describe('Deep Navigation Flows', () => {
    it('should maintain navigation state correctly through complex flows', async () => {
      const { getByTestId } = render(<TestApp />);

      // Start at home
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });

      // Go to statistics
      const statisticsButton = getByTestId('view-statistics-button');
      await act(async () => {
        fireEvent.press(statisticsButton);
      });

      // From statistics go to history
      const viewHistoryButton = getByTestId('view-game-history-button');
      await act(async () => {
        fireEvent.press(viewHistoryButton);
      });

      // From history go back to home
      const backButton = getByTestId('back-button');
      await act(async () => {
        fireEvent.press(backButton);
      });

      // Should be back at home
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });
    });

    it('should handle navigation interruptions gracefully', async () => {
      const { getByTestId } = render(<TestApp />);

      // Simulate rapid navigation changes
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });

      const statisticsButton = getByTestId('view-statistics-button');
      const historyButton = getByTestId('view-history-button');

      // Rapid navigation presses
      await act(async () => {
        fireEvent.press(statisticsButton);
        fireEvent.press(historyButton);
      });

      // Should end up at the last intended destination
      await waitFor(() => {
        expect(getByTestId('history-screen')).toBeTruthy();
      });
    });
  });

  describe('Navigation State Persistence', () => {
    it('should preserve navigation state across app lifecycle', async () => {
      // This would test navigation state persistence
      // Implementation depends on navigation state persistence setup
      // This is a placeholder for the comprehensive test
    });

    it('should handle deep linking correctly', async () => {
      // This would test deep linking functionality
      // Implementation depends on deep linking setup
      // This is a placeholder for the comprehensive test
    });
  });

  describe('Error Handling in Navigation', () => {
    it('should handle navigation errors gracefully', async () => {
      // This would test error scenarios in navigation
      // Implementation would simulate navigation failures
      // This is a placeholder for the comprehensive test
    });

    it('should provide fallback navigation when routes are unavailable', async () => {
      // This would test fallback navigation scenarios
      // Implementation would simulate missing or invalid routes
      // This is a placeholder for the comprehensive test
    });
  });
});
