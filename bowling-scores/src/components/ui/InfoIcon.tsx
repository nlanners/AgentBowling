/**
 * InfoIcon component
 * A simple info icon with a circle that can be used to provide additional information
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Typography from './Typography';
import { useTheme } from '../../contexts/ThemeContext';

interface InfoIconProps {
  onPress?: () => void;
  size?: number;
  style?: object;
}

export const InfoIcon: React.FC<InfoIconProps> = ({
  onPress,
  size = 20,
  style,
}) => {
  const { theme } = useTheme();

  const iconStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: size / 10,
    borderColor: theme.colors.primary.main,
  };

  const textStyle = {
    fontSize: size * 0.7,
    lineHeight: size,
    color: theme.colors.primary.main,
    fontWeight: 'bold' as const,
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component style={[styles.container, iconStyle, style]} onPress={onPress}>
      <Typography style={textStyle}>i</Typography>
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
