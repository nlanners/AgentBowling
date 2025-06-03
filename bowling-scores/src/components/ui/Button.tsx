import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import createCommonStyles from '../../theme/styles';

type ButtonVariant = 'primary' | 'secondary' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  fullWidth = false,
  children,
  style,
  disabled,
  ...props
}) => {
  const { theme } = useTheme();
  const commonStyles = createCommonStyles();

  // Get base button style based on variant
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return commonStyles.primaryButton;
      case 'secondary':
        return commonStyles.secondaryButton;
      case 'text':
        return commonStyles.textButton;
      default:
        return commonStyles.primaryButton;
    }
  };

  // Get text style based on variant
  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return commonStyles.buttonText;
      case 'text':
        return commonStyles.textButtonText;
      default:
        return commonStyles.buttonText;
    }
  };

  // Get padding based on size
  const getPaddingStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallPadding;
      case 'medium':
        return styles.mediumPadding;
      case 'large':
        return styles.largePadding;
      default:
        return styles.mediumPadding;
    }
  };

  return (
    <TouchableOpacity
      style={[
        getButtonStyle(),
        getPaddingStyle(),
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled || isLoading}
      {...props}>
      {isLoading ? (
        <ActivityIndicator
          size='small'
          color={
            variant === 'text'
              ? theme.colors.primary.main
              : theme.colors.common.white
          }
        />
      ) : (
        <Text style={[getTextStyle(), disabled && styles.disabledText]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  smallPadding: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  mediumPadding: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  largePadding: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.8,
  },
});

export default Button;
