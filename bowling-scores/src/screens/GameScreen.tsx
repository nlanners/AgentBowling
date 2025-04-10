import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { BowlingGame } from '../models/BowlingGame';
import { Scoreboard } from '../components/Scoreboard';

export const GameScreen: React.FC = () => {
  const [game, setGame] = useState<BowlingGame>(new BowlingGame());
  const [, forceUpdate] = useState<object>({});

  const handleRoll = (pins: number) => {
    if (game.isGameOver()) {
      Alert.alert(
        'Game Over',
        'This game has ended. Would you like to start a new game?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'New Game',
            onPress: startNewGame,
          },
        ]
      );
      return;
    }

    game.roll(pins);
    forceUpdate({});

    if (game.isGameOver()) {
      Alert.alert('Game Over', `Final Score: ${game.getTotalScore()}`);
    }
  };

  const startNewGame = () => {
    const newGame = new BowlingGame();
    setGame(newGame);
  };

  const renderPinButtons = () => {
    const currentFrame = game.getCurrentFrame();
    const currentRoll = game.getCurrentRoll();
    const frames = game.getFrames();
    const maxPins = 10;

    // If it's the second roll of a frame, limit available pins
    let availablePins = maxPins;
    if (currentRoll === 1 && currentFrame < 10) {
      const firstRoll = frames[currentFrame].rolls[0];
      availablePins = maxPins - firstRoll;
    }

    // Special case for 10th frame
    if (currentFrame === 9) {
      const frame = frames[currentFrame];
      if (frame.rolls.length === 1 && frame.isStrike) {
        availablePins = maxPins;
      } else if (frame.rolls.length === 2) {
        if (frame.isSpare || frame.isStrike) {
          availablePins = maxPins;
        } else {
          return null; // Game over, no more rolls
        }
      }
    }

    const buttons = [];
    for (let i = 0; i <= availablePins; i++) {
      buttons.push(
        <TouchableOpacity
          key={`pin-${i}`}
          style={styles.pinButton}
          onPress={() => handleRoll(i)}>
          <Text style={styles.pinButtonText}>{i}</Text>
        </TouchableOpacity>
      );
    }

    return <View style={styles.pinButtonsContainer}>{buttons}</View>;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bowling Score Tracker</Text>
      </View>

      <Scoreboard
        frames={game.getFrames()}
        currentFrame={game.getCurrentFrame()}
      />

      <View style={styles.gameInfo}>
        <Text style={styles.gameInfoText}>
          Frame: {game.getCurrentFrame() + 1} | Roll:{' '}
          {game.getCurrentRoll() + 1}
        </Text>
        <Text style={styles.totalScore}>
          Total Score: {game.getTotalScore()}
        </Text>
      </View>

      {renderPinButtons()}

      <TouchableOpacity style={styles.newGameButton} onPress={startNewGame}>
        <Text style={styles.newGameButtonText}>New Game</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  gameInfo: {
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  gameInfoText: {
    fontSize: 18,
    marginBottom: 5,
  },
  totalScore: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  pinButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  pinButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e0e0',
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  newGameButton: {
    margin: 20,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  newGameButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
