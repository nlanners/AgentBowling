/**
 * DateRangePicker component
 * Allows users to select a start and end date for filtering
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography, Button, CustomDatePicker } from '../ui';
import { useTheme } from '../../contexts/ThemeContext';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (startDate: Date | null, endDate: Date | null) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
}) => {
  const { theme } = useTheme();
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Format date for display
  const formatDate = (date: Date | null): string => {
    if (!date) return 'Any';
    return date.toLocaleDateString();
  };

  // Handle start date change
  const handleStartDateChange = (selectedDate: Date) => {
    // Set time to beginning of day
    selectedDate.setHours(0, 0, 0, 0);
    onChange(selectedDate, endDate);
  };

  // Handle end date change
  const handleEndDateChange = (selectedDate: Date) => {
    // Set time to end of day
    selectedDate.setHours(23, 59, 59, 999);
    onChange(startDate, selectedDate);
  };

  // Handle clear button press
  const handleClear = () => {
    onChange(null, null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.dateSelector}>
          <Typography variant='body2' color={theme.colors.text.secondary}>
            From
          </Typography>
          <TouchableOpacity
            style={[styles.dateButton, { borderColor: theme.colors.border }]}
            onPress={() => setShowStartPicker(true)}>
            <Typography variant='body1'>{formatDate(startDate)}</Typography>
          </TouchableOpacity>
        </View>

        <View style={styles.dateSelector}>
          <Typography variant='body2' color={theme.colors.text.secondary}>
            To
          </Typography>
          <TouchableOpacity
            style={[styles.dateButton, { borderColor: theme.colors.border }]}
            onPress={() => setShowEndPicker(true)}>
            <Typography variant='body1'>{formatDate(endDate)}</Typography>
          </TouchableOpacity>
        </View>

        {(startDate || endDate) && (
          <Button
            variant='text'
            style={styles.clearButton}
            onPress={handleClear}>
            Clear
          </Button>
        )}
      </View>

      {/* Custom date pickers */}
      {showStartPicker && (
        <CustomDatePicker
          value={startDate || new Date()}
          onChange={handleStartDateChange}
          maximumDate={endDate || undefined}
          onClose={() => setShowStartPicker(false)}
        />
      )}

      {showEndPicker && (
        <CustomDatePicker
          value={endDate || new Date()}
          onChange={handleEndDateChange}
          minimumDate={startDate || undefined}
          maximumDate={new Date()}
          onClose={() => setShowEndPicker(false)}
        />
      )}
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
  dateSelector: {
    flex: 1,
    marginRight: 8,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginTop: 4,
  },
  clearButton: {
    alignSelf: 'flex-end',
    marginBottom: 2,
  },
});
