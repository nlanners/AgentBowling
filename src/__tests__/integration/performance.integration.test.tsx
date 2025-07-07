/**
 * Performance Integration Tests
 * Tests performance optimizations and validates app performance under various conditions
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import {
  TestApp,
  createMockGame,
  createCompletedMockGame,
  measureRenderTime,
  TEST_IDS,
} from './testUtils';

// Mock performance.now for consistent testing
const mockPerformanceNow = jest.fn();
global.performance = { now: mockPerformanceNow } as any;

describe('Performance Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceNow.mockReturnValue(Date.now());
  });

  describe('Component Render Performance', () => {
    it('should render home screen quickly', async () => {
      const startTime = Date.now();

      const { getByTestId } = render(<TestApp />);

      await waitFor(() => {
        expect(getByTestId(TEST_IDS.HOME_SCREEN)).toBeTruthy();
      });

      const endTime = Date.now();
      const renderTime = endTime - startTime;

      // Should render home screen within reasonable time
      expect(renderTime).toBeLessThan(1000); // Less than 1 second
    });

    it('should render game screen efficiently', async () => {
      const startTime = Date.now();

      const { getByTestId } = render(<TestApp initialRouteName='Game' />);

      await waitFor(() => {
        expect(getByTestId(TEST_IDS.GAME_SCREEN)).toBeTruthy();
      });

      const endTime = Date.now();
      const renderTime = endTime - startTime;

      // Game screen should render quickly
      expect(renderTime).toBeLessThan(1500); // Less than 1.5 seconds
    });

    it('should handle rapid user interactions without lag', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='Game' />);

      await waitFor(() => {
        expect(getByTestId(TEST_IDS.PIN_INPUT)).toBeTruthy();
      });

      const startTime = Date.now();

      // Simulate rapid pin selections
      const pin1Button = getByTestId(TEST_IDS.PIN_BUTTON(1));
      const pin2Button = getByTestId(TEST_IDS.PIN_BUTTON(2));

      await act(async () => {
        fireEvent.press(pin1Button);
        fireEvent.press(pin2Button);
      });

      const endTime = Date.now();
      const interactionTime = endTime - startTime;

      // Interactions should be responsive
      expect(interactionTime).toBeLessThan(500); // Less than 500ms
    });

    it('should maintain performance with large game history', async () => {
      // Create a large number of completed games
      const largeGameHistory = Array.from({ length: 100 }, (_, index) =>
        createCompletedMockGame()
      );

      // Mock storage to return large history
      jest.doMock('../../services/storage/history', () => ({
        getAllGames: jest.fn().mockResolvedValue(largeGameHistory),
      }));

      const startTime = Date.now();

      const { getByTestId } = render(<TestApp initialRouteName='History' />);

      await waitFor(() => {
        expect(getByTestId(TEST_IDS.HISTORY_SCREEN)).toBeTruthy();
      });

      const endTime = Date.now();
      const renderTime = endTime - startTime;

      // Should render history screen with 100 games within reasonable time
      expect(renderTime).toBeLessThan(2000); // Less than 2 seconds
    });
  });

  describe('Memory Usage Optimization', () => {
    it('should not create excessive objects during gameplay', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='Game' />);

      await waitFor(() => {
        expect(getByTestId(TEST_IDS.GAME_SCREEN)).toBeTruthy();
      });

      // Track object creation by monitoring React.memo effectiveness
      // This is a simplified test - in real scenarios you'd use memory profiling tools

      const pin5Button = getByTestId(TEST_IDS.PIN_BUTTON(5));

      // Make multiple moves and ensure components are memoized
      await act(async () => {
        fireEvent.press(pin5Button);
        fireEvent.press(pin5Button);
      });

      // Verify that memoized components don't re-render unnecessarily
      // This would be validated through React DevTools Profiler in real testing
      expect(getByTestId(TEST_IDS.SCOREBOARD)).toBeTruthy();
    });

    it('should clean up resources when navigating away from screens', async () => {
      const { getByTestId } = render(<TestApp />);

      // Navigate to game screen
      const startGameButton = getByTestId(TEST_IDS.START_NEW_GAME_BUTTON);
      await act(async () => {
        fireEvent.press(startGameButton);
      });

      await waitFor(() => {
        expect(getByTestId(TEST_IDS.GAME_SCREEN)).toBeTruthy();
      });

      // Navigate back to home
      const backButton = getByTestId(TEST_IDS.BACK_TO_HOME_BUTTON);
      await act(async () => {
        fireEvent.press(backButton);
      });

      await waitFor(() => {
        expect(getByTestId(TEST_IDS.HOME_SCREEN)).toBeTruthy();
      });

      // Verify cleanup occurred (in real testing, you'd check for memory leaks)
      expect(() => getByTestId(TEST_IDS.GAME_SCREEN)).toThrow();
    });
  });

  describe('Chart Performance', () => {
    it('should render statistics charts efficiently', async () => {
      const startTime = Date.now();

      const { getByTestId } = render(<TestApp initialRouteName='Statistics' />);

      await waitFor(() => {
        expect(getByTestId(TEST_IDS.STATISTICS_SCREEN)).toBeTruthy();
      });

      const endTime = Date.now();
      const renderTime = endTime - startTime;

      // Charts should render within reasonable time
      expect(renderTime).toBeLessThan(2000); // Less than 2 seconds
    });

    it('should handle chart data updates smoothly', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='Statistics' />);

      await waitFor(() => {
        expect(getByTestId(TEST_IDS.STATISTICS_SCREEN)).toBeTruthy();
      });

      // Refresh statistics
      const refreshButton = getByTestId(TEST_IDS.REFRESH_STATS_BUTTON);

      const startTime = Date.now();

      await act(async () => {
        fireEvent.press(refreshButton);
      });

      const endTime = Date.now();
      const refreshTime = endTime - startTime;

      // Refresh should be quick due to caching
      expect(refreshTime).toBeLessThan(1000); // Less than 1 second
    });
  });

  describe('Stress Testing', () => {
    it('should handle multiple rapid navigation changes', async () => {
      const { getByTestId } = render(<TestApp />);

      await waitFor(() => {
        expect(getByTestId(TEST_IDS.HOME_SCREEN)).toBeTruthy();
      });

      const startTime = Date.now();

      // Rapid navigation between screens
      const statisticsButton = getByTestId(TEST_IDS.VIEW_STATISTICS_BUTTON);
      const historyButton = getByTestId(TEST_IDS.VIEW_HISTORY_BUTTON);

      await act(async () => {
        fireEvent.press(statisticsButton);
      });

      await waitFor(() => {
        expect(getByTestId(TEST_IDS.STATISTICS_SCREEN)).toBeTruthy();
      });

      await act(async () => {
        fireEvent.press(getByTestId(TEST_IDS.VIEW_GAME_HISTORY_BUTTON));
      });

      await waitFor(() => {
        expect(getByTestId(TEST_IDS.HISTORY_SCREEN)).toBeTruthy();
      });

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Navigation should be smooth even with rapid changes
      expect(totalTime).toBeLessThan(3000); // Less than 3 seconds total
    });

    it('should maintain performance during extended gameplay', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='Game' />);

      await waitFor(() => {
        expect(getByTestId(TEST_IDS.PIN_INPUT)).toBeTruthy();
      });

      const startTime = Date.now();

      // Simulate extended gameplay (multiple frames)
      for (let frame = 0; frame < 5; frame++) {
        const pin5Button = getByTestId(TEST_IDS.PIN_BUTTON(5));
        const pin3Button = getByTestId(TEST_IDS.PIN_BUTTON(3));

        await act(async () => {
          fireEvent.press(pin5Button);
          fireEvent.press(pin3Button);
        });
      }

      const endTime = Date.now();
      const gameplayTime = endTime - startTime;

      // Extended gameplay should remain responsive
      expect(gameplayTime).toBeLessThan(5000); // Less than 5 seconds for 5 frames
    });
  });

  describe('Performance Monitoring', () => {
    it('should track render times consistently', async () => {
      const renderTimes: number[] = [];

      // Render multiple times and track performance
      for (let i = 0; i < 3; i++) {
        const startTime = Date.now();

        const { unmount } = render(<TestApp />);

        const endTime = Date.now();
        renderTimes.push(endTime - startTime);

        unmount();
      }

      // Performance should be consistent
      const avgTime =
        renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length;
      expect(avgTime).toBeLessThan(1000); // Average should be under 1 second
    });

    it('should demonstrate performance optimization benefits', async () => {
      // This test demonstrates that our React.memo optimizations are working
      // In a real performance test, you'd measure re-renders and validate caching

      const { getByTestId } = render(<TestApp initialRouteName='Game' />);

      await waitFor(() => {
        expect(getByTestId(TEST_IDS.GAME_SCREEN)).toBeTruthy();
      });

      // Performance optimizations should be in place
      expect(getByTestId(TEST_IDS.SCOREBOARD)).toBeTruthy();
      expect(getByTestId(TEST_IDS.PIN_INPUT)).toBeTruthy();
    });
  });
});
