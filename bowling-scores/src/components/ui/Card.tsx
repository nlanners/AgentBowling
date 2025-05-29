import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import createCommonStyles from '../../theme/styles';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated';
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  children,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const commonStyles = createCommonStyles();

  return (
    <View
      style={[
        variant === 'elevated' ? commonStyles.elevatedCard : commonStyles.card,
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
};

export default Card;
