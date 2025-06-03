/**
 * StatisticsSection component
 * Groups related statistics with a title and description
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography, Divider } from '../ui';
import { useTheme } from '../../contexts/ThemeContext';

export interface StatisticsSectionProps {
  /** Title for the section */
  title: string;

  /** Optional description for the section */
  description?: string;

  /** Child components (typically StatisticCard components) */
  children: React.ReactNode;
}

const StatisticsSection: React.FC<StatisticsSectionProps> = ({
  title,
  description,
  children,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Typography variant='h3' style={styles.title}>
        {title}
      </Typography>

      {description && (
        <Typography
          variant='body2'
          color={theme.colors.text.secondary}
          style={styles.description}>
          {description}
        </Typography>
      )}

      <Divider style={styles.divider} />

      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 4,
  },
  description: {
    marginBottom: 12,
  },
  divider: {
    marginBottom: 16,
  },
  content: {
    marginTop: 8,
  },
});

export default StatisticsSection;
