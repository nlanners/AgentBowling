import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

export interface ContainerProps extends ViewProps {
  variant?: 'default' | 'centered' | 'screen' | 'screenCentered';
  children: React.ReactNode;
  disableSafeArea?: boolean;
}

const Container: React.FC<ContainerProps> = ({
  variant = 'default',
  style,
  children,
  disableSafeArea = false,
  ...props
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Get container style based on variant
  const getContainerStyle = () => {
    switch (variant) {
      case 'centered':
        return [styles.container, styles.centered];
      case 'screen':
        return [styles.container, styles.screenPadding];
      case 'screenCentered':
        return [styles.container, styles.screenPadding, styles.centered];
      default:
        return styles.container;
    }
  };

  // Apply safe area insets for screen variants (unless disabled)
  const getSafeAreaStyle = () => {
    if (
      disableSafeArea ||
      (variant !== 'screen' && variant !== 'screenCentered')
    ) {
      return {};
    }

    return {
      paddingTop: Math.max(insets.top, theme.spacing.screenVertical),
      paddingBottom: Math.max(insets.bottom, theme.spacing.screenVertical),
      paddingLeft: Math.max(insets.left, 0),
      paddingRight: Math.max(insets.right, 0),
    };
  };

  const containerStyle = [
    getContainerStyle(),
    { backgroundColor: theme.colors.background.default },
    getSafeAreaStyle(),
    style,
  ];

  return (
    <View style={containerStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenPadding: {
    paddingHorizontal: 24, // Increased from 20px for better breathing room
    paddingVertical: 8, // Base vertical padding (safe area will add more)
  },
});

export default Container;
