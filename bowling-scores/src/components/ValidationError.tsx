import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ValidationError } from '../utils/validation/gameValidationHelper';
import { useTheme } from '../contexts/ThemeContext';
import createCommonStyles from '../theme/styles';

interface ValidationErrorProps {
  error: ValidationError | null;
  style?: object;
  onClose?: () => void;
}

/**
 * A component for displaying validation errors to the user
 */
const ValidationErrorComponent: React.FC<ValidationErrorProps> = ({
  error,
  style,
  onClose,
}) => {
  const { theme } = useTheme();
  const commonStyles = createCommonStyles();

  if (!error) return null;

  // Create styles with theme context
  const dynamicStyles = StyleSheet.create({
    errorContainer: {
      backgroundColor: `${theme.colors.error}20`, // 20% opacity
      borderWidth: 1,
      borderColor: `${theme.colors.error}30`, // 30% opacity
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    contentRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    messageContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flex: 1,
    },
    icon: {
      fontSize: theme.typography.fontSize.lg,
      marginRight: theme.spacing.sm,
    },
    errorMessage: {
      color: theme.colors.error,
    },
    detailsList: {
      marginTop: theme.spacing.xs,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.xs / 2,
    },
    detailDot: {
      marginRight: theme.spacing.xs,
      fontSize: theme.typography.fontSize.sm,
    },
    detailText: {
      color: theme.colors.text.secondary,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    closeButtonText: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.error,
    },
  });

  const renderDetails = () => {
    if (!error.details || error.details.length === 0) return null;

    return (
      <View style={dynamicStyles.detailsList}>
        {error.details.map((detail, index) => (
          <View key={index} style={dynamicStyles.detailItem}>
            <Text style={dynamicStyles.detailDot}>•</Text>
            <Text style={[commonStyles.smallText, dynamicStyles.detailText]}>
              {detail}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const getIconForErrorType = () => {
    switch (error.type) {
      case 'INVALID_PLAYER':
        return '👤';
      case 'INVALID_GAME_SETUP':
        return '🎮';
      case 'INVALID_ROLL':
        return '🎳';
      case 'INVALID_GAME_STATE':
        return '⚠️';
      case 'INVALID_ROLL_SEQUENCE':
        return '📋';
      default:
        return '❌';
    }
  };

  return (
    <View
      style={[dynamicStyles.errorContainer, style]}
      accessibilityRole='alert'>
      <View style={dynamicStyles.contentRow}>
        <View style={dynamicStyles.messageContainer}>
          <Text style={dynamicStyles.icon}>{getIconForErrorType()}</Text>
          <View>
            <Text style={[commonStyles.subheading, dynamicStyles.errorMessage]}>
              {error.message}
            </Text>
            {renderDetails()}
          </View>
        </View>

        {onClose && (
          <TouchableOpacity
            onPress={onClose}
            accessibilityLabel='Close'
            style={dynamicStyles.closeButton}>
            <Text style={dynamicStyles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ValidationErrorComponent;
