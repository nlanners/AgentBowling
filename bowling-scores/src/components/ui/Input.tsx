import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import createCommonStyles from '../../theme/styles';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  placeholder,
  value,
  onChangeText,
  onBlur,
  onFocus,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  autoCorrect = false,
  fullWidth = true,
  editable = true,
  containerStyle,
  style,
  ...props
}) => {
  const { theme, isDark } = useTheme();
  const commonStyles = createCommonStyles();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur && onBlur(e);
  };

  return (
    <View
      style={[styles.container, fullWidth && styles.fullWidth, containerStyle]}>
      {label && <Text style={commonStyles.inputLabel}>{label}</Text>}
      <TextInput
        style={[
          commonStyles.input,
          isFocused && styles.focused,
          error && styles.error,
          !editable && styles.disabled,
          style,
          // Apply theme colors
          {
            color: theme.colors.text.primary,
            backgroundColor: editable
              ? theme.colors.background.paper
              : isDark
              ? theme.colors.gray[800]
              : theme.colors.gray[100],
            borderColor: error
              ? theme.colors.error
              : isFocused
              ? theme.colors.primary.main
              : theme.colors.gray[300],
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.hint}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        editable={editable}
        accessibilityLabel={label || placeholder}
        accessibilityHint={error}
        accessible={true}
        {...props}
      />
      {error && <Text style={commonStyles.inputError}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  fullWidth: {
    width: '100%',
  },
  focused: {
    borderWidth: 2,
  },
  error: {
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.7,
  },
});

export default Input;
