import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Frame } from '../models/BowlingGame';

interface ScoreboardProps {
  frames: Frame[];
  currentFrame: number;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  frames,
  currentFrame,
}) => {
  const renderRoll = (frame: Frame, rollIndex: number) => {
    if (frame.rolls.length <= rollIndex) {
      return '';
    }

    const pins = frame.rolls[rollIndex];

    if (rollIndex === 0 && pins === 10) {
      return 'X'; // Strike
    } else if (rollIndex === 1 && frame.isSpare) {
      return '/'; // Spare
    } else if (pins === 0) {
      return '-'; // Miss
    }

    return pins.toString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {frames.map((_, index) => (
          <View key={`frame-${index}`} style={styles.frameHeader}>
            <Text style={styles.frameNumber}>{index + 1}</Text>
          </View>
        ))}
      </View>

      <View style={styles.rollsRow}>
        {frames.map((frame, frameIndex) => (
          <View key={`rolls-${frameIndex}`} style={styles.frame}>
            <View style={styles.rollContainer}>
              <Text style={styles.roll}>{renderRoll(frame, 0)}</Text>
            </View>
            <View style={styles.rollContainer}>
              <Text style={styles.roll}>{renderRoll(frame, 1)}</Text>
            </View>
            {frameIndex === 9 && (
              <View style={styles.rollContainer}>
                <Text style={styles.roll}>{renderRoll(frame, 2)}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.scoresRow}>
        {frames.map((frame, frameIndex) => (
          <View
            key={`score-${frameIndex}`}
            style={[
              styles.scoreContainer,
              currentFrame === frameIndex ? styles.currentFrame : null,
            ]}>
            <Text style={styles.score}>
              {frame.score > 0 ? frame.score : ''}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  frameHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
    backgroundColor: '#eee',
  },
  frameNumber: {
    fontWeight: 'bold',
  },
  rollsRow: {
    flexDirection: 'row',
  },
  frame: {
    flex: 1,
    flexDirection: 'row',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  rollContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  roll: {
    fontSize: 16,
    fontWeight: '500',
  },
  scoresRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  scoreContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  currentFrame: {
    backgroundColor: '#e6f7ff',
  },
});
