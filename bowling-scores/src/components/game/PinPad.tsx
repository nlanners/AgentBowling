import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Game } from '../../types';
import { canKnockDownPins } from '../../utils/scoring';
import PinButton from './PinButton';
import { Typography } from '../ui';
import { useTheme } from '../../contexts/ThemeContext';

export interface PinPadProps {
  game: Game;
  onPinSelect: (pins: number) => void;
}

/**
 * Pin pad component for selecting pin counts with a grid of buttons
 */
const PinPad: React.FC<PinPadProps> = ({ game, onPinSelect }) => {
  const { theme } = useTheme();
  const { currentPlayer, currentFrame } = game;
  const frame = game.frames[currentPlayer][currentFrame];

  // Get the current roll number
  const rollIndex = frame ? frame.rolls.length : 0;

  // Determine if we're on the first roll
  const isFirstRoll = rollIndex === 0;

  // Determine if we need to show the spare button
  const showSpareButton = !isFirstRoll && !game.isComplete;

  // Determine remaining pins based on previous roll in this frame
  const remainingPins =
    isFirstRoll || currentFrame === 9
      ? 10
      : 10 - (frame.rolls[0]?.pinsKnocked || 0);

  // In 10th frame with a strike or spare, we may need all pins
  const isTenthFrameSpecial =
    currentFrame === 9 && rollIndex >= 1 && (frame.isStrike || frame.isSpare);

  // Handle pin selection
  const handlePinSelection = useCallback(
    (value: number) => {
      // Convert spare value to actual pins remaining
      if (value === -1 && !isFirstRoll && frame) {
        // Calculate the value needed for a spare
        const pinsForSpare = 10 - (frame.rolls[0]?.pinsKnocked || 0);
        onPinSelect(pinsForSpare);
      } else {
        onPinSelect(value);
      }
    },
    [isFirstRoll, frame, onPinSelect]
  );

  // Check if a pin value is valid
  const isPinValid = useCallback(
    (value: number) => {
      // Always allow spare button (will be converted to actual value)
      if (value === -1) return true;

      return canKnockDownPins(game, value);
    },
    [game]
  );

  const renderPinButtons = () => {
    const buttons = [];

    // For the first row, show 7-8-9-10 or 7-8-9-/ for second roll
    buttons.push(
      <View key='row1' style={styles.row}>
        <PinButton
          value={7}
          onPress={handlePinSelection}
          isDisabled={!isPinValid(7) || game.isComplete}
        />
        <PinButton
          value={8}
          onPress={handlePinSelection}
          isDisabled={!isPinValid(8) || game.isComplete}
        />
        <PinButton
          value={9}
          onPress={handlePinSelection}
          isDisabled={!isPinValid(9) || game.isComplete}
        />
        {showSpareButton ? (
          <PinButton
            value={-1}
            isSpecial={true}
            onPress={handlePinSelection}
            isDisabled={game.isComplete}
          />
        ) : (
          <PinButton
            value={10}
            isSpecial={true}
            onPress={handlePinSelection}
            isDisabled={!isPinValid(10) || game.isComplete}
          />
        )}
      </View>
    );

    // Second row: 4-5-6
    buttons.push(
      <View key='row2' style={styles.row}>
        <PinButton
          value={4}
          onPress={handlePinSelection}
          isDisabled={!isPinValid(4) || game.isComplete}
        />
        <PinButton
          value={5}
          onPress={handlePinSelection}
          isDisabled={!isPinValid(5) || game.isComplete}
        />
        <PinButton
          value={6}
          onPress={handlePinSelection}
          isDisabled={!isPinValid(6) || game.isComplete}
        />
      </View>
    );

    // Third row: 1-2-3
    buttons.push(
      <View key='row3' style={styles.row}>
        <PinButton
          value={1}
          onPress={handlePinSelection}
          isDisabled={!isPinValid(1) || game.isComplete}
        />
        <PinButton
          value={2}
          onPress={handlePinSelection}
          isDisabled={!isPinValid(2) || game.isComplete}
        />
        <PinButton
          value={3}
          onPress={handlePinSelection}
          isDisabled={!isPinValid(3) || game.isComplete}
        />
      </View>
    );

    // Fourth row: just 0
    buttons.push(
      <View key='row4' style={styles.row}>
        <PinButton
          value={0}
          onPress={handlePinSelection}
          isDisabled={game.isComplete}
          style={styles.zeroButton}
        />
      </View>
    );

    return buttons;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography variant='h3' align='center'>
          {isFirstRoll ? 'First Roll' : 'Second Roll'}
        </Typography>
        {!isFirstRoll && (
          <Typography
            variant='body1'
            align='center'
            color={theme.colors.text.secondary}>
            {`${
              frame?.rolls[0]?.pinsKnocked || 0
            } pins down, ${remainingPins} remaining`}
          </Typography>
        )}
      </View>

      <View style={styles.pinPad}>{renderPinButtons()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  pinPad: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  zeroButton: {
    width: 140,
  },
});

export default PinPad;
