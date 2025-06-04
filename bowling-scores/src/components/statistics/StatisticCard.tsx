/**
 * StatisticCard component
 * Displays a single statistic with a label, value, and optional icon
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Typography, Card, Icon } from '../ui';
import { IconName } from '../ui/Icon';
import { useTheme } from '../../contexts/ThemeContext';

export interface StatisticCardProps {
  label: string;
  value: string | number;
  icon?: IconName;
  accent?: boolean;
  explanation?: string;
  description?: string;
}

const StatisticCard: React.FC<StatisticCardProps> = ({
  label,
  value,
  icon,
  accent = false,
  explanation,
}) => {
  const { theme } = useTheme();
  const [explanationVisible, setExplanationVisible] = useState(false);

  return (
    <Card
      style={[
        styles.container,
        accent && {
          borderLeftWidth: 4,
          borderLeftColor: theme.colors.primary.main,
        },
      ]}>
      <View style={styles.header}>
        <Typography
          variant='subtitle2'
          color={theme.colors.text.secondary}
          style={styles.label}>
          {label}
        </Typography>

        {explanation && (
          <>
            <TouchableOpacity
              onPress={() => setExplanationVisible(true)}
              style={styles.infoButton}>
              <View
                style={[
                  styles.infoIcon,
                  { backgroundColor: theme.colors.background.paper },
                ]}>
                <Typography
                  variant='subtitle2'
                  color={theme.colors.primary.main}
                  style={styles.infoText}>
                  ⓘ
                </Typography>
              </View>
            </TouchableOpacity>

            <Modal
              transparent
              visible={explanationVisible}
              onRequestClose={() => setExplanationVisible(false)}
              animationType='fade'>
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setExplanationVisible(false)}>
                <View
                  style={[
                    styles.modalContent,
                    {
                      backgroundColor: theme.colors.background.paper,
                      borderColor: theme.colors.divider,
                    },
                  ]}>
                  <Typography variant='h3' style={styles.modalTitle}>
                    {label}
                  </Typography>
                  <Typography variant='body1' style={styles.modalBody}>
                    {explanation}
                  </Typography>
                  <TouchableOpacity
                    style={[
                      styles.closeButton,
                      { backgroundColor: theme.colors.primary.main },
                    ]}
                    onPress={() => setExplanationVisible(false)}>
                    <Typography
                      variant='button'
                      color={theme.colors.primary.contrastText}>
                      Close
                    </Typography>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Modal>
          </>
        )}
      </View>

      <View style={styles.content}>
        {icon && (
          <Icon
            name={icon}
            size='small'
            color={theme.colors.text.secondary}
            style={styles.icon}
          />
        )}
        <Typography
          variant='h3'
          color={accent ? theme.colors.primary.main : theme.colors.text.primary}
          style={styles.value}
          numberOfLines={1}
          adjustsFontSizeToFit>
          {value}
        </Typography>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 12,
    height: 140,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    flex: 1,
    fontSize: 14,
  },
  infoButton: {
    marginLeft: 8,
  },
  infoIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  icon: {
    marginRight: 8,
  },
  value: {
    fontWeight: 'bold',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 24,
  },
  modalContent: {
    width: '90%',
    padding: 24,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    marginBottom: 16,
  },
  modalBody: {
    marginBottom: 24,
  },
  closeButton: {
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
});

export default StatisticCard;
