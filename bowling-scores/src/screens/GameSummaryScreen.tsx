import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Player } from '../types';
import { Container, Typography, Button, Card } from '../components/ui';
import { useTheme } from '../contexts/ThemeContext';
import { useGame } from '../contexts/GameContext';

type GameSummaryScreenRouteProp = RouteProp<RootStackParamList, 'GameSummary'>;
type GameSummaryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'GameSummary'
>;

const GameSummaryScreen: React.FC = () => {
  const navigation = useNavigation<GameSummaryScreenNavigationProp>();
  const route = useRoute<GameSummaryScreenRouteProp>();
  const { players } = route.params;
  const { game } = useGame();
  const { theme } = useTheme();

  // If we have game data, use it; otherwise fall back to mocked data
  const playerScores = game?.scores
    ? players.map((player, index) => ({
        ...player,
        score: game.scores?.[index] ?? 0,
      }))
    : players.map((player) => ({
        ...player,
        // Fallback to mock data if game data isn't available
        score: Math.floor(Math.random() * 200) + 50, // Random score between 50-250
      }));

  // Sort players by score (highest first)
  const sortedPlayers = [...playerScores].sort((a, b) => b.score - a.score);

  // Navigate to home screen
  const handleReturnHome = () => {
    navigation.navigate('Home');
  };

  // Navigate to player setup to start a new game
  const handleNewGame = () => {
    navigation.navigate('PlayerSetup');
  };

  return (
    <Container>
      <Typography variant='h1' align='center' style={styles.title}>
        Game Summary
      </Typography>

      <Card style={styles.resultsContainer}>
        <ScrollView>
          {sortedPlayers.map((player, index) => (
            <View key={player.id} style={styles.scoreCard}>
              <View
                style={[
                  styles.rankContainer,
                  { backgroundColor: theme.colors.primary.main },
                ]}>
                <Typography
                  variant='body1'
                  color={theme.colors.common.white}
                  style={styles.rankText}>
                  {index + 1}
                </Typography>
              </View>
              <View style={styles.playerInfoContainer}>
                <Typography variant='body1' style={styles.playerName}>
                  {player.name}
                </Typography>
                <Typography variant='h3' style={styles.scoreText}>
                  {player.score}
                </Typography>
              </View>
            </View>
          ))}
        </ScrollView>
      </Card>

      <Card style={styles.statsContainer}>
        <Typography variant='h3' style={styles.statsTitle}>
          Game Statistics
        </Typography>
        <Typography variant='body1' color={theme.colors.text.secondary}>
          This section will display detailed game statistics.
        </Typography>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          variant='secondary'
          style={[styles.button, { marginRight: 8 }]}
          onPress={handleReturnHome}>
          Return to Home
        </Button>

        <Button variant='primary' style={styles.button} onPress={handleNewGame}>
          New Game
        </Button>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  title: {
    marginVertical: 16,
  },
  resultsContainer: {
    flex: 1,
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  scoreCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  rankContainer: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
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
    fontWeight: '500',
  },
  scoreText: {
    fontWeight: 'bold',
  },
  statsContainer: {
    marginBottom: 16,
  },
  statsTitle: {
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  button: {
    flex: 1,
  },
});

export default GameSummaryScreen;
