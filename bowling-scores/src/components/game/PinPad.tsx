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

  // Determine if we're in the 10th frame
  const isTenthFrame = currentFrame === 9;

  // Determine if we need to show the spare button
  // We should show the spare button on second rolls for frames 1-9,
  // and also on the second/third roll of the 10th frame when a spare is possible
  let showSpareButton = false;

  if (!game.isComplete) {
    if (!isTenthFrame) {
      // For frames 1-9, show spare button on second roll
      showSpareButton = rollIndex === 1;
    } else {
      // For 10th frame, the logic is more complex
      if (rollIndex === 1) {
        // On second roll, show spare button only if first roll wasn't a strike
        showSpareButton = frame.rolls[0].pinsKnocked < 10;
      } else if (rollIndex === 2) {
        // On third roll, show spare button only if:
        // 1. First roll was a strike AND second roll was not a strike, OR
        // 2. First roll was not a strike AND second roll made a spare
        const firstRoll = frame.rolls[0].pinsKnocked;
        const secondRoll = frame.rolls[1].pinsKnocked;

        if (firstRoll === 10) {
          // After a strike, show spare button only if second roll wasn't a strike
          showSpareButton = secondRoll < 10;
        } else {
          // No spare button on third roll if the second roll wasn't preceded by a strike
          showSpareButton = false;
        }
      }
    }
  }

  // Determine if we should show the strike button
  // We always show it on first rolls, and in 10th frame we show it on bonus rolls too
  let showStrikeButton = isFirstRoll;

  if (isTenthFrame && !game.isComplete) {
    if (rollIndex === 1) {
      // Always show strike button on second roll in 10th frame if first was a strike
      showStrikeButton = frame.rolls[0].pinsKnocked === 10;
    } else if (rollIndex === 2) {
      // On third roll, show strike button if:
      // 1. First two rolls were strikes, OR
      // 2. First roll + second roll = 10 (spare)
      const firstRoll = frame.rolls[0].pinsKnocked;
      const secondRoll = frame.rolls[1].pinsKnocked;

      showStrikeButton =
        (firstRoll === 10 && secondRoll === 10) || // Two strikes
        (firstRoll < 10 && firstRoll + secondRoll === 10); // Spare
    }
  }

  // Determine remaining pins based on previous roll in this frame
  const remainingPins =
    isFirstRoll || (isTenthFrame && (frame?.isStrike || showStrikeButton))
      ? 10
      : 10 - (frame.rolls[0]?.pinsKnocked || 0);

  // Handle pin selection
  const handlePinSelection = useCallback(
    (value: number) => {
      // Convert spare value to actual pins remaining
      if (value === -1 && !isFirstRoll && frame) {
        // For 10th frame, need to handle different cases
        if (isTenthFrame && rollIndex === 2) {
          const secondRoll = frame.rolls[1].pinsKnocked;
          // Calculate the value needed for a spare based on the second roll
          const pinsForSpare = 10 - secondRoll;
          onPinSelect(pinsForSpare);
        } else {
          // Calculate the value needed for a spare
          const pinsForSpare = 10 - (frame.rolls[0]?.pinsKnocked || 0);
          onPinSelect(pinsForSpare);
        }
      } else {
        onPinSelect(value);
      }
    },
    [isFirstRoll, frame, onPinSelect, isTenthFrame, rollIndex]
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

    // For the first row, show 7-8-9-10/X or 7-8-9-/ depending on the situation
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
            isDisabled={!isPinValid(10) || game.isComplete || !showStrikeButton}
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

  // Determine the appropriate roll label
  let rollLabel = isFirstRoll ? 'First Roll' : 'Second Roll';
  if (isTenthFrame && rollIndex === 2) {
    rollLabel = 'Third Roll';
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography variant='h3' align='center'>
          {rollLabel}
        </Typography>
        {!isFirstRoll && (
          <Typography
            variant='body1'
            align='center'
            color={theme.colors.text.secondary}>
            {isTenthFrame && rollIndex === 2
              ? `${frame?.rolls[1]?.pinsKnocked || 0} pins down, ${
                  10 - (frame?.rolls[1]?.pinsKnocked || 0)
                } remaining`
              : `${
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
