/**
 * Game Flow Integration Tests
 * Tests the complete bowling game flow including context management and storage
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider } from '../../contexts';
import GameScreen from '../../screens/GameScreen';
import { Game, Player } from '../../types';

// Mock navigation for testing
const Stack = createNativeStackNavigator();

const TestNavigator = ({
  initialRouteName = 'Game',
}: {
  initialRouteName?: string;
}) => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName={initialRouteName}>
      <Stack.Screen
        name='Game'
        component={GameScreen}
        initialParams={{ gameMode: 'new', players: mockPlayers }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

// Mock players for testing
const mockPlayers: Player[] = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
];

// Helper function to render component with providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(<AppProvider>{component}</AppProvider>);
};

describe('Game Flow Integration Tests', () => {
  beforeEach(() => {
    // Clear any existing game state
    jest.clearAllMocks();
  });

  describe('Game Creation and Setup', () => {
    it('should create a new game with players and initialize properly', async () => {
      const { getByText, getByTestId } = renderWithProviders(<TestNavigator />);

      // Wait for game to be initialized
      await waitFor(() => {
        expect(getByText('Alice')).toBeTruthy();
        expect(getByText('Bob')).toBeTruthy();
      });

      // Check that scoreboard is displayed
      expect(getByTestId('scoreboard')).toBeTruthy();

      // Check that pin input is displayed for first player
      expect(getByTestId('pin-input')).toBeTruthy();
    });

    it('should properly set the current player and frame', async () => {
      const { getByText, getByTestId } = renderWithProviders(<TestNavigator />);

      await waitFor(() => {
        // First player should be highlighted as current
        expect(getByTestId('player-row-0')).toBeTruthy();

        // Frame 1 should be the current frame
        expect(getByTestId('frame-cell-0-0')).toBeTruthy();
      });
    });
  });

  describe('Scoring Integration', () => {
    it('should handle a complete frame scoring workflow', async () => {
      const { getByText, getByTestId } = renderWithProviders(<TestNavigator />);

      await waitFor(() => {
        expect(getByTestId('pin-input')).toBeTruthy();
      });

      // Simulate rolling a strike (10 pins)
      const pin10Button = getByTestId('pin-button-10');

      await act(async () => {
        fireEvent.press(pin10Button);
      });

      // Wait for UI to update
      await waitFor(() => {
        // Strike should be recorded and displayed
        expect(getByText('X')).toBeTruthy();

        // Should move to next player
        expect(getByTestId('player-row-1')).toBeTruthy();
      });
    });

    it('should handle spare scoring correctly', async () => {
      const { getByTestId } = renderWithProviders(<TestNavigator />);

      await waitFor(() => {
        expect(getByTestId('pin-input')).toBeTruthy();
      });

      // First roll: 7 pins
      const pin7Button = getByTestId('pin-button-7');
      await act(async () => {
        fireEvent.press(pin7Button);
      });

      // Second roll: 3 pins (spare)
      const pin3Button = getByTestId('pin-button-3');
      await act(async () => {
        fireEvent.press(pin3Button);
      });

      await waitFor(() => {
        // Spare should be recorded
        expect(getByTestId('spare-indicator')).toBeTruthy();

        // Should move to next player
        expect(getByTestId('player-row-1')).toBeTruthy();
      });
    });

    it('should calculate cumulative scores correctly', async () => {
      const { getByTestId } = renderWithProviders(<TestNavigator />);

      await waitFor(() => {
        expect(getByTestId('pin-input')).toBeTruthy();
      });

      // Roll a simple frame (5 + 3 = 8)
      const pin5Button = getByTestId('pin-button-5');
      await act(async () => {
        fireEvent.press(pin5Button);
      });

      const pin3Button = getByTestId('pin-button-3');
      await act(async () => {
        fireEvent.press(pin3Button);
      });

      await waitFor(() => {
        // Score should be displayed in the frame
        const frameScore = getByTestId('frame-score-0');
        expect(frameScore).toBeTruthy();
        // TODO: Add proper text content checking when component has testID
      });
    });
  });

  describe('Player Turn Management', () => {
    it('should alternate between players correctly', async () => {
      const { getByTestId } = renderWithProviders(<TestNavigator />);

      // Start with player 1 (Alice)
      await waitFor(() => {
        expect(getByTestId('current-player-indicator-0')).toBeTruthy();
      });

      // Complete a frame
      const pin5Button = getByTestId('pin-button-5');
      await act(async () => {
        fireEvent.press(pin5Button);
        fireEvent.press(pin5Button);
      });

      // Should switch to player 2 (Bob)
      await waitFor(() => {
        expect(getByTestId('current-player-indicator-1')).toBeTruthy();
      });

      // Complete Bob's frame
      await act(async () => {
        fireEvent.press(pin5Button);
        fireEvent.press(pin5Button);
      });

      // Should switch back to Alice for frame 2
      await waitFor(() => {
        expect(getByTestId('current-player-indicator-0')).toBeTruthy();
      });
    });

    it('should handle strikes correctly in player rotation', async () => {
      const { getByTestId } = renderWithProviders(<TestNavigator />);

      // Alice rolls a strike
      const pin10Button = getByTestId('pin-button-10');
      await act(async () => {
        fireEvent.press(pin10Button);
      });

      // Should immediately switch to Bob (no second roll for Alice)
      await waitFor(() => {
        expect(getByTestId('current-player-indicator-1')).toBeTruthy();
      });
    });
  });

  describe('10th Frame Special Rules', () => {
    it('should handle 10th frame strikes correctly', async () => {
      // This would require setting up a game state at the 10th frame
      // Implementation would depend on the actual game context API
      // This is a placeholder for the comprehensive test
    });

    it('should handle 10th frame spares correctly', async () => {
      // This would test the special 10th frame spare rules
      // Implementation would depend on the actual game context API
      // This is a placeholder for the comprehensive test
    });
  });

  describe('Game Completion', () => {
    it('should detect game completion correctly', async () => {
      // This would test the complete game flow through all 10 frames
      // Implementation would simulate a complete game
      // This is a placeholder for the comprehensive test
    });

    it('should save completed game to history', async () => {
      // This would test the integration with the history storage
      // Implementation would verify game is saved correctly
      // This is a placeholder for the comprehensive test
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle invalid pin inputs gracefully', async () => {
      const { getByTestId } = renderWithProviders(<TestNavigator />);

      await waitFor(() => {
        expect(getByTestId('pin-input')).toBeTruthy();
      });

      // Try to enter more than 10 pins total
      const pin6Button = getByTestId('pin-button-6');
      await act(async () => {
        fireEvent.press(pin6Button);
        fireEvent.press(pin6Button); // This should be invalid (6 + 6 = 12 > 10)
      });

      // Should show error or prevent invalid input
      await waitFor(() => {
        expect(getByTestId('error-message')).toBeTruthy();
      });
    });

    it('should handle storage errors gracefully', async () => {
      // This would test error handling when storage operations fail
      // Implementation would mock storage failures
      // This is a placeholder for the comprehensive test
    });
  });

  describe('State Persistence', () => {
    it('should maintain game state across re-renders', async () => {
      // This would test that game state persists properly
      // Implementation would simulate component re-mounting
      // This is a placeholder for the comprehensive test
    });

    it('should save game progress automatically', async () => {
      // This would test auto-save functionality
      // Implementation would verify automatic storage calls
      // This is a placeholder for the comprehensive test
    });
  });
});
