import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import createCommonStyles from '../../theme/styles';

export interface CardProps extends ViewProps {
  elevated?: boolean;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  elevated = false,
  style,
  children,
  ...props
}) => {
  const commonStyles = createCommonStyles();

  return (
    <View
      style={[elevated ? commonStyles.elevatedCard : commonStyles.card, style]}
      {...props}>
      {children}
    </View>
  );
};

export default Card;
