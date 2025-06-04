/**
 * ScoreTrendChart component
 * Displays a line chart showing score trends over time
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography } from '../ui';
import { Game } from '../../types';

interface ScoreTrendChartProps {
  games: Game[];
  playerId: string;
  title?: string;
}

const ScoreTrendChart: React.FC<ScoreTrendChartProps> = ({
  games,
  playerId,
  title = 'Score Trend',
}) => {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get('window').width;

  // Extract scores for the specific player
  const getPlayerScores = (): number[] => {
    const scores: number[] = [];

    games.forEach((game) => {
      const playerIndex = game.players.findIndex((p) => p.id === playerId);
      if (playerIndex !== -1 && game.scores && game.scores[playerIndex]) {
        scores.push(game.scores[playerIndex]);
      }
    });

    return scores;
  };

  const scores = getPlayerScores();

  // If no data, show empty state
  if (scores.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Typography variant='body2' color={theme.colors.text.secondary}>
          No score data available
        </Typography>
      </View>
    );
  }

  // Prepare data for the chart
  const chartData = {
    labels: scores.map((_, index) => `G${index + 1}`), // Game 1, Game 2, etc.
    datasets: [
      {
        data: scores,
        color: (opacity = 1) => theme.colors.primary.main, // Line color
        strokeWidth: 3, // Line thickness
      },
    ],
  };

  const chartConfig = {
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
  };

  return (
    <View style={styles.container}>
      <Typography variant='subtitle1' style={styles.title}>
        {title}
      </Typography>
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
    </View>
  );
};

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
