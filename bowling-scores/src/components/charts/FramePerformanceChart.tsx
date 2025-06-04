/**
 * FramePerformanceChart component
 * Displays a bar chart showing strike and spare percentages by frame
 */

import React from 'react';
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

const FramePerformanceChart: React.FC<FramePerformanceChartProps> = ({
  framePerformance,
  title = 'Frame Performance',
  showStrikes = true,
  showSpares = true,
}) => {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get('window').width;

  // Convert Record to array for easier processing
  const frameData = Object.entries(framePerformance).map(
    ([frameNumber, performance]) => ({
      frameNumber: parseInt(frameNumber) as FrameNumber,
      ...performance,
    })
  );

  // If no data, show empty state
  if (frameData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Typography variant='body2' color={theme.colors.text.secondary}>
          No frame performance data available
        </Typography>
      </View>
    );
  }

  // Prepare data for the chart
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

  const chartData = {
    labels,
    datasets,
  };

  const chartConfig = {
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
  };

  return (
    <View style={styles.container}>
      <Typography variant='subtitle1' style={styles.title}>
        {title}
      </Typography>

      {/* Legend */}
      <View style={styles.legend}>
        {showStrikes && (
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: theme.colors.success },
              ]}
            />
            <Typography variant='caption'>Strikes</Typography>
          </View>
        )}
        {showSpares && (
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: theme.colors.warning },
              ]}
            />
            <Typography variant='caption'>Spares</Typography>
          </View>
        )}
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
};

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
