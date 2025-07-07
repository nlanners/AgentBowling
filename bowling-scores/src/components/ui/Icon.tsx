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

// Icon names supported by the Icon component
export type IconName =
  | 'add'
  | 'arrow-down'
  | 'arrow-up'
  | 'arrow-up-right'
  | 'award'
  | 'activity'
  | 'alert-circle'
  | 'back'
  | 'bar-chart'
  | 'calendar'
  | 'check'
  | 'check-circle'
  | 'close'
  | 'delete'
  | 'edit'
  | 'error'
  | 'filter'
  | 'filter-off'
  | 'history'
  | 'home'
  | 'info'
  | 'menu'
  | 'person'
  | 'pin'
  | 'play'
  | 'refresh'
  | 'remove'
  | 'save'
  | 'settings'
  | 'share'
  | 'spare'
  | 'star'
  | 'stats'
  | 'strike'
  | 'trash'
  | 'trending-up'
  | 'trophy'
  | 'users';

// Icon sizes
export type IconSize = 'small' | 'medium' | 'large';

// Size mapping for different icon sizes
const sizeMap: Record<IconSize, number> = {
  small: 16,
  medium: 24,
  large: 32,
};

// Props for the Icon component
interface IconProps {
  name: IconName;
  size?: IconSize;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Simple text-based icon component for easy compatibility
 */
const Icon: React.FC<IconProps> = ({ name, size = 'medium', color, style }) => {
  const { theme } = useTheme();
  const iconColor = color || theme.colors.text.primary;
  const iconSize = sizeMap[size];

  // Get the appropriate icon character
  const getIconChar = (): string => {
    switch (name) {
      case 'add':
        return '+';
      case 'arrow-down':
        return '↓';
      case 'arrow-up':
        return '↑';
      case 'arrow-up-right':
        return '↗';
      case 'award':
        return '🏆';
      case 'activity':
        return '📊';
      case 'alert-circle':
        return '⚠️';
      case 'back':
        return '←';
      case 'bar-chart':
        return '📊';
      case 'calendar':
        return '📅';
      case 'check':
        return '✓';
      case 'check-circle':
        return '✓';
      case 'close':
        return '✕';
      case 'delete':
        return '🗑️';
      case 'edit':
        return '✏️';
      case 'error':
        return '❗';
      case 'filter':
        return '🔍';
      case 'filter-off':
        return '🔍';
      case 'history':
        return '🕒';
      case 'home':
        return '🏠';
      case 'info':
        return 'ℹ️';
      case 'menu':
        return '☰';
      case 'person':
        return '👤';
      case 'pin':
        return '📌';
      case 'play':
        return '▶️';
      case 'refresh':
        return '🔄';
      case 'remove':
        return '-';
      case 'save':
        return '💾';
      case 'settings':
        return '⚙️';
      case 'share':
        return '↗️';
      case 'spare':
        return '/';
      case 'star':
        return '⭐';
      case 'stats':
        return '📈';
      case 'strike':
        return 'X';
      case 'trash':
        return '🗑️';
      case 'trending-up':
        return '📈';
      case 'trophy':
        return '🏆';
      case 'users':
        return '👥';
      default:
        return '';
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Text
        style={{
          fontSize: iconSize,
          color: iconColor,
          textAlign: 'center',
          lineHeight: iconSize,
          textAlignVertical: 'center',
        }}>
        {getIconChar()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
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
