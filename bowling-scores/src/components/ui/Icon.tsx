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

// Define icon types
export type IconName =
  // Bowling specific icons
  | 'pin'
  | 'strike'
  | 'spare'
  | 'ball'
  // UI icons
  | 'add'
  | 'remove'
  | 'edit'
  | 'delete'
  | 'save'
  | 'close'
  | 'back'
  | 'settings'
  | 'history'
  | 'person'
  | 'info'
  | 'check'
  | 'error'
  // Statistics icons
  | 'star'
  | 'check-circle'
  | 'alert-circle'
  | 'trending-up'
  | 'users'
  | 'calendar'
  | 'award'
  | 'bar-chart'
  // Additional icons
  | 'trash'
  | 'filter'
  | 'filter-off'
  | 'refresh';

export type IconSize = 'small' | 'medium' | 'large' | number;

export interface IconProps {
  name: IconName;
  size?: IconSize;
  color?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

/**
 * Simple text-based icon component
 *
 * Note: This is a placeholder implementation. In a production app,
 * we would use a proper icon library like:
 * - @expo/vector-icons
 * - react-native-vector-icons
 *
 * This implementation uses text characters as a simplified approach
 */
const Icon: React.FC<IconProps> = ({
  name,
  size = 'medium',
  color,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  // Get icon content based on name
  const getIconContent = (): string => {
    switch (name) {
      // Bowling specific icons
      case 'pin':
        return '🎳';
      case 'strike':
        return 'X';
      case 'spare':
        return '/';
      case 'ball':
        return '⚫';
      // UI icons
      case 'add':
        return '+';
      case 'remove':
        return '-';
      case 'edit':
        return '✎';
      case 'delete':
        return '🗑';
      case 'save':
        return '💾';
      case 'close':
        return '✕';
      case 'back':
        return '←';
      case 'settings':
        return '⚙';
      case 'history':
        return '📋';
      case 'person':
        return '👤';
      case 'info':
        return 'ⓘ';
      case 'check':
        return '✓';
      case 'error':
        return '!';
      // Statistics icons
      case 'star':
        return '★';
      case 'check-circle':
        return '◉';
      case 'alert-circle':
        return '⊗';
      case 'trending-up':
        return '↗';
      case 'users':
        return '👥';
      case 'calendar':
        return '📅';
      case 'award':
        return '🏆';
      case 'bar-chart':
        return '📊';
      // Additional icons
      case 'trash':
        return '🗑';
      case 'filter':
        return '🔍';
      case 'filter-off':
        return '🔍';
      case 'refresh':
        return '🔄';
      default:
        return '';
    }
  };

  // Get size in pixels
  const getSizePx = (): number => {
    if (typeof size === 'number') {
      return size;
    }

    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 24;
      case 'large':
        return 32;
      default:
        return 24;
    }
  };

  // Get color from theme or props
  const getColor = (): string => {
    if (color) return color;

    return theme.colors.text.primary;
  };

  return (
    <View style={[styles.container, style]}>
      <Text
        style={[
          styles.icon,
          {
            fontSize: getSizePx(),
            color: getColor(),
          },
          textStyle,
        ]}
        accessibilityLabel={name}
        accessibilityRole='image'>
        {getIconContent()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    textAlign: 'center',
  },
});

export default Icon;

/*
 * In a production app, we'd use a proper icon library.
 * Here's an example implementation using @expo/vector-icons:
 *
 * ```typescript
 * import { MaterialCommunityIcons } from '@expo/vector-icons';
 *
 * const Icon: React.FC<IconProps> = ({
 *   name,
 *   size = 'medium',
 *   color,
 *   style,
 * }) => {
 *   const { theme } = useTheme();
 *
 *   // Convert our custom names to library icon names
 *   const getIconName = (): string => {
 *     switch (name) {
 *       case 'pin': return 'bowling';
 *       case 'strike': return 'alpha-x-box';
 *       case 'spare': return 'slash-forward';
 *       // ... map other names
 *     }
 *   };
 *
 *   const getSizePx = () => { // same as above };
 *   const getColor = () => { // same as above };
 *
 *   return (
 *     <MaterialCommunityIcons
 *       name={getIconName()}
 *       size={getSizePx()}
 *       color={getColor()}
 *       style={style}
 *     />
 *   );
 * };
 */
