/**
 * Spacing system for the bowling score app
 * Follows an 8-point grid system, common in modern UI design
 */

// Base spacing unit in pixels
const baseUnit = 8;

// Spacing scale
export const spacing = {
  // Values by name
  none: 0,
  xs: baseUnit / 2, // 4px
  sm: baseUnit, // 8px
  md: baseUnit * 2, // 16px
  lg: baseUnit * 3, // 24px
  xl: baseUnit * 4, // 32px
  xxl: baseUnit * 6, // 48px

  // Function to get custom spacing
  custom: (multiplier: number): number => baseUnit * multiplier,
};

// Shorthand function for accessing spacing values
// Examples:
// - theme.spacing(2) -> 16px
// - theme.spacing(0.5, 1, 2) -> '4px 8px 16px'
export const getSpacing = (...args: number[]): string | number => {
  if (args.length === 0) {
    return baseUnit;
  }

  if (args.length === 1) {
    return baseUnit * args[0];
  }

  return args.map((factor) => `${baseUnit * factor}px`).join(' ');
};

export default spacing;
