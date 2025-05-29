import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Frame, Player } from '../../types';
import { Typography, Badge } from '../ui';
import FrameCell from './FrameCell';
import { useTheme } from '../../contexts/ThemeContext';

export interface PlayerRowProps {
  player: Player;
  frames: Frame[];
  currentPlayerIndex: number;
  playerIndex: number;
  currentFrameIndex: number;
  isGameComplete?: boolean;
}

/**
 * Component that displays a player's name and all frames in a row
 */
const PlayerRow: React.FC<PlayerRowProps> = ({
  player,
  frames,
  currentPlayerIndex,
  playerIndex,
  currentFrameIndex,
  isGameComplete = false,
}) => {
  const { theme } = useTheme();
  const isCurrentPlayer = currentPlayerIndex === playerIndex;

  // Get total score
  const totalScore =
    frames.length > 0 && frames[frames.length - 1]
      ? frames[frames.length - 1].cumulativeScore
      : 0;

  return (
    <View style={styles.container}>
      {/* Player name */}
      <View
        style={[
          styles.playerNameContainer,
          isCurrentPlayer && { backgroundColor: theme.colors.primary.light },
        ]}>
        <View style={styles.playerIndicator}>
          {isCurrentPlayer && !isGameComplete && (
            <Badge variant='active' size='small' content='•' />
          )}
        </View>
        <Typography
          variant='body1'
          style={styles.playerName}
          color={
            isCurrentPlayer
              ? theme.colors.primary.dark
              : theme.colors.text.primary
          }>
          {player.name}
        </Typography>
        <Typography
          variant='body2'
          color={theme.colors.text.secondary}
          style={styles.totalScore}>
          {totalScore > 0 ? totalScore : ''}
        </Typography>
      </View>

      {/* Frames */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.framesContainer}>
        {frames.map((frame, index) => (
          <FrameCell
            key={`frame-${playerIndex}-${index}`}
            frame={frame}
            frameIndex={index}
            isCurrentFrame={isCurrentPlayer && currentFrameIndex === index}
            isComplete={isGameComplete}
          />
        ))}

        {/* Add placeholders if less than 10 frames */}
        {Array.from({ length: Math.max(0, 10 - frames.length) }).map(
          (_, index) => (
            <View
              key={`placeholder-${playerIndex}-${index}`}
              style={[
                styles.placeholderFrame,
                index === 9 && styles.tenthPlaceholderFrame,
              ]}
            />
          )
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  playerNameContainer: {
    flexDirection: 'row',
    width: 100,
    paddingLeft: 8,
    paddingRight: 4,
    height: 80,
    alignItems: 'center',
    borderRadius: 4,
  },
  playerIndicator: {
    width: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerName: {
    flex: 1,
    fontWeight: '500',
  },
  totalScore: {
    marginLeft: 4,
    fontWeight: 'bold',
  },
  framesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  placeholderFrame: {
    width: 40,
    height: 80,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    marginHorizontal: 2,
    opacity: 0.5,
  },
  tenthPlaceholderFrame: {
    width: 60,
  },
});

export default PlayerRow;
