/**
 * CustomDatePicker component
 * A cross-platform date picker that doesn't require native modules
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import Typography from './Typography';
import Button from './Button';
import { useTheme } from '../../contexts/ThemeContext';

interface CustomDatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  onClose?: () => void;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  minimumDate,
  maximumDate,
  onClose,
}) => {
  const { theme } = useTheme();
  const [date, setDate] = useState(value || new Date());
  const [isVisible, setIsVisible] = useState(true);

  // Generate years (from 10 years back to 10 years ahead or based on min/max dates)
  const currentYear = new Date().getFullYear();
  const minYear = minimumDate ? minimumDate.getFullYear() : currentYear - 10;
  const maxYear = maximumDate ? maximumDate.getFullYear() : currentYear + 10;

  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => minYear + i
  );

  // Months
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Generate days based on selected month and year
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const generateDays = () => {
    const daysInMonth = getDaysInMonth(date.getMonth(), date.getFullYear());
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const handleCancel = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  const handleConfirm = () => {
    setIsVisible(false);
    onChange(date);
  };

  const handleYearChange = (year: number) => {
    const newDate = new Date(date);
    newDate.setFullYear(year);

    // Validate against min/max dates
    if (minimumDate && newDate < minimumDate) {
      newDate.setMonth(minimumDate.getMonth());
      newDate.setDate(minimumDate.getDate());
    }

    if (maximumDate && newDate > maximumDate) {
      newDate.setMonth(maximumDate.getMonth());
      newDate.setDate(maximumDate.getDate());
    }

    setDate(newDate);
  };

  const handleMonthChange = (monthIndex: number) => {
    const newDate = new Date(date);
    newDate.setMonth(monthIndex);

    // Check if day is valid for this month
    const daysInNewMonth = getDaysInMonth(monthIndex, newDate.getFullYear());
    if (newDate.getDate() > daysInNewMonth) {
      newDate.setDate(daysInNewMonth);
    }

    // Validate against min/max dates
    if (minimumDate && newDate < minimumDate) {
      newDate.setDate(minimumDate.getDate());
    }

    if (maximumDate && newDate > maximumDate) {
      newDate.setDate(maximumDate.getDate());
    }

    setDate(newDate);
  };

  const handleDayChange = (day: number) => {
    const newDate = new Date(date);
    newDate.setDate(day);
    setDate(newDate);
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType='slide'
      onRequestClose={handleCancel}>
      <View style={styles.modalContainer}>
        <View
          style={[
            styles.pickerContainer,
            { backgroundColor: theme.colors.background.paper },
          ]}>
          <Typography variant='subtitle1' style={styles.title}>
            Select Date
          </Typography>

          <View style={styles.dateSelectors}>
            {/* Year selector */}
            <View style={styles.selectorContainer}>
              <Typography variant='body2' color={theme.colors.text.secondary}>
                Year
              </Typography>
              <FlatList
                data={years}
                keyExtractor={(item) => `year-${item}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.pickerItem,
                      date.getFullYear() === item && {
                        backgroundColor: theme.colors.primary.main,
                      },
                    ]}
                    onPress={() => handleYearChange(item)}>
                    <Typography
                      variant='body1'
                      color={
                        date.getFullYear() === item
                          ? theme.colors.text.light
                          : theme.colors.text.primary
                      }>
                      {item}
                    </Typography>
                  </TouchableOpacity>
                )}
                style={styles.pickerList}
                showsVerticalScrollIndicator={false}
                initialScrollIndex={years.findIndex(
                  (y) => y === date.getFullYear()
                )}
                getItemLayout={(_, index) => ({
                  length: 40,
                  offset: 40 * index,
                  index,
                })}
              />
            </View>

            {/* Month selector */}
            <View style={styles.selectorContainer}>
              <Typography variant='body2' color={theme.colors.text.secondary}>
                Month
              </Typography>
              <FlatList
                data={months}
                keyExtractor={(_, index) => `month-${index}`}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[
                      styles.pickerItem,
                      date.getMonth() === index && {
                        backgroundColor: theme.colors.primary.main,
                      },
                    ]}
                    onPress={() => handleMonthChange(index)}>
                    <Typography
                      variant='body1'
                      color={
                        date.getMonth() === index
                          ? theme.colors.text.light
                          : theme.colors.text.primary
                      }>
                      {item}
                    </Typography>
                  </TouchableOpacity>
                )}
                style={styles.pickerList}
                showsVerticalScrollIndicator={false}
                initialScrollIndex={date.getMonth()}
                getItemLayout={(_, index) => ({
                  length: 40,
                  offset: 40 * index,
                  index,
                })}
              />
            </View>

            {/* Day selector */}
            <View style={styles.selectorContainer}>
              <Typography variant='body2' color={theme.colors.text.secondary}>
                Day
              </Typography>
              <FlatList
                data={generateDays()}
                keyExtractor={(item) => `day-${item}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.pickerItem,
                      date.getDate() === item && {
                        backgroundColor: theme.colors.primary.main,
                      },
                    ]}
                    onPress={() => handleDayChange(item)}>
                    <Typography
                      variant='body1'
                      color={
                        date.getDate() === item
                          ? theme.colors.text.light
                          : theme.colors.text.primary
                      }>
                      {item}
                    </Typography>
                  </TouchableOpacity>
                )}
                style={styles.pickerList}
                showsVerticalScrollIndicator={false}
                initialScrollIndex={date.getDate() - 1}
                getItemLayout={(_, index) => ({
                  length: 40,
                  offset: 40 * index,
                  index,
                })}
              />
            </View>
          </View>

          <View style={styles.actions}>
            <Button variant='text' onPress={handleCancel}>
              Cancel
            </Button>
            <Button variant='primary' onPress={handleConfirm}>
              OK
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 8,
    overflow: 'hidden',
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  dateSelectors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectorContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  pickerList: {
    height: 200,
    width: '100%',
  },
  pickerItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    marginVertical: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
});
