import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import createCommonStyles from '../../theme/styles';

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'button'
  | 'subtitle1'
  | 'subtitle2';

export interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  align?: 'left' | 'center' | 'right';
  color?: string;
  children: React.ReactNode;
}

const Typography: React.FC<TypographyProps> = ({
  variant = 'body1',
  align = 'left',
  color,
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();
  const commonStyles = createCommonStyles();

  const getTypographyStyle = () => {
    switch (variant) {
      case 'h1':
        return commonStyles.title;
      case 'h2':
        return commonStyles.subtitle;
      case 'h3':
        return commonStyles.heading;
      case 'h4':
        return commonStyles.subheading;
      case 'body1':
        return commonStyles.text;
      case 'body2':
        return commonStyles.smallText;
      case 'caption':
        return commonStyles.caption;
      case 'button':
        return commonStyles.buttonText;
      case 'subtitle1':
      case 'subtitle2':
        return commonStyles.subtitle;
      default:
        return commonStyles.text;
    }
  };

  return (
    <Text
      style={[
        getTypographyStyle(),
        {
          textAlign: align,
          color: color || theme.colors.text.primary,
        },
        style,
      ]}
      {...props}>
      {children}
    </Text>
  );
};

export default Typography;
