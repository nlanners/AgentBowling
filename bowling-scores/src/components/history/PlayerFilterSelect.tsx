/**
 * PlayerFilterSelect component
 * Allows users to select which players to include in game history filters
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Typography } from '../ui';
import { useTheme } from '../../contexts/ThemeContext';

interface PlayerFilterSelectProps {
  players: Array<{ id: string; name: string }>;
  selectedPlayerIds: string[];
  onChange: (selectedIds: string[]) => void;
}

export const PlayerFilterSelect: React.FC<PlayerFilterSelectProps> = ({
  players,
  selectedPlayerIds,
  onChange,
}) => {
  const { theme } = useTheme();

  // Toggle player selection
  const togglePlayer = (playerId: string) => {
    if (selectedPlayerIds.includes(playerId)) {
      onChange(selectedPlayerIds.filter((id) => id !== playerId));
    } else {
      onChange([...selectedPlayerIds, playerId]);
    }
  };

  // Select all players
  const selectAllPlayers = () => {
    onChange(players.map((player) => player.id));
  };

  // Clear player selection
  const clearSelection = () => {
    onChange([]);
  };

  // Check if any players are selected
  const hasSelections = selectedPlayerIds.length > 0;

  // Check if all players are selected
  const allSelected =
    players.length > 0 && selectedPlayerIds.length === players.length;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.playerScroll}>
        {players.map((player) => (
          <Button
            key={player.id}
            variant={
              selectedPlayerIds.includes(player.id) ? 'primary' : 'secondary'
            }
            style={styles.playerButton}
            onPress={() => togglePlayer(player.id)}>
            {player.name}
          </Button>
        ))}
      </ScrollView>

      <View style={styles.actions}>
        {!allSelected && (
          <Button
            variant='text'
            style={styles.actionButton}
            onPress={selectAllPlayers}>
            Select All
          </Button>
        )}

        {hasSelections && (
          <Button
            variant='text'
            style={styles.actionButton}
            onPress={clearSelection}>
            Clear
          </Button>
        )}

        {!hasSelections && players.length > 0 && (
          <Typography
            variant='caption'
            color={theme.colors.text.secondary}
            style={styles.hint}>
            No players selected (showing all)
          </Typography>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  playerScroll: {
    flexGrow: 0,
  },
  playerButton: {
    marginRight: 8,
    minWidth: 100,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 4,
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 8,
  },
  hint: {
    fontStyle: 'italic',
  },
});
