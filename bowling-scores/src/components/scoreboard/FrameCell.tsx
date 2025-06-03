import React from 'react';
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
const FrameCell: React.FC<FrameCellProps> = ({
  frame,
  frameIndex,
  isCurrentFrame = false,
  isComplete = false,
}) => {
  const { theme } = useTheme();
  const isTenthFrame = frameIndex === 9;

  // Get roll displays
  const rollDisplays = getFrameRollDisplay(frame, frameIndex);

  // Determine color based on frame result
  const frameResult = getFrameColorCode(frame);

  // Frame border color
  const getBorderColor = () => {
    if (isCurrentFrame) {
      return theme.colors.primary.main;
    }
    return theme.colors.gray[300];
  };

  const renderRolls = () => {
    return (
      <View style={styles.rollsContainer}>
        {/* First roll cell */}
        <View style={[styles.rollCell, styles.firstRollCell]}>
          {frame.rolls.length > 0 && rollDisplays[0] === 'X' ? (
            <Badge variant='strike' size='small' />
          ) : (
            <Typography variant='body2'>
              {frame.rolls.length > 0 ? rollDisplays[0] : ''}
            </Typography>
          )}
        </View>

        {/* Second roll cell */}
        <View style={styles.rollCell}>
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

        {/* Third roll cell (10th frame only) */}
        {isTenthFrame && (
          <View style={styles.rollCell}>
            {frame.rolls.length > 2 && rollDisplays[2] === 'X' ? (
              <Badge variant='strike' size='small' />
            ) : (
              <Typography variant='body2'>
                {frame.rolls.length > 2 ? rollDisplays[2] : ''}
              </Typography>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        isTenthFrame && styles.tenthFrame,
        isCurrentFrame && styles.currentFrame,
        {
          borderColor: getBorderColor(),
          backgroundColor: isComplete
            ? theme.colors.background.paper
            : theme.colors.background.default,
        },
      ]}
      accessibilityLabel={`Frame ${frameIndex + 1}${
        isCurrentFrame ? ', current frame' : ''
      }`}>
      {/* Frame number */}
      <View style={styles.frameNumber}>
        <Typography variant='caption' color={theme.colors.text.secondary}>
          {frameIndex + 1}
        </Typography>
      </View>

      {/* Rolls */}
      {renderRolls()}

      {/* Score */}
      <View style={styles.scoreContainer}>
        <Typography
          variant='body2'
          color={
            frame.isStrike
              ? theme.colors.success
              : frame.isSpare
              ? theme.colors.accent.main
              : theme.colors.text.primary
          }>
          {frame.cumulativeScore > 0 ? frame.cumulativeScore : ''}
        </Typography>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 4,
    marginHorizontal: 2,
    width: 40,
    height: 80,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  tenthFrame: {
    width: 60,
  },
  currentFrame: {
    borderWidth: 2,
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
