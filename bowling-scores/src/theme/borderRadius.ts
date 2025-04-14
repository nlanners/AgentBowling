/**
 * Border radius system for the bowling score app
 * Provides consistent rounded corners across components
 */

// Border radius values
export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

// Common shapes
export const shapes = {
  // Pill shape for buttons
  pill: {
    borderRadius: borderRadius.full,
  },

  // Standard rounded shape for cards
  rounded: {
    borderRadius: borderRadius.md,
  },

  // Soft rounded for inputs
  soft: {
    borderRadius: borderRadius.sm,
  },

  // Circle shape for icons or avatars
  circle: (size: number) => ({
    width: size,
    height: size,
    borderRadius: size / 2,
  }),
};

export default borderRadius;
