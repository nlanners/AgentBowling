import React from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import createCommonStyles from '../../theme/styles';

type TypographyVariant =
  | 'title'
  | 'subtitle'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'bodySmall'
  | 'caption';

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: 'primary' | 'secondary' | 'light';
  children: React.ReactNode;
}

const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color = 'primary',
  children,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const commonStyles = createCommonStyles();

  // Get style based on variant
  const getVariantStyle = () => {
    switch (variant) {
      case 'title':
        return commonStyles.title;
      case 'subtitle':
        return commonStyles.subtitle;
      case 'heading':
        return commonStyles.heading;
      case 'subheading':
        return commonStyles.subheading;
      case 'body':
        return commonStyles.text;
      case 'bodySmall':
        return commonStyles.smallText;
      case 'caption':
        return commonStyles.caption;
      default:
        return commonStyles.text;
    }
  };

  // Get color based on color prop
  const getColorStyle = () => {
    switch (color) {
      case 'primary':
        return { color: theme.colors.text.primary };
      case 'secondary':
        return { color: theme.colors.text.secondary };
      case 'light':
        return { color: theme.colors.text.light };
      default:
        return { color: theme.colors.text.primary };
    }
  };

  return (
    <Text style={[getVariantStyle(), getColorStyle(), style]} {...props}>
      {children}
    </Text>
  );
};

export default Typography;
