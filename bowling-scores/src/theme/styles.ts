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
      padding: spacing.md,
    },
    centeredContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background.default,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    spaceBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    // Card styles
    card: {
      backgroundColor: colors.background.paper,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginVertical: spacing.sm,
      ...shadows.sm,
    },
    elevatedCard: {
      backgroundColor: colors.background.paper,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginVertical: spacing.sm,
      ...shadows.md,
    },

    // Typography styles
    title: {
      ...typography.h1,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    subtitle: {
      ...typography.h2,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    heading: {
      ...typography.h3,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    subheading: {
      ...typography.h4,
      color: colors.text.primary,
      marginBottom: spacing.sm,
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
      padding: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: spacing.sm,
      ...shadows.sm,
    },
    secondaryButton: {
      backgroundColor: colors.secondary.main,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: spacing.sm,
      ...shadows.sm,
    },
    textButton: {
      padding: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
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
      padding: spacing.sm,
      marginVertical: spacing.sm,
      ...typography.body1,
    },
    inputLabel: {
      ...typography.subtitle2,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    inputError: {
      ...typography.caption,
      color: colors.error,
      marginTop: spacing.xs,
    },

    // List styles
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.gray[200],
    },
    listItemText: {
      ...typography.body1,
      color: colors.text.primary,
    },

    // Bowling specific styles
    scoreCard: {
      backgroundColor: colors.background.paper,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginVertical: spacing.sm,
      ...shadows.sm,
    },
    frameBox: {
      borderWidth: 1,
      borderColor: colors.gray[300],
      padding: spacing.sm,
      minWidth: 40,
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'center',
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
