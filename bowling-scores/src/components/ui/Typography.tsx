import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'overline'
  | 'button';

export interface TypographyProps {
  variant?: TypographyVariant;
  children: React.ReactNode;
  color?: string;
  style?: TextStyle;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  testID?: string;
}

const Typography: React.FC<TypographyProps> = React.memo(
  ({
    variant = 'body1',
    children,
    color,
    style,
    numberOfLines,
    ellipsizeMode,
    testID,
  }) => {
    const { theme } = useTheme();

    const getVariantStyle = (variant: TypographyVariant): TextStyle => {
      const styles = theme.typography;

      switch (variant) {
        case 'h1':
          return styles.h1;
        case 'h2':
          return styles.h2;
        case 'h3':
          return styles.h3;
        case 'h4':
          return styles.h4;
        case 'h5':
          return styles.h5;
        case 'h6':
          return styles.h6;
        case 'subtitle1':
          return styles.subtitle1;
        case 'subtitle2':
          return styles.subtitle2;
        case 'body1':
          return styles.body1;
        case 'body2':
          return styles.body2;
        case 'caption':
          return styles.caption;
        case 'overline':
          return styles.overline;
        case 'button':
          return styles.button;
        default:
          return styles.body1;
      }
    };

    const computedStyle: TextStyle = {
      ...getVariantStyle(variant),
      ...(color && { color }),
      ...style,
    };

    return (
      <Text
        style={computedStyle}
        numberOfLines={numberOfLines}
        ellipsizeMode={ellipsizeMode}
        testID={testID}>
        {children}
      </Text>
    );
  }
);

// Add display name for debugging
Typography.displayName = 'Typography';

export default Typography;
