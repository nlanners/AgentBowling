import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  LayoutChangeEvent,
  findNodeHandle,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
} from 'react-native';
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
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollViewRef?: (ref: ScrollView | null) => void;
}

/**
 * Component that displays a player's name and all frames in a row
 */
const PlayerRow: React.FC<PlayerRowProps> = React.memo(
  ({
    player,
    frames,
    currentPlayerIndex,
    playerIndex,
    currentFrameIndex,
    isGameComplete = false,
    onScroll,
    scrollViewRef,
  }) => {
    const { theme } = useTheme();
    const internalScrollViewRef = useRef<ScrollView>(null);
    const frameRefs = useRef<View[]>([]);

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

    const screenWidth = useMemo(() => Dimensions.get('window').width, []);
    const playerNameWidth = useMemo(() => 100, []); // Width of player name column

    // Memoize placeholder frames calculation
    const placeholderFrames = useMemo(() => {
      const count = Math.max(0, 10 - frames.length);
      return Array.from({ length: count }, (_, index) => ({
        index,
        frameIndex: frames.length + index,
      }));
    }, [frames.length]);

    // Memoize style calculations
    const playerNameContainerStyle = useMemo(
      () => [
        styles.playerNameContainer,
        isCurrentPlayer && { backgroundColor: theme.colors.primary.light },
      ],
      [isCurrentPlayer, theme.colors.primary.light]
    );

    const playerNameColor = useMemo(
      () =>
        isCurrentPlayer ? theme.colors.primary.dark : theme.colors.text.primary,
      [isCurrentPlayer, theme.colors.primary.dark, theme.colors.text.primary]
    );

    // Combine refs - use both the internal ref and the one passed from parent
    useEffect(() => {
      if (scrollViewRef && internalScrollViewRef.current) {
        scrollViewRef(internalScrollViewRef.current);
      }
    }, [scrollViewRef]);

    // Memoize scroll calculation
    const scrollToCurrentFrame = useCallback(() => {
      if (isCurrentPlayer && !isGameComplete && internalScrollViewRef.current) {
        // Calculate frame widths (standard frames are 44px, 10th frame is 64px)
        const frameWidth = 44; // Default frame width with margins
        const tenthFrameWidth = 64; // 10th frame is wider

        // Calculate the available width for frames (screen width minus player name column)
        const availableWidth = screenWidth - playerNameWidth;

        // Calculate the offset to the current frame
        let offset = 0;
        for (let i = 0; i < currentFrameIndex; i++) {
          offset += i === 9 ? tenthFrameWidth : frameWidth;
        }

        // Calculate the center position to ensure the frame is fully visible
        // Add a bit of extra padding (20px) to better center the current frame
        const centerOffset = Math.max(
          0,
          offset - availableWidth / 2 + frameWidth / 2 + 20
        );

        // Ensure we don't scroll beyond the content
        const scrollToOffset = Math.min(centerOffset, 440); // 440 is approx max scroll (10 frames * ~44px)

        // Use setTimeout to ensure the scroll happens after render
        // Use a longer timeout to ensure the component has fully rendered
        setTimeout(() => {
          if (internalScrollViewRef.current) {
            internalScrollViewRef.current.scrollTo({
              x: scrollToOffset,
              animated: true,
            });
          }
        }, 300);
      }
    }, [
      currentFrameIndex,
      isCurrentPlayer,
      isGameComplete,
      screenWidth,
      playerNameWidth,
    ]);

    // Scroll to the current frame when it changes or when this becomes the current player
    useEffect(() => {
      scrollToCurrentFrame();
    }, [scrollToCurrentFrame]);

    // Memoize scroll view ref callback
    const handleScrollViewRef = useCallback((ref: ScrollView | null) => {
      if (ref) {
        frameRefs.current[0] = ref as any; // Type assertion for compatibility
      }
    }, []);

    return (
      <View style={styles.container}>
        {/* Player name */}
        <View style={playerNameContainerStyle}>
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

        {/* Frames */}
        <ScrollView
          ref={internalScrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.framesContainer}
          onScroll={onScroll}
          scrollEventThrottle={16}>
          {frames.map((frame, index) => (
            <View
              key={`frame-${playerIndex}-${index}`}
              ref={(ref) => {
                if (ref) {
                  frameRefs.current[index] = ref;
                }
              }}>
              <FrameCell
                frame={frame}
                frameIndex={index}
                isCurrentFrame={isCurrentPlayer && currentFrameIndex === index}
                isComplete={isGameComplete}
              />
            </View>
          ))}

          {/* Add placeholders if less than 10 frames */}
          {placeholderFrames.map(({ index, frameIndex }) => (
            <View
              key={`placeholder-${playerIndex}-${index}`}
              ref={(ref) => {
                if (ref) {
                  frameRefs.current[frameIndex] = ref;
                }
              }}
              style={[
                styles.placeholderFrame,
                frameIndex === 9 && styles.tenthPlaceholderFrame,
              ]}
            />
          ))}
        </ScrollView>
      </View>
    );
  }
);

// Add display name for debugging
PlayerRow.displayName = 'PlayerRow';

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
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  totalScore: {
    width: 20,
    textAlign: 'center',
    fontSize: 12,
  },
  framesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholderFrame: {
    width: 36,
    height: 72,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    backgroundColor: '#f9f9f9',
  },
  tenthPlaceholderFrame: {
    width: 56,
  },
});

export default PlayerRow;
