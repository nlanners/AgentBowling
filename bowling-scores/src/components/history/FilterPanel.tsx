/**
 * FilterPanel component
 * Provides filtering and sorting controls for the History screen
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Typography, Button, Divider } from '../ui';
import { DateRangePicker } from './DateRangePicker';
import { PlayerFilterSelect } from './PlayerFilterSelect';
import { ScoreRangeFilter } from './ScoreRangeFilter';
import { SortOptions } from './SortOptions';
import { FilterOptions, SortOption } from '../../types/history';

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  players: Array<{ id: string; name: string }>;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  players,
  onApplyFilters,
  onResetFilters,
}) => {
  // Handle date range change
  const handleDateRangeChange = (
    startDate: Date | null,
    endDate: Date | null
  ) => {
    onFiltersChange({
      ...filters,
      dateRange: { startDate, endDate },
    });
  };

  // Handle player filter change
  const handlePlayerFilterChange = (playerIds: string[]) => {
    onFiltersChange({
      ...filters,
      playerIds,
    });
  };

  // Handle score range change
  const handleScoreRangeChange = (
    minScore: number | null,
    maxScore: number | null
  ) => {
    onFiltersChange({
      ...filters,
      scoreRange: { minScore, maxScore },
    });
  };

  // Handle sort option change
  const handleSortChange = (sortBy: SortOption) => {
    onFiltersChange({
      ...filters,
      sortBy,
    });
  };

  return (
    <Card style={styles.container}>
      <Typography variant='subtitle1' style={styles.title}>
        Filters & Sorting
      </Typography>

      <View style={styles.section}>
        <Typography variant='body2' style={styles.sectionTitle}>
          Date Range
        </Typography>
        <DateRangePicker
          startDate={filters.dateRange.startDate}
          endDate={filters.dateRange.endDate}
          onChange={handleDateRangeChange}
        />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Typography variant='body2' style={styles.sectionTitle}>
          Players
        </Typography>
        <PlayerFilterSelect
          players={players}
          selectedPlayerIds={filters.playerIds}
          onChange={handlePlayerFilterChange}
        />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Typography variant='body2' style={styles.sectionTitle}>
          Score Range
        </Typography>
        <ScoreRangeFilter
          minScore={filters.scoreRange.minScore}
          maxScore={filters.scoreRange.maxScore}
          onChange={handleScoreRangeChange}
        />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Typography variant='body2' style={styles.sectionTitle}>
          Sort By
        </Typography>
        <SortOptions sortBy={filters.sortBy} onChange={handleSortChange} />
      </View>

      <View style={styles.actions}>
        <Button
          variant='text'
          style={styles.resetButton}
          onPress={onResetFilters}>
          Reset
        </Button>
        <Button
          variant='primary'
          style={styles.applyButton}
          onPress={onApplyFilters}>
          Apply Filters
        </Button>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 16,
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  resetButton: {
    marginRight: 8,
  },
  applyButton: {
    minWidth: 120,
  },
});
