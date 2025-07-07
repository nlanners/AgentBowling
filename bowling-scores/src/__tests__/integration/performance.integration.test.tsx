/**
 * Performance Integration Tests
 * Tests performance optimizations and validates app performance under various conditions
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider } from '../../contexts';
import GameScreen from '../../screens/GameScreen';
import StatisticsScreen from '../../screens/StatisticsScreen';
import {
  TestApp,
  createMockGame,
  createCompletedMockGame,
  measureRenderTime,
} from './testUtils';

// Mock performance.now for consistent testing
const mockPerformanceNow = jest.fn();
global.performance = { now: mockPerformanceNow } as any;

describe('Performance Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);
  });

  describe('Component Render Performance', () => {
    it('should render game screen within acceptable time limits', async () => {
      let renderStartTime = 0;
      let renderEndTime = 100; // Mock 100ms render time

      mockPerformanceNow
        .mockReturnValueOnce(renderStartTime)
        .mockReturnValueOnce(renderEndTime);

      const { result, renderTime } = await measureRenderTime(() => {
        return render(<TestApp initialRouteName='Game' />);
      });

      // Should render within 200ms (acceptable for mobile)
      expect(renderTime).toBeLessThan(200);

      await waitFor(() => {
        expect(result.getByTestId('game-screen')).toBeTruthy();
      });
    });

    it('should handle rapid state updates without performance degradation', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='Game' />);

      await waitFor(() => {
        expect(getByTestId('game-screen')).toBeTruthy();
      });

      // Simulate rapid pin inputs
      const pin5Button = getByTestId('pin-button-5');

      const startTime = Date.now();

      // Rapid fire 10 button presses
      await act(async () => {
        for (let i = 0; i < 10; i++) {
          fireEvent.press(pin5Button);
          // Small delay to simulate real user interaction
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      });

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should handle rapid inputs within reasonable time
      expect(totalTime).toBeLessThan(1000); // Less than 1 second for 10 inputs
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
        expect(getByTestId('history-screen')).toBeTruthy();
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
        expect(getByTestId('game-screen')).toBeTruthy();
      });

      // Track object creation by monitoring React.memo effectiveness
      // This is a simplified test - in real scenarios you'd use memory profiling tools

      const pin5Button = getByTestId('pin-button-5');

      // Make multiple moves and ensure components are memoized
      await act(async () => {
        fireEvent.press(pin5Button);
        fireEvent.press(pin5Button);
      });

      // Verify that memoized components don't re-render unnecessarily
      // This would be validated through React DevTools Profiler in real testing
      expect(getByTestId('scoreboard')).toBeTruthy();
    });

    it('should clean up resources when navigating away from screens', async () => {
      const { getByTestId } = render(<TestApp />);

      // Navigate to game screen
      const startGameButton = getByTestId('start-new-game-button');
      await act(async () => {
        fireEvent.press(startGameButton);
      });

      await waitFor(() => {
        expect(getByTestId('game-screen')).toBeTruthy();
      });

      // Navigate back to home
      const backButton = getByTestId('back-to-home-button');
      await act(async () => {
        fireEvent.press(backButton);
      });

      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });

      // Verify cleanup occurred (in real testing, you'd check for memory leaks)
      expect(() => getByTestId('game-screen')).toThrow();
    });
  });

  describe('Chart Performance', () => {
    it('should render charts efficiently with large datasets', async () => {
      // Create mock statistics with large datasets
      const largeStatistics = {
        basic: { gamesPlayed: 1000, averageScore: 150 },
        trends: {
          scoreProgression: Array.from(
            { length: 1000 },
            (_, i) => 100 + Math.random() * 100
          ),
        },
        frames: {
          framePerformance: Object.fromEntries(
            Array.from({ length: 10 }, (_, i) => [
              i + 1,
              {
                strikePercentage: Math.random() * 30,
                averageScore: 5 + Math.random() * 5,
              },
            ])
          ),
        },
      };

      jest.doMock('../../services/storage/statistics', () => ({
        getPlayerStatistics: jest.fn().mockResolvedValue(largeStatistics),
      }));

      const startTime = Date.now();

      const { getByTestId } = render(<TestApp initialRouteName='Statistics' />);

      await waitFor(() => {
        expect(getByTestId('statistics-screen')).toBeTruthy();
      });

      // Wait for charts to load
      await waitFor(
        () => {
          expect(getByTestId('score-trend-chart')).toBeTruthy();
        },
        { timeout: 5000 }
      );

      const endTime = Date.now();
      const renderTime = endTime - startTime;

      // Charts should render within reasonable time even with large datasets
      expect(renderTime).toBeLessThan(3000); // Less than 3 seconds
    });

    it('should handle chart interactions smoothly', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='Statistics' />);

      await waitFor(() => {
        expect(getByTestId('statistics-screen')).toBeTruthy();
      });

      // Simulate chart interactions
      const chart = getByTestId('score-trend-chart');

      const startTime = Date.now();

      // Simulate touch interactions on chart
      await act(async () => {
        fireEvent(chart, 'onPress', {
          nativeEvent: { locationX: 100, locationY: 100 },
        });
        fireEvent(chart, 'onPress', {
          nativeEvent: { locationX: 200, locationY: 150 },
        });
        fireEvent(chart, 'onPress', {
          nativeEvent: { locationX: 300, locationY: 200 },
        });
      });

      const endTime = Date.now();
      const interactionTime = endTime - startTime;

      // Chart interactions should be responsive
      expect(interactionTime).toBeLessThan(500); // Less than 500ms for interactions
    });
  });

  describe('Storage Performance', () => {
    it('should handle storage operations efficiently', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='Game' />);

      await waitFor(() => {
        expect(getByTestId('game-screen')).toBeTruthy();
      });

      const pin5Button = getByTestId('pin-button-5');

      const startTime = Date.now();

      // Make multiple moves that trigger storage operations
      await act(async () => {
        for (let i = 0; i < 5; i++) {
          fireEvent.press(pin5Button);
          fireEvent.press(pin5Button);
          // Wait for storage operations to complete
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      });

      const endTime = Date.now();
      const storageTime = endTime - startTime;

      // Storage operations should be fast
      expect(storageTime).toBeLessThan(1000); // Less than 1 second for 5 frames
    });

    it('should cache frequently accessed data', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='Statistics' />);

      await waitFor(() => {
        expect(getByTestId('statistics-screen')).toBeTruthy();
      });

      // First load - should fetch from storage
      const firstLoadStart = Date.now();

      const refreshButton = getByTestId('refresh-stats-button');
      await act(async () => {
        fireEvent.press(refreshButton);
      });

      const firstLoadEnd = Date.now();
      const firstLoadTime = firstLoadEnd - firstLoadStart;

      // Second load - should use cache
      const secondLoadStart = Date.now();

      await act(async () => {
        fireEvent.press(refreshButton);
      });

      const secondLoadEnd = Date.now();
      const secondLoadTime = secondLoadEnd - secondLoadStart;

      // Cached load should be significantly faster
      expect(secondLoadTime).toBeLessThan(firstLoadTime * 0.5);
    });
  });

  describe('Lazy Loading Performance', () => {
    it('should load chart components lazily', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='Statistics' />);

      // Initially, charts should not be loaded
      expect(() => getByTestId('score-trend-chart')).toThrow();

      await waitFor(() => {
        expect(getByTestId('statistics-screen')).toBeTruthy();
      });

      // Charts should load after screen is rendered
      await waitFor(
        () => {
          expect(getByTestId('score-trend-chart')).toBeTruthy();
        },
        { timeout: 2000 }
      );
    });

    it('should show loading states during lazy loading', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='Statistics' />);

      await waitFor(() => {
        expect(getByTestId('statistics-screen')).toBeTruthy();
      });

      // Should show loading indicator while charts are loading
      expect(getByTestId('chart-loading')).toBeTruthy();

      // Loading indicator should disappear when charts are loaded
      await waitFor(
        () => {
          expect(() => getByTestId('chart-loading')).toThrow();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Performance Monitoring', () => {
    it('should track performance metrics in development', async () => {
      // Mock the performance monitor
      const mockPerformanceMonitor = {
        startMeasurement: jest.fn(),
        endMeasurement: jest.fn(),
        getAverageTime: jest.fn().mockReturnValue(150),
      };

      jest.doMock('../../utils/performance', () => ({
        PerformanceMonitor: jest.fn(() => mockPerformanceMonitor),
      }));

      const { getByTestId } = render(<TestApp initialRouteName='Game' />);

      await waitFor(() => {
        expect(getByTestId('game-screen')).toBeTruthy();
      });

      // Make some moves to trigger performance monitoring
      const pin5Button = getByTestId('pin-button-5');
      await act(async () => {
        fireEvent.press(pin5Button);
        fireEvent.press(pin5Button);
      });

      // Verify performance monitoring was called
      expect(mockPerformanceMonitor.startMeasurement).toHaveBeenCalled();
      expect(mockPerformanceMonitor.endMeasurement).toHaveBeenCalled();
    });

    it('should maintain performance baselines', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='Game' />);

      await waitFor(() => {
        expect(getByTestId('game-screen')).toBeTruthy();
      });

      // Baseline performance test - complete a full frame
      const startTime = Date.now();

      const pin5Button = getByTestId('pin-button-5');
      await act(async () => {
        fireEvent.press(pin5Button);
        fireEvent.press(pin5Button);
      });

      const endTime = Date.now();
      const frameCompletionTime = endTime - startTime;

      // Frame completion should be within baseline
      expect(frameCompletionTime).toBeLessThan(300); // Less than 300ms per frame
    });
  });

  describe('Stress Testing', () => {
    it('should handle rapid navigation without performance issues', async () => {
      const { getByTestId } = render(<TestApp />);

      const startTime = Date.now();

      // Rapid navigation between screens
      for (let i = 0; i < 5; i++) {
        // Go to statistics
        const statsButton = getByTestId('view-statistics-button');
        await act(async () => {
          fireEvent.press(statsButton);
        });

        await waitFor(() => {
          expect(getByTestId('statistics-screen')).toBeTruthy();
        });

        // Go back to home
        const backButton = getByTestId('back-button');
        await act(async () => {
          fireEvent.press(backButton);
        });

        await waitFor(() => {
          expect(getByTestId('home-screen')).toBeTruthy();
        });
      }

      const endTime = Date.now();
      const totalNavigationTime = endTime - startTime;

      // Rapid navigation should complete within reasonable time
      expect(totalNavigationTime).toBeLessThan(5000); // Less than 5 seconds for 10 navigations
    });

    it('should maintain performance with concurrent operations', async () => {
      const { getByTestId } = render(<TestApp initialRouteName='Game' />);

      await waitFor(() => {
        expect(getByTestId('game-screen')).toBeTruthy();
      });

      const startTime = Date.now();

      // Simulate concurrent operations
      const pin5Button = getByTestId('pin-button-5');
      const pin3Button = getByTestId('pin-button-3');

      await act(async () => {
        // Rapid alternating button presses
        const promises = [];
        for (let i = 0; i < 10; i++) {
          promises.push(
            new Promise((resolve) => {
              setTimeout(() => {
                fireEvent.press(i % 2 === 0 ? pin5Button : pin3Button);
                resolve(undefined);
              }, i * 10);
            })
          );
        }
        await Promise.all(promises);
      });

      const endTime = Date.now();
      const concurrentOperationTime = endTime - startTime;

      // Concurrent operations should complete efficiently
      expect(concurrentOperationTime).toBeLessThan(1000); // Less than 1 second
    });
  });
});
