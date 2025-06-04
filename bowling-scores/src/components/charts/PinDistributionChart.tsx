/**
 * PinDistributionChart component
 * Displays a pie chart showing the distribution of pins knocked down
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography } from '../ui';

interface PinDistributionChartProps {
  pinDistribution: number[];
  title?: string;
}

const PinDistributionChart: React.FC<PinDistributionChartProps> = ({
  pinDistribution,
  title = 'Pin Distribution',
}) => {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get('window').width;

  // If no data, show empty state
  if (
    pinDistribution.length === 0 ||
    pinDistribution.every((count) => count === 0)
  ) {
    return (
      <View style={styles.emptyContainer}>
        <Typography variant='body2' color={theme.colors.text.secondary}>
          No pin distribution data available
        </Typography>
      </View>
    );
  }

  // Generate colors for each pin count
  const generateColors = (count: number): string[] => {
    const baseColors = [
      theme.colors.primary.main,
      theme.colors.secondary.main,
      theme.colors.success,
      theme.colors.warning,
      theme.colors.error,
      '#9C27B0', // Purple
      '#FF5722', // Deep Orange
      '#607D8B', // Blue Grey
      '#795548', // Brown
      '#E91E63', // Pink
      '#00BCD4', // Cyan
    ];

    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
  };

  // Prepare data for the chart (only include non-zero values)
  const chartData = pinDistribution
    .map((count, index) => ({
      name: index === 10 ? 'Strike' : `${index} pins`,
      population: count,
      color: generateColors(11)[index],
      legendFontColor: theme.colors.text.primary,
      legendFontSize: 12,
    }))
    .filter((item) => item.population > 0);

  const chartConfig = {
    backgroundColor: theme.colors.background.paper,
    backgroundGradientFrom: theme.colors.background.paper,
    backgroundGradientTo: theme.colors.background.paper,
    color: (opacity = 1) => theme.colors.text.primary,
    labelColor: (opacity = 1) => theme.colors.text.secondary,
    style: {
      borderRadius: 16,
    },
  };

  return (
    <View style={styles.container}>
      <Typography variant='subtitle1' style={styles.title}>
        {title}
      </Typography>

      <PieChart
        data={chartData}
        width={screenWidth - 40}
        height={220}
        chartConfig={chartConfig}
        accessor='population'
        backgroundColor='transparent'
        paddingLeft='15'
        center={[10, 10]}
        absolute={false} // Show percentages instead of absolute values
        style={styles.chart}
      />

      {/* Custom Legend */}
      <View style={styles.legend}>
        {chartData.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: item.color }]}
            />
            <Typography variant='caption' style={styles.legendText}>
              {item.name}: {item.population}
            </Typography>
          </View>
        ))}
      </View>
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
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
    marginVertical: 2,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
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

export default PinDistributionChart;
