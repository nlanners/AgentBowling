/**
 * Color palette for the bowling score app
 */

const palette = {
  // Primary cool colors
  primary: {
    light: '#6B8FF2', // Light blue
    main: '#4169E1', // Royal blue
    dark: '#2A4DA8', // Dark blue
    contrastText: '#FFFFFF',
  },

  // Secondary color - teal/green
  secondary: {
    light: '#4ECEAE', // Light teal
    main: '#2AB19B', // Teal
    dark: '#1A8C7C', // Dark teal
    contrastText: '#FFFFFF',
  },

  // Accent color - purple
  accent: {
    light: '#AD8DF9', // Light purple
    main: '#8A6BF0', // Purple
    dark: '#6747D6', // Dark purple
    contrastText: '#FFFFFF',
  },

  // Grayscale
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Functional colors
  success: '#2E7D32', // Green
  error: '#D32F2F', // Red
  warning: '#ED6C02', // Orange
  info: '#0288D1', // Blue

  // Common colors
  common: {
    white: '#FFFFFF',
    black: '#000000',
  },

  // Bowling specific colors
  bowling: {
    lane: '#E8D7AE', // Bowling lane wood color
    ball: '#1C1C1C', // Bowling ball color (traditional black)
    pin: '#F9F9F9', // Bowling pin color with red accents
    pinStripe: '#D32F2F', // Red stripes on pins
  },
};

export const colors = {
  ...palette,

  // Semantic colors
  background: {
    default: palette.gray[50],
    paper: palette.common.white,
    dark: palette.gray[900],
  },

  text: {
    primary: palette.gray[900],
    secondary: palette.gray[700],
    disabled: palette.gray[500],
    hint: palette.gray[500],
    light: palette.common.white,
  },

  divider: palette.gray[300],
};

export default colors;
