import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, PlayerState } from '../types';
import { Container, Typography, Button, Card } from '../components/ui';
import { StatisticCard, StatisticsSection } from '../components/statistics';
import { useTheme } from '../contexts/ThemeContext';
import { useGame } from '../contexts/GameContext';
import { calculateGameStatistics } from '../utils/statistics';

type GameSummaryScreenRouteProp = RouteProp<RootStackParamList, 'GameSummary'>;
type GameSummaryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'GameSummary'
>;

const GameSummaryScreen: React.FC = () => {
  const navigation = useNavigation<GameSummaryScreenNavigationProp>();
  const route = useRoute<GameSummaryScreenRouteProp>();
  const { players } = route.params;
  const { game, saveGameToHistory } = useGame();
  const { theme } = useTheme();
  const [gameSaved, setGameSaved] = useState(false);

  // Calculate game statistics if we have game data
  const gameStats = useMemo(() => {
    if (!game) return null;
    return calculateGameStatistics(game);
  }, [game]);

  // Save the game to history when the screen loads
  useEffect(() => {
    const saveGame = async () => {
      if (game && !gameSaved) {
        try {
          const success = await saveGameToHistory();
          if (success) {
            setGameSaved(true);
            console.log('Game saved to history successfully');
          } else {
            console.error('Failed to save game to history');
          }
        } catch (error) {
          console.error('Error saving game to history:', error);
        }
      }
    };

    saveGame();
  }, [game, saveGameToHistory, gameSaved]);

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
      <ScrollView>
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

        {/* Game Statistics Section */}
        {gameStats && (
          <StatisticsSection
            title='Game Statistics'
            description='Performance metrics for this game'>
            {/* Display statistics for the winner */}
            {sortedPlayers.length > 0 &&
              gameStats.playerStats[sortedPlayers[0].id] && (
                <React.Fragment>
                  <Typography variant='subtitle1' style={styles.statSubtitle}>
                    {sortedPlayers[0].name}'s Performance
                  </Typography>

                  <View style={styles.statGrid}>
                    {/* Strikes Statistic */}
                    <View style={styles.statGridItem}>
                      <StatisticCard
                        label='Strikes'
                        value={
                          gameStats.playerStats[sortedPlayers[0].id].strikes
                        }
                        icon='star'
                        accent={true}
                        explanation='A strike occurs when all ten pins are knocked down with the first ball rolled in a frame. A strike is marked as an "X" on the scorecard.'
                      />
                    </View>

                    {/* Spares Statistic */}
                    <View style={styles.statGridItem}>
                      <StatisticCard
                        label='Spares'
                        value={
                          gameStats.playerStats[sortedPlayers[0].id].spares
                        }
                        icon='check-circle'
                        explanation='A spare occurs when all ten pins are knocked down using both balls of a frame. A spare is marked as a "/" on the scorecard.'
                      />
                    </View>

                    {/* Open Frames */}
                    <View style={styles.statGridItem}>
                      <StatisticCard
                        label='Open Frames'
                        value={
                          gameStats.playerStats[sortedPlayers[0].id].openFrames
                        }
                        icon='alert-circle'
                        explanation='An open frame is when a player fails to knock down all ten pins in a frame with their two balls. This means neither a strike nor a spare was achieved in that frame.'
                      />
                    </View>

                    {/* Average Pins Per Roll */}
                    <View style={styles.statGridItem}>
                      <StatisticCard
                        label='Avg. Pins/Roll'
                        value={gameStats.playerStats[
                          sortedPlayers[0].id
                        ].averagePinsPerRoll.toFixed(1)}
                        icon='trending-up'
                        description='Higher is better'
                        explanation='The average number of pins knocked down per roll across all rolls in the game. This measures your overall accuracy and effectiveness.'
                      />
                    </View>
                  </View>
                </React.Fragment>
              )}

            {/* Game Summary */}
            <Typography variant='subtitle1' style={styles.statSubtitle}>
              Game Summary
            </Typography>

            <View style={styles.statGrid}>
              {/* Total Players */}
              <View style={styles.statGridItem}>
                <StatisticCard
                  label='Total Players'
                  value={game?.players.length || 0}
                  icon='users'
                  explanation='The number of players who participated in this game.'
                />
              </View>

              {/* Game Date */}
              <View style={styles.statGridItem}>
                <StatisticCard
                  label='Game Date'
                  value={new Date(
                    game?.date || Date.now()
                  ).toLocaleDateString()}
                  icon='calendar'
                  explanation='The date when this game was played.'
                />
              </View>

              {/* High Score */}
              <View style={styles.statGridItem}>
                <StatisticCard
                  label='High Score'
                  value={sortedPlayers.length > 0 ? sortedPlayers[0].score : 0}
                  icon='award'
                  accent={true}
                  explanation='The highest score achieved by any player in this game. The maximum possible score in bowling is 300 (12 strikes in a row).'
                />
              </View>

              {/* Average Score */}
              <View style={styles.statGridItem}>
                <StatisticCard
                  label='Average Score'
                  value={Math.round(
                    sortedPlayers.reduce((sum, p) => sum + p.score, 0) /
                      (sortedPlayers.length || 1)
                  )}
                  icon='bar-chart'
                  explanation='The average score of all players in this game. A typical league bowler might average around 160-180, while professional bowlers often average over 200.'
                />
              </View>
            </View>
          </StatisticsSection>
        )}

        {/* Placeholder for when no game statistics are available */}
        {!gameStats && (
          <Card style={styles.statsContainer}>
            <Typography variant='h3' style={styles.statsTitle}>
              Game Statistics
            </Typography>
            <Typography variant='body1' color={theme.colors.text.secondary}>
              This section will display detailed game statistics.
            </Typography>
          </Card>
        )}

        <View style={styles.buttonContainer}>
          <Button
            variant='secondary'
            style={[styles.button, { marginRight: 8 }]}
            onPress={handleReturnHome}>
            Return to Home
          </Button>

          <Button
            variant='primary'
            style={styles.button}
            onPress={handleNewGame}>
            New Game
          </Button>
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  title: {
    marginVertical: 16,
  },
  resultsContainer: {
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
  statSubtitle: {
    marginTop: 8,
    marginBottom: 12,
    fontWeight: '600',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statGridItem: {
    width: '50%',
    paddingHorizontal: 6,
  },
});

export default GameSummaryScreen;
