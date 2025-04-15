import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Player } from '../types';

type GameSummaryScreenRouteProp = RouteProp<RootStackParamList, 'GameSummary'>;
type GameSummaryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'GameSummary'
>;

const GameSummaryScreen: React.FC = () => {
  const navigation = useNavigation<GameSummaryScreenNavigationProp>();
  const route = useRoute<GameSummaryScreenRouteProp>();
  const { players } = route.params;

  // Mock data for demonstration
  const mockScores = players.map((player) => ({
    ...player,
    score: Math.floor(Math.random() * 200) + 50, // Random score between 50-250
  }));

  // Sort players by score (highest first)
  const sortedPlayers = [...mockScores].sort((a, b) => b.score - a.score);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Summary</Text>

      <ScrollView style={styles.resultsContainer}>
        {sortedPlayers.map((player, index) => (
          <View key={player.id} style={styles.scoreCard}>
            <View style={styles.rankContainer}>
              <Text style={styles.rankText}>{index + 1}</Text>
            </View>
            <View style={styles.playerInfoContainer}>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.scoreText}>{player.score}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Game Statistics</Text>
        <Text style={styles.statsText}>
          This section will display detailed game statistics.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Home')}>
          <Text style={styles.buttonText}>Return to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('PlayerSetup')}>
          <Text style={styles.buttonText}>New Game</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  resultsContainer: {
    flex: 1,
    marginBottom: 16,
  },
  scoreCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  rankContainer: {
    backgroundColor: '#007AFF',
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '500',
  },
  scoreText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statsContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsText: {
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GameSummaryScreen;
