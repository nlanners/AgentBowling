/**
 * Main theme file for the bowling score app
 * Combines all theme elements into a cohesive system
 */

import colors from './colors';
import spacing, { getSpacing } from './spacing';
import typography from './typography';
import borderRadius, { shapes } from './borderRadius';
import shadows, { elevations } from './shadows';

// Combine all theme elements
export const theme = {
  colors,
  spacing,
  getSpacing,
  typography,
  borderRadius,
  shapes,
  shadows,
  elevations,
};

// Dark theme variations
export const darkTheme = {
  ...theme,
  colors: {
    ...colors,
    // Override with dark mode colors
    background: {
      default: colors.gray[900],
      paper: colors.gray[800],
      dark: colors.gray[900],
      primary: colors.common.black,
    },
    text: {
      primary: colors.common.white,
      secondary: colors.gray[400],
      disabled: colors.gray[600],
      hint: colors.gray[500],
      light: colors.common.white,
      onPrimary: colors.common.white,
    },
    divider: colors.gray[700],
    border: colors.gray[700],
    surface: colors.gray[800],
    white: colors.common.white,
  },
};

// Export theme types
export type Theme = typeof theme;
export type ThemeColors = typeof colors;
export type ThemeSpacing = typeof spacing;
export type ThemeTypography = typeof typography;
export type ThemeBorderRadius = typeof borderRadius;
export type ThemeShadows = typeof shadows;

export default theme;
