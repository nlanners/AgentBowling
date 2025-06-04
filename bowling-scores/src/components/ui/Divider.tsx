/**
 * Divider component
 * Renders a horizontal line to separate content
 */

import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export interface DividerProps extends ViewProps {
  vertical?: boolean;
}

const Divider: React.FC<DividerProps> = ({
  style,
  vertical = false,
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        vertical ? styles.vertical : styles.horizontal,
        { backgroundColor: theme.colors.divider },
        style,
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    width: '100%',
  },
  vertical: {
    width: 1,
    height: '100%',
  },
});

export default Divider;
