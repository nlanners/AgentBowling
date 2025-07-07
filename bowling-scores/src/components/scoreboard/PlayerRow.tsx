import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
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
 * Component that displays a player's name and all frames in a stacked layout
 */
const PlayerRow: React.FC<PlayerRowProps> = React.memo(
  ({
    player,
    frames,
    currentPlayerIndex,
    playerIndex,
    currentFrameIndex,
    isGameComplete = false,
  }) => {
    const { theme } = useTheme();

    // Memoize calculations and values
    const isCurrentPlayer = useMemo(
      () => currentPlayerIndex === playerIndex,
      [currentPlayerIndex, playerIndex]
    );

    const totalScore = useMemo(
      () =>
        frames.length > 0 && frames[frames.length - 1]
          ? frames[frames.length - 1].cumulativeScore
          : 0,
      [frames]
    );

    // Memoize placeholder frames calculation
    const placeholderFrames = useMemo(() => {
      const count = Math.max(0, 10 - frames.length);
      return Array.from({ length: count }, (_, index) => ({
        index,
        frameIndex: frames.length + index,
      }));
    }, [frames.length]);

    // Memoize style calculations
    const playerInfoContainerStyle = useMemo(
      () => [
        styles.playerInfoContainer,
        isCurrentPlayer && { backgroundColor: theme.colors.primary.light },
      ],
      [isCurrentPlayer, theme.colors.primary.light]
    );

    const playerNameColor = useMemo(
      () =>
        isCurrentPlayer ? theme.colors.primary.dark : theme.colors.text.primary,
      [isCurrentPlayer, theme.colors.primary.dark, theme.colors.text.primary]
    );

    return (
      <View style={styles.container}>
        {/* Player info above frames */}
        <View style={playerInfoContainerStyle}>
          <View style={styles.playerIndicator}>
            {isCurrentPlayer && !isGameComplete && (
              <Badge variant='active' size='small' content='•' />
            )}
          </View>
          <Typography
            variant='body1'
            style={styles.playerName}
            color={playerNameColor}>
            {player.name}
          </Typography>
          <Typography
            variant='body2'
            color={theme.colors.text.secondary}
            style={styles.totalScore}>
            {totalScore > 0 ? totalScore : ''}
          </Typography>
        </View>

        {/* Frames - spans full width */}
        <View style={styles.framesContainer}>
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
          {placeholderFrames.map(({ index, frameIndex }) => (
            <View
              key={`placeholder-${playerIndex}-${index}`}
              style={[
                styles.placeholderFrame,
                frameIndex === 9 && styles.tenthPlaceholderFrame,
                frameIndex === 0 && styles.firstPlaceholderFrame,
                frameIndex === 9 && styles.lastPlaceholderFrame,
              ]}
            />
          ))}
        </View>
      </View>
    );
  }
);

// Add display name for debugging
PlayerRow.displayName = 'PlayerRow';

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  playerInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingVertical: 2,
    marginHorizontal: 0,
    marginBottom: 2,
    borderRadius: 4,
  },
  playerIndicator: {
    width: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  playerName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  totalScore: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  framesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  placeholderFrame: {
    width: 34,
    height: 80,
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 0,
    backgroundColor: '#f9f9f9',
  },
  tenthPlaceholderFrame: {
    width: 52,
  },
  firstPlaceholderFrame: {
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  lastPlaceholderFrame: {
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
});

export default PlayerRow;
