import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import createCommonStyles from '../../theme/styles';

export type BadgeVariant =
  | 'strike'
  | 'spare'
  | 'active'
  | 'inactive'
  | 'success'
  | 'warning'
  | 'error';
export type BadgeSize = 'small' | 'medium' | 'large';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  content?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'active',
  size = 'medium',
  content,
  children,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();
  const commonStyles = createCommonStyles();

  // Determine background color based on variant
  const getBadgeColor = () => {
    switch (variant) {
      case 'strike':
        return theme.colors.success;
      case 'spare':
        return theme.colors.accent.main;
      case 'active':
        return theme.colors.primary.main;
      case 'inactive':
        return theme.colors.gray[300];
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.primary.main;
    }
  };

  // Determine text color based on variant
  const getTextColor = () => {
    switch (variant) {
      case 'inactive':
        return theme.colors.text.secondary;
      default:
        return theme.colors.common.white;
    }
  };

  // Get size styles
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.small;
      case 'medium':
        return styles.medium;
      case 'large':
        return styles.large;
      default:
        return styles.medium;
    }
  };

  // Get font size based on badge size
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return theme.typography.caption.fontSize;
      case 'medium':
        return theme.typography.body2.fontSize;
      case 'large':
        return theme.typography.body1.fontSize;
      default:
        return theme.typography.body2.fontSize;
    }
  };

  // Get default content for strike/spare
  const getDefaultContent = () => {
    if (content) return content;

    switch (variant) {
      case 'strike':
        return 'X';
      case 'spare':
        return '/';
      default:
        return '';
    }
  };

  return (
    <View
      style={[
        styles.badge,
        getSizeStyle(),
        { backgroundColor: getBadgeColor() },
        style,
      ]}
      accessibilityRole='image'
      accessibilityLabel={`${variant} badge`}>
      {children || (
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
              fontSize: getFontSize(),
              fontWeight: 'bold',
            },
            textStyle,
          ]}>
          {getDefaultContent()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999, // Large value for pill shape
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  small: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
  },
  medium: {
    minWidth: 32,
    height: 32,
    paddingHorizontal: 8,
  },
  large: {
    minWidth: 40,
    height: 40,
    paddingHorizontal: 10,
  },
  text: {
    textAlign: 'center',
  },
});

export default Badge;
