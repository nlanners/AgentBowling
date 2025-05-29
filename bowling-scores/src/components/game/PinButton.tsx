import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Typography, Badge } from '../ui';
import { useTheme } from '../../contexts/ThemeContext';

export interface PinButtonProps {
  value: number;
  isSpecial?: boolean; // For strike/spare indicators
  isDisabled?: boolean;
  onPress: (value: number) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Button component for selecting pin counts in the pin input pad
 */
const PinButton: React.FC<PinButtonProps> = ({
  value,
  isSpecial = false,
  isDisabled = false,
  onPress,
  style,
}) => {
  const { theme } = useTheme();

  // Special labels for certain values
  const getDisplayValue = () => {
    if (isSpecial) {
      if (value === 10) return 'X'; // Strike
      if (value === -1) return '/'; // Spare
    }
    return value === 0 ? '-' : value.toString(); // Show 0 as dash
  };

  // Determine if this is a strike or spare for styling
  const isStrike = isSpecial && value === 10;
  const isSpare = isSpecial && value === -1; // We use -1 to represent a spare button

  // Get variant based on value type
  const getVariant = () => {
    if (isStrike) return 'strike';
    if (isSpare) return 'spare';
    return isDisabled ? 'inactive' : 'active';
  };

  const handlePress = () => {
    if (!isDisabled) {
      // If it's a spare button, we need to calculate the actual value
      // This will be handled by the parent component
      onPress(value);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: isDisabled
            ? theme.colors.gray[200]
            : isStrike
            ? theme.colors.success
            : isSpare
            ? theme.colors.accent.main
            : theme.colors.primary.main,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityLabel={`${getDisplayValue()} pins`}
      accessibilityRole='button'
      accessibilityState={{ disabled: isDisabled }}>
      {isSpecial ? (
        <Badge
          variant={getVariant()}
          content={getDisplayValue()}
          size='medium'
        />
      ) : (
        <Typography
          variant='h3'
          color={
            isDisabled ? theme.colors.text.disabled : theme.colors.common.white
          }>
          {getDisplayValue()}
        </Typography>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
});

export default PinButton;
