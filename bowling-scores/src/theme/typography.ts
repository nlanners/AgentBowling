/**
 * Typography system for the bowling score app
 */

import { TextStyle } from 'react-native';

// Font families
export const fontFamily = {
  primary: 'System', // Default system font
  secondary: 'System', // Could replace with custom font later
  monospace: 'monospace',
};

// Font weights
export const fontWeight = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};

// Font sizes
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Line heights
export const lineHeight = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  xxl: 36,
  xxxl: 48,
};

// Letter spacing
export const letterSpacing = {
  tighter: -0.8,
  tight: -0.4,
  normal: 0,
  wide: 0.4,
  wider: 0.8,
};

// Text variants
interface TypographyVariants {
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  h4: TextStyle;
  h5: TextStyle;
  h6: TextStyle;
  subtitle1: TextStyle;
  subtitle2: TextStyle;
  body1: TextStyle;
  body2: TextStyle;
  button: TextStyle;
  caption: TextStyle;
  overline: TextStyle;
}

export const variants: TypographyVariants = {
  h1: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.xxxl,
    lineHeight: lineHeight.xxxl,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.xxl,
    lineHeight: lineHeight.xxl,
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    letterSpacing: letterSpacing.normal,
  },
  h4: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    letterSpacing: letterSpacing.normal,
  },
  h5: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    letterSpacing: letterSpacing.normal,
  },
  h6: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    letterSpacing: letterSpacing.normal,
  },
  subtitle1: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    letterSpacing: letterSpacing.normal,
  },
  subtitle2: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    letterSpacing: letterSpacing.normal,
  },
  body1: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    letterSpacing: letterSpacing.normal,
  },
  body2: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    letterSpacing: letterSpacing.normal,
  },
  button: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    letterSpacing: letterSpacing.wide,
    textTransform: 'uppercase',
  },
  caption: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    letterSpacing: letterSpacing.normal,
  },
  overline: {
    fontFamily: fontFamily.primary,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    letterSpacing: letterSpacing.wider,
    textTransform: 'uppercase',
  },
};

export const typography = {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
  ...variants,
};
export default typography;
