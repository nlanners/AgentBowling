/**
 * ConfirmDialog component
 * Displays a confirmation dialog with customizable title, message, and buttons
 */

import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import Typography from './Typography';
import Button from './Button';
import { useTheme } from '../../contexts/ThemeContext';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
}) => {
  const { theme } = useTheme();

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType='fade'
      onRequestClose={onCancel}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onCancel}>
        <View
          style={[
            styles.container,
            { backgroundColor: theme.colors.background.paper },
          ]}
          // Prevent clicks on the container from closing the modal
          onStartShouldSetResponder={() => true}>
          <View style={styles.content}>
            <Typography variant='h3' style={styles.title}>
              {title}
            </Typography>

            <Typography variant='body1' style={styles.message}>
              {message}
            </Typography>

            <View style={styles.buttonContainer}>
              <Button variant='text' onPress={onCancel} style={styles.button}>
                {cancelLabel}
              </Button>

              <Button
                variant={destructive ? 'error' : 'primary'}
                onPress={onConfirm}
                style={styles.button}>
                {confirmLabel}
              </Button>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 8,
    overflow: 'hidden',
  },
  content: {
    padding: 20,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    marginLeft: 8,
  },
});
