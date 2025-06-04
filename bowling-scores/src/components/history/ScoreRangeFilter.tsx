/**
 * ScoreRangeFilter component
 * Allows users to filter games by score range
 */

import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Typography, Button } from '../ui';
import { useTheme } from '../../contexts/ThemeContext';

interface ScoreRangeFilterProps {
  minScore: number | null;
  maxScore: number | null;
  onChange: (minScore: number | null, maxScore: number | null) => void;
}

export const ScoreRangeFilter: React.FC<ScoreRangeFilterProps> = ({
  minScore,
  maxScore,
  onChange,
}) => {
  const { theme } = useTheme();

  // Local state for input values
  const [minInput, setMinInput] = useState(minScore?.toString() || '');
  const [maxInput, setMaxInput] = useState(maxScore?.toString() || '');

  // Apply score range filter
  const applyScoreRange = () => {
    const newMin = minInput ? parseInt(minInput, 10) : null;
    const newMax = maxInput ? parseInt(maxInput, 10) : null;

    // Validate input
    if (newMin !== null && isNaN(newMin)) return;
    if (newMax !== null && isNaN(newMax)) return;

    onChange(newMin, newMax);
  };

  // Clear score range filter
  const clearScoreRange = () => {
    setMinInput('');
    setMaxInput('');
    onChange(null, null);
  };

  // Validate input is numeric
  const validateNumericInput = (text: string): boolean => {
    return !text || /^\d+$/.test(text);
  };

  // Handle min score input change
  const handleMinInputChange = (text: string) => {
    if (validateNumericInput(text)) {
      setMinInput(text);
    }
  };

  // Handle max score input change
  const handleMaxInputChange = (text: string) => {
    if (validateNumericInput(text)) {
      setMaxInput(text);
    }
  };

  // Handle input blur (apply values)
  const handleInputBlur = () => {
    applyScoreRange();
  };

  // Check if filter is applied
  const isFilterApplied = minScore !== null || maxScore !== null;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.inputContainer}>
          <Typography variant='body2' color={theme.colors.text.secondary}>
            Minimum
          </Typography>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: theme.colors.border,
                color: theme.colors.text.primary,
              },
            ]}
            value={minInput}
            onChangeText={handleMinInputChange}
            keyboardType='number-pad'
            placeholder='Any'
            placeholderTextColor={theme.colors.text.disabled}
            onBlur={handleInputBlur}
          />
        </View>

        <View style={styles.inputContainer}>
          <Typography variant='body2' color={theme.colors.text.secondary}>
            Maximum
          </Typography>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: theme.colors.border,
                color: theme.colors.text.primary,
              },
            ]}
            value={maxInput}
            onChangeText={handleMaxInputChange}
            keyboardType='number-pad'
            placeholder='Any'
            placeholderTextColor={theme.colors.text.disabled}
            onBlur={handleInputBlur}
          />
        </View>

        {isFilterApplied && (
          <Button
            variant='text'
            style={styles.clearButton}
            onPress={clearScoreRange}>
            Clear
          </Button>
        )}
      </View>

      <Typography
        variant='caption'
        color={theme.colors.text.secondary}
        style={styles.hint}>
        Leave empty for no limit
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  inputContainer: {
    flex: 1,
    marginRight: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginTop: 4,
  },
  clearButton: {
    alignSelf: 'flex-end',
    marginBottom: 2,
  },
  hint: {
    marginTop: 4,
    fontStyle: 'italic',
  },
});
