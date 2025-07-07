/**
 * FramePerformanceChart component
 * Displays a bar chart showing strike and spare percentages by frame
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography } from '../ui';
import { FramePerformance } from '../../types/statistics';
import { FrameNumber } from '../../types/frame';

interface FramePerformanceChartProps {
  framePerformance: Record<FrameNumber, FramePerformance>;
  title?: string;
  showStrikes?: boolean;
  showSpares?: boolean;
}

const FramePerformanceChart: React.FC<FramePerformanceChartProps> = React.memo(
  ({
    framePerformance,
    title = 'Frame Performance',
    showStrikes = true,
    showSpares = true,
  }) => {
    const { theme } = useTheme();
    const screenWidth = Dimensions.get('window').width;

    // Memoize frame data processing
    const frameData = useMemo(() => {
      return Object.entries(framePerformance).map(
        ([frameNumber, performance]) => ({
          frameNumber: parseInt(frameNumber) as FrameNumber,
          ...performance,
        })
      );
    }, [framePerformance]);

    // Memoize chart data preparation
    const chartData = useMemo(() => {
      if (frameData.length === 0) return null;

      const labels = frameData.map((frame) => `F${frame.frameNumber}`);
      const datasets = [];

      if (showStrikes) {
        datasets.push({
          data: frameData.map((frame) => frame.strikePercentage),
          color: (opacity = 1) => theme.colors.success,
        });
      }

      if (showSpares) {
        datasets.push({
          data: frameData.map((frame) => frame.sparePercentage),
          color: (opacity = 1) => theme.colors.warning,
        });
      }

      return {
        labels,
        datasets,
      };
    }, [
      frameData,
      showStrikes,
      showSpares,
      theme.colors.success,
      theme.colors.warning,
    ]);

    // Memoize chart configuration
    const chartConfig = useMemo(
      () => ({
        backgroundColor: theme.colors.background.paper,
        backgroundGradientFrom: theme.colors.background.paper,
        backgroundGradientTo: theme.colors.background.paper,
        decimalPlaces: 0,
        color: (opacity = 1) => theme.colors.text.primary,
        labelColor: (opacity = 1) => theme.colors.text.secondary,
        style: {
          borderRadius: 16,
        },
        propsForBackgroundLines: {
          strokeDasharray: '',
          stroke: theme.colors.divider,
          strokeWidth: 1,
        },
      }),
      [
        theme.colors.background.paper,
        theme.colors.text.primary,
        theme.colors.text.secondary,
        theme.colors.divider,
      ]
    );

    // Memoize legend items
    const legendItems = useMemo(() => {
      const items = [];

      if (showStrikes) {
        items.push({
          key: 'strikes',
          color: theme.colors.success,
          label: 'Strikes',
        });
      }

      if (showSpares) {
        items.push({
          key: 'spares',
          color: theme.colors.warning,
          label: 'Spares',
        });
      }

      return items;
    }, [showStrikes, showSpares, theme.colors.success, theme.colors.warning]);

    // Early return for empty data
    if (frameData.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Typography variant='body2' color={theme.colors.text.secondary}>
            No frame performance data available
          </Typography>
        </View>
      );
    }

    // chartData is null when frameData.length === 0, but we've already handled that case above
    if (!chartData || chartData.datasets.length === 0) {
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

        {/* Legend */}
        <View style={styles.legend}>
          {legendItems.map((item) => (
            <View key={item.key} style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: item.color }]}
              />
              <Typography variant='caption'>{item.label}</Typography>
            </View>
          ))}
        </View>

        <BarChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          fromZero={true}
          yAxisLabel=''
          yAxisSuffix='%'
        />
      </View>
    );
  }
);

// Add display name for debugging
FramePerformanceChart.displayName = 'FramePerformanceChart';

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
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

export default FramePerformanceChart;
