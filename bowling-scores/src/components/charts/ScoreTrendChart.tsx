/**
 * ScoreTrendChart component
 * Displays a line chart showing score trends over time
 */

import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, ErrorBoundary } from '../ui';
import { Game } from '../../types';
import { errorHandler, ErrorType } from '../../services/errorHandling';

interface ScoreTrendChartProps {
  games: Game[];
  playerId: string;
  title?: string;
}

const ScoreTrendChart: React.FC<ScoreTrendChartProps> = React.memo(
  ({ games, playerId, title = 'Score Trend' }) => {
    const { theme } = useTheme();
    const screenWidth = Dimensions.get('window').width;

    // Memoize the score extraction logic to avoid recalculation on every render
    const scores = useMemo((): number[] => {
      try {
        const extractedScores: number[] = [];

        if (!games || !Array.isArray(games)) {
          return extractedScores;
        }

        games.forEach((game) => {
          if (!game || !game.players || !Array.isArray(game.players)) {
            return;
          }

          const playerIndex = game.players.findIndex(
            (p) => p && p.id === playerId
          );
          if (
            playerIndex !== -1 &&
            game.scores &&
            game.scores[playerIndex] !== undefined
          ) {
            const score = game.scores[playerIndex];
            if (
              typeof score === 'number' &&
              !isNaN(score) &&
              score >= 0 &&
              score <= 300
            ) {
              extractedScores.push(score);
            }
          }
        });

        return extractedScores;
      } catch (error) {
        errorHandler.handleError(
          error as Error,
          ErrorType.UI_RENDER,
          undefined,
          { logToConsole: true },
          { component: 'ScoreTrendChart', playerId, gamesCount: games?.length }
        );
        return [];
      }
    }, [games, playerId]);

    // Memoize chart data preparation
    const chartData = useMemo(() => {
      if (scores.length === 0) return null;

      return {
        labels: scores.map((_, index) => `G${index + 1}`), // Game 1, Game 2, etc.
        datasets: [
          {
            data: scores,
            color: (opacity = 1) => theme.colors.primary.main, // Line color
            strokeWidth: 3, // Line thickness
          },
        ],
      };
    }, [scores, theme.colors.primary.main]);

    // Memoize chart configuration
    const chartConfig = useMemo(
      () => ({
        backgroundColor: theme.colors.background.paper,
        backgroundGradientFrom: theme.colors.background.paper,
        backgroundGradientTo: theme.colors.background.paper,
        decimalPlaces: 0, // No decimal places for scores
        color: (opacity = 1) => theme.colors.text.primary,
        labelColor: (opacity = 1) => theme.colors.text.secondary,
        style: {
          borderRadius: 16,
        },
        propsForDots: {
          r: '6',
          strokeWidth: '2',
          stroke: theme.colors.primary.main,
          fill: theme.colors.background.paper,
        },
        propsForBackgroundLines: {
          strokeDasharray: '', // Solid lines
          stroke: theme.colors.divider,
          strokeWidth: 1,
        },
      }),
      [
        theme.colors.background.paper,
        theme.colors.text.primary,
        theme.colors.text.secondary,
        theme.colors.primary.main,
        theme.colors.divider,
      ]
    );

    // Memoize error fallback component
    const ChartErrorFallback = useMemo(
      () => (
        <View style={styles.emptyContainer}>
          <Typography variant='body2' color={theme.colors.text.secondary}>
            Chart could not be displayed
          </Typography>
        </View>
      ),
      [theme.colors.text.secondary]
    );

    // Memoize error handler callback
    const handleChartError = useCallback(
      (error: Error, errorInfo: any) => {
        errorHandler.handleError(
          error,
          ErrorType.UI_RENDER,
          undefined,
          { logToConsole: true },
          {
            component: 'ScoreTrendChart - LineChart',
            playerId,
            scoresCount: scores.length,
            screenWidth,
            errorInfo: errorInfo.componentStack,
          }
        );
      },
      [playerId, scores.length, screenWidth]
    );

    // Early return for empty data
    if (scores.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Typography variant='body2' color={theme.colors.text.secondary}>
            No score data available
          </Typography>
        </View>
      );
    }

    // Validate scores for chart rendering
    if (scores.some((score) => typeof score !== 'number' || isNaN(score))) {
      return (
        <View style={styles.emptyContainer}>
          <Typography variant='body2' color={theme.colors.text.secondary}>
            Invalid score data
          </Typography>
        </View>
      );
    }

    // chartData is null when scores.length === 0, but we've already handled that case above
    if (!chartData) {
      return (
        <View style={styles.emptyContainer}>
          <Typography variant='body2' color={theme.colors.text.secondary}>
            No chart data available
          </Typography>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Typography variant='subtitle1' style={styles.title}>
          {title}
        </Typography>

        <ErrorBoundary fallback={ChartErrorFallback} onError={handleChartError}>
          <LineChart
            data={chartData}
            width={screenWidth - 40} // Adjust for padding
            height={220}
            chartConfig={chartConfig}
            bezier // Smooth curves
            style={styles.chart}
            withInnerLines={true}
            withOuterLines={true}
            withVerticalLines={true}
            withHorizontalLines={true}
            withDots={true}
            withShadow={false}
            fromZero={false} // Start from minimum value, not zero
          />
        </ErrorBoundary>
      </View>
    );
  }
);

// Add display name for debugging
ScoreTrendChart.displayName = 'ScoreTrendChart';

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    marginVertical: 16,
  },
});

export default ScoreTrendChart;
