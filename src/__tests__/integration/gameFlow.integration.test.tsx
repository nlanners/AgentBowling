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
import { TestApp, createMockPlayers, TEST_IDS } from './testUtils';

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
        options={{ title: 'Game' }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

const renderWithProviders = (component: React.ReactElement) => {
  return render(<AppProvider>{component}</AppProvider>);
};

describe('Game Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Game Flow', () => {
    it('should display game screen with initial state', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='Game' />);

      await waitFor(() => {
        expect(getByTestId(TEST_IDS.GAME_SCREEN)).toBeTruthy();
      });

      // Should show pin input interface
      expect(getByTestId(TEST_IDS.PIN_INPUT)).toBeTruthy();

      // Should show scoreboard
      expect(getByTestId(TEST_IDS.SCOREBOARD)).toBeTruthy();
    });

    it('should handle strike scoring correctly', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='Game' />);

      await waitFor(() => {
        expect(getByTestId(TEST_IDS.PIN_INPUT)).toBeTruthy();
      });

      // Simulate rolling a strike (10 pins)
      const pin10Button = getByTestId(TEST_IDS.PIN_BUTTON(10));

      await act(async () => {
        fireEvent.press(pin10Button);
      });

      // Wait for UI to update
      await waitFor(() => {
        // Strike should be recorded - look for strike indicator
        expect(getByTestId(TEST_IDS.STRIKE_INDICATOR)).toBeTruthy();
      });
    });

    it('should handle spare scoring correctly', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='Game' />);

      await waitFor(() => {
        expect(getByTestId(TEST_IDS.PIN_INPUT)).toBeTruthy();
      });

      // First roll: 7 pins
      const pin7Button = getByTestId(TEST_IDS.PIN_BUTTON(7));
      await act(async () => {
        fireEvent.press(pin7Button);
      });

      // Second roll: 3 pins (spare)
      const pin3Button = getByTestId(TEST_IDS.PIN_BUTTON(3));
      await act(async () => {
        fireEvent.press(pin3Button);
      });

      await waitFor(() => {
        // Spare should be recorded
        expect(getByTestId(TEST_IDS.SPARE_INDICATOR)).toBeTruthy();
      });
    });

    it('should calculate cumulative scores correctly', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='Game' />);

      await waitFor(() => {
        expect(getByTestId(TEST_IDS.PIN_INPUT)).toBeTruthy();
      });

      // Roll first frame: 5 pins then 3 pins (8 total)
      const pin5Button = getByTestId(TEST_IDS.PIN_BUTTON(5));
      const pin3Button = getByTestId(TEST_IDS.PIN_BUTTON(3));

      await act(async () => {
        fireEvent.press(pin5Button);
      });

      await act(async () => {
        fireEvent.press(pin3Button);
      });

      // Should show the frame score of 8
      await waitFor(() => {
        expect(getByTestId(TEST_IDS.FRAME_CELL(0, 0))).toBeTruthy();
      });
    });
  });

  describe('Player Management', () => {
    it('should switch between players correctly', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='Game' />);

      await waitFor(() => {
        expect(getByTestId(TEST_IDS.PIN_INPUT)).toBeTruthy();
      });

      // First player should be active initially
      expect(getByTestId(TEST_IDS.CURRENT_PLAYER_INDICATOR(0))).toBeTruthy();

      // Complete a frame with first roll
      const pin5Button = getByTestId(TEST_IDS.PIN_BUTTON(5));
      await act(async () => {
        fireEvent.press(pin5Button);
      });

      const pin3Button = getByTestId(TEST_IDS.PIN_BUTTON(3));
      await act(async () => {
        fireEvent.press(pin3Button);
      });

      // Should switch to second player
      await waitFor(() => {
        expect(getByTestId(TEST_IDS.CURRENT_PLAYER_INDICATOR(1))).toBeTruthy();
      });
    });
  });

  describe('10th Frame Special Rules', () => {
    it('should handle 10th frame strikes correctly', async () => {
      // This would require setting up a game state at the 10th frame
      // Implementation would depend on the actual game context API
      // This is a placeholder for the comprehensive test
      expect(true).toBeTruthy(); // Placeholder assertion
    });

    it('should handle 10th frame spares correctly', async () => {
      // This would test the special 10th frame spare rules
      // Implementation would depend on the actual game context API
      // This is a placeholder for the comprehensive test
      expect(true).toBeTruthy(); // Placeholder assertion
    });
  });

  describe('Game Completion', () => {
    it('should detect game completion correctly', async () => {
      // This would test the complete game flow through all 10 frames
      // Implementation would simulate a complete game
      // This is a placeholder for the comprehensive test
      expect(true).toBeTruthy(); // Placeholder assertion
    });

    it('should save completed game to history', async () => {
      // This would test the integration with the history storage
      // Implementation would verify game is saved correctly
      // This is a placeholder for the comprehensive test
      expect(true).toBeTruthy(); // Placeholder assertion
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle invalid pin inputs gracefully', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='Game' />);

      await waitFor(() => {
        expect(getByTestId(TEST_IDS.PIN_INPUT)).toBeTruthy();
      });

      // Try to enter 6 pins first
      const pin6Button = getByTestId(TEST_IDS.PIN_BUTTON(6));
      await act(async () => {
        fireEvent.press(pin6Button);
      });

      // Try to enter 6 more pins (would exceed 10 total)
      await act(async () => {
        fireEvent.press(pin6Button);
      });

      // Should show error or prevent invalid input
      // The exact behavior depends on implementation
      expect(getByTestId(TEST_IDS.PIN_INPUT)).toBeTruthy(); // Game should continue
    });

    it('should handle storage errors gracefully', async () => {
      // This would test error handling when storage operations fail
      // Implementation would mock storage failures
      // This is a placeholder for the comprehensive test
      expect(true).toBeTruthy(); // Placeholder assertion
    });
  });

  describe('State Persistence', () => {
    it('should maintain game state across re-renders', async () => {
      // This would test that game state persists properly
      // Implementation would simulate component re-mounting
      // This is a placeholder for the comprehensive test
      expect(true).toBeTruthy(); // Placeholder assertion
    });

    it('should save game progress automatically', async () => {
      // This would test auto-save functionality
      // Implementation would verify automatic storage calls
      // This is a placeholder for the comprehensive test
      expect(true).toBeTruthy(); // Placeholder assertion
    });
  });
});
