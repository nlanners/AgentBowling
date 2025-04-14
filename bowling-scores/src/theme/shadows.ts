/**
 * Shadow system for the bowling score app
 * Provides consistent elevation shadows across components
 */

import { Platform } from 'react-native';

// Android elevation shadows
const androidShadows = {
  none: {
    elevation: 0,
  },
  xs: {
    elevation: 1,
  },
  sm: {
    elevation: 2,
  },
  md: {
    elevation: 4,
  },
  lg: {
    elevation: 6,
  },
  xl: {
    elevation: 8,
  },
  xxl: {
    elevation: 12,
  },
};

// iOS shadows
const iosShadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  xxl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 7,
  },
};

// Export platform-specific shadows
export const shadows = Platform.select({
  ios: iosShadows,
  android: androidShadows,
  default: androidShadows,
});

// Shadow levels for semantic usage
export const elevations = {
  // No elevation
  flat: shadows.none,

  // Low elevation (cards, buttons)
  low: shadows.sm,

  // Medium elevation (floating action buttons, dropdowns)
  medium: shadows.md,

  // High elevation (modals, dialogs)
  high: shadows.lg,

  // Highest elevation (tooltips, popovers)
  highest: shadows.xl,
};

export default shadows;
