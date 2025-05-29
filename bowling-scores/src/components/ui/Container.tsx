import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import createCommonStyles from '../../theme/styles';

type ContainerVariant = 'default' | 'centered' | 'screen';

interface ContainerProps extends ViewProps {
  variant?: ContainerVariant;
  children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({
  variant = 'default',
  children,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const commonStyles = createCommonStyles();

  // Get container style based on variant
  const getContainerStyle = () => {
    switch (variant) {
      case 'default':
        return commonStyles.container;
      case 'centered':
        return commonStyles.centeredContainer;
      case 'screen':
        return commonStyles.screenContainer;
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
