import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  ActivityIndicator,
  View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import createCommonStyles from '../../theme/styles';
import Icon, { IconName } from './Icon';

type ButtonVariant = 'primary' | 'secondary' | 'text' | 'outline' | 'error';
type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: IconName;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  fullWidth = false,
  leftIcon,
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
      case 'outline':
        return (
          commonStyles.outlineButton || {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: theme.colors.primary.main,
          }
        );
      case 'error':
        return {
          backgroundColor: theme.colors.error,
          borderRadius: theme.borderRadius.md,
          flexDirection: 'row' as const,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
        };
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
      case 'outline':
        return {
          ...commonStyles.textButtonText,
          color: theme.colors.primary.main,
        };
      case 'error':
        return {
          ...commonStyles.buttonText,
          color: theme.colors.common.white,
        };
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

  // Get icon color based on variant
  const getIconColor = () => {
    switch (variant) {
      case 'primary':
        return theme.colors.common.white;
      case 'secondary':
        return theme.colors.common.white;
      case 'text':
        return theme.colors.primary.main;
      default:
        return theme.colors.common.white;
    }
  };

  // Get icon size based on button size
  const getIconSize = (): 'small' | 'medium' => {
    switch (size) {
      case 'small':
        return 'small';
      case 'medium':
      case 'large':
        return 'medium';
      default:
        return 'small';
    }
  };

  return (
    <TouchableOpacity
      style={[
        getButtonStyle(),
        getPaddingStyle(),
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        leftIcon && styles.withIcon,
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
        <View style={styles.contentContainer}>
          {leftIcon && (
            <Icon
              name={leftIcon}
              size={getIconSize()}
              color={getIconColor()}
              style={styles.leftIcon}
            />
          )}
          <Text style={[getTextStyle(), disabled && styles.disabledText]}>
            {children}
          </Text>
        </View>
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
  withIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
});

export default Button;
