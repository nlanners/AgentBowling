import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Game } from '../../types';
import { Typography, Card } from '../ui';
import PlayerRow from './PlayerRow';
import { useTheme } from '../../contexts/ThemeContext';

export interface ScoreboardProps {
  game: Game;
}

/**
 * Main scoreboard component that displays all players and their frames
 */
const Scoreboard: React.FC<ScoreboardProps> = ({ game }) => {
  const { theme } = useTheme();
  const { players, frames, currentPlayer, currentFrame, isComplete } = game;

  return (
    <Card style={[styles.container, { padding: 0 }]}>
      <Typography variant='h3' style={styles.title}>
        Scoreboard
      </Typography>

      {/* Frame headers - spans full width */}
      <View style={styles.framesHeader}>
        {Array.from({ length: 10 }).map((_, index) => (
          <View
            key={`header-${index}`}
            style={[
              styles.frameHeaderCell,
              index === 9 && styles.tenthFrameHeader,
            ]}>
            <Typography variant='caption' color={theme.colors.text.secondary}>
              {index + 1}
            </Typography>
          </View>
        ))}
      </View>

      <ScrollView style={styles.playersContainer}>
        {players.map((player, playerIndex) => (
          <PlayerRow
            key={`player-${player.id}`}
            player={player}
            frames={frames[playerIndex] || []}
            currentPlayerIndex={currentPlayer}
            playerIndex={playerIndex}
            currentFrameIndex={currentFrame}
            isGameComplete={isComplete}
          />
        ))}
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  title: {
    padding: 8,
    paddingBottom: 4,
  },
  framesHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  frameHeaderCell: {
    width: 34,
    alignItems: 'center',
    marginHorizontal: 0,
  },
  tenthFrameHeader: {
    width: 52,
  },
  playersContainer: {
    flex: 1,
  },
});

export default Scoreboard;
