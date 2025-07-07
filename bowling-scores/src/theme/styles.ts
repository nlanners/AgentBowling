/**
 * Common component styles for the bowling score app
 * Provides reusable style compositions for consistent UI elements
 */

import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import colors from './colors';
import spacing from './spacing';
import typography from './typography';
import borderRadius from './borderRadius';
import shadows from './shadows';

// Type for style objects
type StylesType = {
  [key: string]: ViewStyle | TextStyle | ImageStyle;
};

/**
 * Creates common styles for consistent UI elements across the app
 */
export const createCommonStyles = () => {
  return StyleSheet.create({
    // Layout styles
    container: {
      flex: 1,
      backgroundColor: colors.background.default,
    },
    screenContainer: {
      flex: 1,
      backgroundColor: colors.background.default,
      padding: spacing.screenHorizontal, // Better viewport separation
    },
    centeredContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background.default,
      padding: spacing.screenHorizontal, // Ensure content doesn't touch edges
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm, // Add consistent gap between row items
    },
    spaceBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.sm, // Add breathing room
    },

    // Card styles
    card: {
      backgroundColor: colors.background.paper,
      borderRadius: borderRadius.md,
      padding: spacing.lg, // More generous internal padding
      marginVertical: spacing.md, // Better vertical separation
      marginHorizontal: spacing.xs, // Slight horizontal margin for breathing room
      ...shadows.sm,
    },
    elevatedCard: {
      backgroundColor: colors.background.paper,
      borderRadius: borderRadius.md,
      padding: spacing.lg, // More generous internal padding
      marginVertical: spacing.md, // Better vertical separation
      marginHorizontal: spacing.xs, // Slight horizontal margin for breathing room
      ...shadows.md,
    },

    // Typography styles
    title: {
      ...typography.h1,
      color: colors.text.primary,
      marginBottom: spacing.lg, // Better breathing room for titles
      marginTop: spacing.sm, // Slight top margin for separation
    },
    subtitle: {
      ...typography.h2,
      color: colors.text.primary,
      marginBottom: spacing.md, // Increased spacing
      marginTop: spacing.sm, // Slight top margin for separation
    },
    heading: {
      ...typography.h3,
      color: colors.text.primary,
      marginBottom: spacing.md, // Increased spacing
      marginTop: spacing.sm, // Slight top margin for separation
    },
    subheading: {
      ...typography.h4,
      color: colors.text.primary,
      marginBottom: spacing.sm,
      marginTop: spacing.xs, // Slight top margin for separation
    },
    text: {
      ...typography.body1,
      color: colors.text.primary,
    },
    smallText: {
      ...typography.body2,
      color: colors.text.secondary,
    },
    caption: {
      ...typography.caption,
      color: colors.text.secondary,
    },

    // Button styles
    primaryButton: {
      backgroundColor: colors.primary.main,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.elementPadding, // Better vertical padding
      paddingHorizontal: spacing.lg, // More generous horizontal padding
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: spacing.sm,
      minHeight: 48, // Ensure good touch target
      ...shadows.sm,
    },
    secondaryButton: {
      backgroundColor: colors.secondary.main,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.elementPadding, // Better vertical padding
      paddingHorizontal: spacing.lg, // More generous horizontal padding
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: spacing.sm,
      minHeight: 48, // Ensure good touch target
      ...shadows.sm,
    },
    outlineButton: {
      backgroundColor: 'transparent',
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.primary.main,
      paddingVertical: spacing.elementPadding, // Better vertical padding
      paddingHorizontal: spacing.lg, // More generous horizontal padding
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: spacing.sm,
      minHeight: 48, // Ensure good touch target
    },
    textButton: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md, // Better horizontal padding
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44, // Ensure good touch target
    },
    buttonText: {
      ...typography.button,
      color: colors.common.white,
    },
    textButtonText: {
      ...typography.button,
      color: colors.primary.main,
    },

    // Input styles
    input: {
      backgroundColor: colors.background.paper,
      borderWidth: 1,
      borderColor: colors.gray[300],
      borderRadius: borderRadius.sm,
      paddingVertical: spacing.elementPadding, // Better vertical padding
      paddingHorizontal: spacing.md, // Better horizontal padding
      marginVertical: spacing.sm,
      minHeight: 48, // Ensure good touch target
      ...typography.body1,
    },
    inputLabel: {
      ...typography.subtitle2,
      color: colors.text.primary,
      marginBottom: spacing.sm, // More breathing room
      marginTop: spacing.xs, // Slight top margin
    },
    inputError: {
      ...typography.caption,
      color: colors.error,
      marginTop: spacing.sm, // Better separation from input
      marginLeft: spacing.xs, // Slight indentation
    },

    // List styles
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md, // Better vertical padding
      paddingHorizontal: spacing.md, // Better horizontal padding
      marginHorizontal: spacing.xs, // Slight horizontal margin
      borderBottomWidth: 1,
      borderBottomColor: colors.gray[200],
      minHeight: 56, // Better touch target
    },
    listItemText: {
      ...typography.body1,
      color: colors.text.primary,
    },

    // Bowling specific styles
    scoreCard: {
      backgroundColor: colors.background.paper,
      borderRadius: borderRadius.md,
      padding: spacing.lg, // More generous padding
      marginVertical: spacing.md, // Better vertical separation
      marginHorizontal: spacing.xs, // Slight horizontal margin
      ...shadows.sm,
    },
    frameBox: {
      borderWidth: 1,
      borderColor: colors.gray[300],
      padding: spacing.md, // Better internal padding
      minWidth: 48, // Larger touch targets
      minHeight: 48, // Larger touch targets
      alignItems: 'center',
      justifyContent: 'center',
      margin: spacing.xs, // Small margin between frames
    },
    strikeText: {
      ...typography.h4,
      color: colors.success,
      fontWeight: typography.fontWeight.bold,
    },
    spareText: {
      ...typography.h4,
      color: colors.accent.main,
      fontWeight: typography.fontWeight.bold,
    },
  });
};

export default createCommonStyles;
