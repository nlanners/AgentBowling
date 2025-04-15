import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Player } from '../types';

type GameScreenRouteProp = RouteProp<RootStackParamList, 'Game'>;
type GameScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Game'
>;

const GameScreen: React.FC = () => {
  const navigation = useNavigation<GameScreenNavigationProp>();
  const route = useRoute<GameScreenRouteProp>();
  const { players } = route.params;

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [currentRoll, setCurrentRoll] = useState(1);

  // Placeholder for the scoreboard component
  const renderScoreboard = () => {
    return (
      <View style={styles.scoreboardPlaceholder}>
        <Text style={styles.placeholderText}>
          Scoreboard will be implemented here
        </Text>
      </View>
    );
  };

  // Placeholder for the pin input component
  const renderPinInput = () => {
    return (
      <View style={styles.pinInputPlaceholder}>
        <Text style={styles.placeholderText}>
          Pin input interface will be implemented here
        </Text>

        {/* Temporary navigation to game summary for testing */}
        <TouchableOpacity
          style={styles.tempButton}
          onPress={() => navigation.navigate('GameSummary', { players })}>
          <Text style={styles.tempButtonText}>End Game (Temp)</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Frame {currentFrame} • Roll {currentRoll}
        </Text>
        <Text style={styles.playerName}>
          {players[currentPlayerIndex].name}'s turn
        </Text>
      </View>

      {renderScoreboard()}
      {renderPinInput()}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          Alert.alert(
            'End Game',
            'Are you sure you want to end this game? All progress will be lost.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'End Game',
                style: 'destructive',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        }}>
        <Text style={styles.backButtonText}>End Game</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  scoreboardPlaceholder: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  pinInputPlaceholder: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  placeholderText: {
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tempButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  tempButtonText: {
    color: 'white',
    fontSize: 14,
  },
});

export default GameScreen;
