import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Game } from '../../types';
import { useGame } from '../../contexts/GameContext';
import { Card, Typography, Button } from '../ui';
import PinPad from './PinPad';

export interface PinInputProps {
  game: Game;
}

/**
 * Main pin input component that includes the pin pad and game controls
 */
const PinInput: React.FC<PinInputProps> = ({ game }) => {
  const { addRoll, resetFrame, canAddRoll } = useGame();

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

    // Add the roll to the game
    addRoll(pins);
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
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
  },
});

export default PinInput;
