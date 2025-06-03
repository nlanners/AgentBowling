import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import createCommonStyles from '../../theme/styles';

export interface ContainerProps extends ViewProps {
  variant?: 'default' | 'centered';
  children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({
  variant = 'default',
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();
  const commonStyles = createCommonStyles();

  // Get container style based on variant
  const getContainerStyle = () => {
    switch (variant) {
      case 'centered':
        return commonStyles.centeredContainer;
      default:
        return commonStyles.container;
    }
  };

  return (
    <View style={[getContainerStyle(), style]} {...props}>
      {children}
    </View>
  );
};

export default Container;
