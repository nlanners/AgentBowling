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
    <Card style={styles.container}>
      <Typography variant='h3' style={styles.title}>
        Scoreboard
      </Typography>

      <View style={styles.headerRow}>
        <View style={styles.playerHeaderColumn}>
          <Typography variant='caption' color={theme.colors.text.secondary}>
            Player
          </Typography>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.framesHeader}>
          {Array.from({ length: 10 }).map((_, index) => (
            <View key={`header-${index}`} style={styles.frameHeaderCell}>
              <Typography variant='caption' color={theme.colors.text.secondary}>
                {index + 1}
              </Typography>
            </View>
          ))}
        </ScrollView>
      </View>

      <ScrollView>
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

      {isComplete && (
        <View style={styles.gameComplete}>
          <Typography variant='body1' color={theme.colors.success}>
            Game Complete
          </Typography>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
    overflow: 'hidden',
  },
  title: {
    padding: 16,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  playerHeaderColumn: {
    width: 100,
    paddingLeft: 16,
  },
  framesHeader: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  frameHeaderCell: {
    width: 40,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  gameComplete: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
});

export default Scoreboard;
