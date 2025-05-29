import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Game } from '../../types';
import { getRollResultMessage } from '../../utils/scoring';
import { useGame } from '../../contexts/GameContext';
import { Card, Typography, Button } from '../ui';
import PinPad from './PinPad';
import { useTheme } from '../../contexts/ThemeContext';

export interface PinInputProps {
  game: Game;
}

/**
 * Main pin input component that includes the pin pad and game controls
 */
const PinInput: React.FC<PinInputProps> = ({ game }) => {
  const { theme } = useTheme();
  const { addRoll, resetFrame, canAddRoll } = useGame();
  const [lastRollMessage, setLastRollMessage] = useState<string | null>(null);

  // Handle pin selection
  const handlePinSelect = (pins: number) => {
    // Validate the roll
    const validation = canAddRoll(pins);

    if (!validation.valid) {
      Alert.alert(
        'Invalid Roll',
        validation.error || 'That roll is not valid.'
      );
      return;
    }

    // Determine if this is a strike or spare
    const { currentPlayer, currentFrame } = game;
    const frame = game.frames[currentPlayer][currentFrame];
    const isFirstRoll = !frame || frame.rolls.length === 0;

    let isStrike = false;
    let isSpare = false;

    if (isFirstRoll) {
      isStrike = pins === 10;
    } else {
      isSpare = frame.rolls[0].pinsKnocked + pins === 10;
    }

    // Add the roll to the game
    addRoll(pins);

    // Show result message
    const message = getRollResultMessage(pins, isStrike, isSpare);
    setLastRollMessage(message);

    // Clear message after a delay
    setTimeout(() => {
      setLastRollMessage(null);
    }, 2000);
  };

  // Handle resetting the current frame
  const handleResetFrame = () => {
    Alert.alert(
      'Reset Frame',
      'Are you sure you want to reset the current frame?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetFrame();
            setLastRollMessage(null);
          },
        },
      ]
    );
  };

  return (
    <Card style={styles.container}>
      <Typography variant='h3' style={styles.title}>
        Pin Input
      </Typography>

      {lastRollMessage && (
        <View
          style={[
            styles.messageContainer,
            {
              backgroundColor: lastRollMessage.includes('Strike')
                ? theme.colors.success + '20' // 20 is for opacity
                : lastRollMessage.includes('Spare')
                ? theme.colors.accent.main + '20'
                : theme.colors.info + '20',
            },
          ]}>
          <Typography
            variant='body1'
            align='center'
            color={
              lastRollMessage.includes('Strike')
                ? theme.colors.success
                : lastRollMessage.includes('Spare')
                ? theme.colors.accent.main
                : theme.colors.info
            }>
            {lastRollMessage}
          </Typography>
        </View>
      )}

      <PinPad game={game} onPinSelect={handlePinSelect} />

      <View style={styles.controls}>
        <Button
          variant='secondary'
          onPress={handleResetFrame}
          disabled={
            game.isComplete ||
            !game.frames[game.currentPlayer][game.currentFrame]?.rolls.length
          }>
          Reset Frame
        </Button>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    padding: 16,
    paddingBottom: 8,
    textAlign: 'center',
  },
  messageContainer: {
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
  },
});

export default PinInput;
