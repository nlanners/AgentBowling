/**
 * SortOptions component
 * Allows users to select how to sort game history
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography, Icon } from '../ui';
import { useTheme } from '../../contexts/ThemeContext';
import { SortOption } from '../../types/history';
import { IconName } from '../ui/Icon';

interface SortOptionsProps {
  sortBy: SortOption;
  onChange: (sortBy: SortOption) => void;
}

export const SortOptions: React.FC<SortOptionsProps> = ({
  sortBy,
  onChange,
}) => {
  const { theme } = useTheme();

  // Define sort options
  const sortOptions: Array<{
    value: SortOption;
    label: string;
    icon: IconName;
  }> = [
    { value: 'date-desc', label: 'Newest First', icon: 'calendar' },
    { value: 'date-asc', label: 'Oldest First', icon: 'calendar' },
    { value: 'score-desc', label: 'Highest Score', icon: 'star' },
    { value: 'score-asc', label: 'Lowest Score', icon: 'star' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.optionsGrid}>
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              sortBy === option.value && {
                backgroundColor: theme.colors.primary.light,
                borderColor: theme.colors.primary.main,
              },
              { borderColor: theme.colors.border },
            ]}
            onPress={() => onChange(option.value)}>
            <Icon
              name={option.icon}
              size='small'
              color={
                sortBy === option.value
                  ? theme.colors.primary.main
                  : theme.colors.text.secondary
              }
              style={styles.optionIcon}
            />
            <Typography
              variant='body2'
              color={
                sortBy === option.value
                  ? theme.colors.primary.main
                  : theme.colors.text.primary
              }>
              {option.label}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 4,
    marginHorizontal: 4,
    marginBottom: 8,
    minWidth: '45%',
  },
  optionIcon: {
    marginRight: 8,
  },
});
