import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Frame } from '../../types';
import { getFrameRollDisplay, getFrameColorCode } from '../../utils/scoring';
import { Typography, Badge } from '../ui';
import { useTheme } from '../../contexts/ThemeContext';

export interface FrameCellProps {
  frame: Frame;
  frameIndex: number;
  isCurrentFrame?: boolean;
  isComplete?: boolean;
}

/**
 * Component that displays a single bowling frame with rolls and score
 */
const FrameCell: React.FC<FrameCellProps> = React.memo(
  ({ frame, frameIndex, isCurrentFrame = false, isComplete = false }) => {
    const { theme } = useTheme();

    // Memoize expensive calculations
    const isTenthFrame = useMemo(() => frameIndex === 9, [frameIndex]);
    const isFirstFrame = useMemo(() => frameIndex === 0, [frameIndex]);

    const rollDisplays = useMemo(
      () => getFrameRollDisplay(frame, frameIndex),
      [frame, frameIndex]
    );

    const frameResult = useMemo(() => getFrameColorCode(frame), [frame]);

    // Memoize border color calculation
    const borderColor = useMemo(() => {
      return isCurrentFrame
        ? theme.colors.primary.main
        : theme.colors.gray[300];
    }, [isCurrentFrame, theme.colors.primary.main, theme.colors.gray]);

    // Memoize background color calculation
    const backgroundColor = useMemo(() => {
      return isComplete
        ? theme.colors.background.paper
        : theme.colors.background.default;
    }, [
      isComplete,
      theme.colors.background.paper,
      theme.colors.background.default,
    ]);

    // Memoize score text color calculation
    const scoreTextColor = useMemo(() => {
      if (frame.isStrike) return theme.colors.success;
      if (frame.isSpare) return theme.colors.accent.main;
      return theme.colors.text.primary;
    }, [
      frame.isStrike,
      frame.isSpare,
      theme.colors.success,
      theme.colors.accent.main,
      theme.colors.text.primary,
    ]);

    // Memoize container styles with conditional border radius
    const containerStyles = useMemo(
      () => [
        styles.container,
        isTenthFrame && styles.tenthFrame,
        isCurrentFrame && styles.currentFrame,
        isFirstFrame && styles.firstFrame,
        isTenthFrame && styles.lastFrame,
        {
          borderColor,
          backgroundColor,
        },
      ],
      [isTenthFrame, isCurrentFrame, isFirstFrame, borderColor, backgroundColor]
    );

    // Memoize accessibility label
    const accessibilityLabel = useMemo(
      () => `Frame ${frameIndex + 1}${isCurrentFrame ? ', current frame' : ''}`,
      [frameIndex, isCurrentFrame]
    );

    // Memoize roll cell content to avoid re-renders
    const rollCells = useMemo(() => {
      const cells = [];

      // First roll cell
      cells.push(
        <View key='first-roll' style={[styles.rollCell, styles.firstRollCell]}>
          {frame.rolls.length > 0 && rollDisplays[0] === 'X' ? (
            <Badge variant='strike' size='small' />
          ) : (
            <Typography variant='body2'>
              {frame.rolls.length > 0 ? rollDisplays[0] : ''}
            </Typography>
          )}
        </View>
      );

      // Second roll cell
      cells.push(
        <View key='second-roll' style={styles.rollCell}>
          {frame.rolls.length > 1 && rollDisplays[1] === '/' ? (
            <Badge variant='spare' size='small' />
          ) : frame.rolls.length > 1 && rollDisplays[1] === 'X' ? (
            <Badge variant='strike' size='small' />
          ) : (
            <Typography variant='body2'>
              {frame.rolls.length > 1 ? rollDisplays[1] : ''}
            </Typography>
          )}
        </View>
      );

      // Third roll cell (10th frame only)
      if (isTenthFrame) {
        cells.push(
          <View key='third-roll' style={styles.rollCell}>
            {frame.rolls.length > 2 && rollDisplays[2] === 'X' ? (
              <Badge variant='strike' size='small' />
            ) : (
              <Typography variant='body2'>
                {frame.rolls.length > 2 ? rollDisplays[2] : ''}
              </Typography>
            )}
          </View>
        );
      }

      return cells;
    }, [frame.rolls, rollDisplays, isTenthFrame]);

    return (
      <View style={containerStyles} accessibilityLabel={accessibilityLabel}>
        {/* Frame number */}
        <View style={styles.frameNumber}>
          <Typography variant='caption' color={theme.colors.text.secondary}>
            {frameIndex + 1}
          </Typography>
        </View>

        {/* Rolls */}
        <View style={styles.rollsContainer}>{rollCells}</View>

        {/* Score */}
        <View style={styles.scoreContainer}>
          <Typography variant='body2' color={scoreTextColor}>
            {frame.cumulativeScore > 0 ? frame.cumulativeScore : ''}
          </Typography>
        </View>
      </View>
    );
  }
);

// Add display name for debugging
FrameCell.displayName = 'FrameCell';

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 0,
    marginHorizontal: 0,
    width: 34,
    height: 80,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  tenthFrame: {
    width: 52,
  },
  currentFrame: {
    borderWidth: 2,
  },
  firstFrame: {
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  lastFrame: {
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  frameNumber: {
    alignItems: 'center',
    paddingTop: 2,
  },
  rollsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  rollCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    borderLeftWidth: 1,
    borderColor: '#e0e0e0',
  },
  firstRollCell: {
    borderLeftWidth: 0,
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 2,
    height: 24,
  },
});

export default FrameCell;
