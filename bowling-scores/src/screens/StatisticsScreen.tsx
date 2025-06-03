/**
 * StatisticsScreen component
 * Displays player and game statistics with charts and data visualizations
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Game, Player, PlayerStatistics } from '../types';
import {
  Container,
  Typography,
  Button,
  Card,
  Icon,
  Divider,
} from '../components/ui';
import { StatisticCard, StatisticsSection } from '../components/statistics';
import { useTheme } from '../contexts/ThemeContext';
import * as HistoryStorage from '../services/storage/history';
import * as StatisticsStorage from '../services/storage/statistics';

type StatisticsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Statistics'
>;

const StatisticsScreen: React.FC = () => {
  const navigation = useNavigation<StatisticsScreenNavigationProp>();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerStats, setPlayerStats] = useState<Map<string, PlayerStatistics>>(
    new Map()
  );
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  // Load games history and calculate statistics
  const loadStatistics = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load games from storage
      const allGames = await HistoryStorage.getAllGames();
      setGames(allGames);

      // Extract unique players from all games
      const uniquePlayers = new Map<string, Player>();
      allGames.forEach((game) => {
        game.players.forEach((player) => {
          if (!uniquePlayers.has(player.id)) {
            uniquePlayers.set(player.id, player);
          }
        });
      });
      const playerList = Array.from(uniquePlayers.values());
      setPlayers(playerList);

      // Set default selected player if none is selected
      if (playerList.length > 0 && !selectedPlayer) {
        setSelectedPlayer(playerList[0].id);
      }

      // Get cached statistics for all players
      const stats = await StatisticsStorage.getMultiplePlayersStatistics(
        playerList
      );
      setPlayerStats(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPlayer]);

  // Load statistics on component mount
  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  // Format a number with appropriate precision
  const formatNumber = (value: number, precision: number = 1): string => {
    return value.toFixed(precision);
  };

  // Get the currently selected player's statistics
  const getCurrentPlayerStats = (): PlayerStatistics | null => {
    if (!selectedPlayer) return null;
    return playerStats.get(selectedPlayer) || null;
  };

  // Handle player selection
  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayer(playerId);
  };

  // Get the player name from ID
  const getPlayerName = (playerId: string): string => {
    const player = players.find((p) => p.id === playerId);
    return player ? player.name : 'Unknown';
  };

  // Handle refresh button press
  const handleRefresh = async () => {
    if (selectedPlayer) {
      setIsLoading(true);
      try {
        // Invalidate cache for the selected player
        StatisticsStorage.invalidatePlayerStatsCache(selectedPlayer);

        // Reload statistics
        await loadStatistics();
      } catch (error) {
        console.error('Error refreshing statistics:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={theme.colors.primary.main} />
          <Typography
            variant='body1'
            color={theme.colors.text.secondary}
            style={styles.loadingText}>
            Loading statistics...
          </Typography>
        </View>
      </Container>
    );
  }

  // Get current player statistics
  const currentStats = getCurrentPlayerStats();

  return (
    <Container>
      <ScrollView>
        <View style={styles.header}>
          <Button
            variant='text'
            style={styles.backButton}
            leftIcon='back'
            onPress={() => navigation.navigate('Home')}>
            Home
          </Button>
          <Typography variant='h1' style={styles.title}>
            Statistics
          </Typography>
        </View>

        {/* No games message */}
        {games.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Icon
              name='history'
              size='large'
              color={theme.colors.text.disabled}
              style={styles.emptyIcon}
            />
            <Typography
              variant='h3'
              color={theme.colors.text.secondary}
              align='center'>
              No Game Data
            </Typography>
            <Typography
              variant='body1'
              color={theme.colors.text.secondary}
              align='center'
              style={styles.emptyText}>
              Play some games to see your statistics
            </Typography>
            <Button
              variant='primary'
              style={styles.newGameButton}
              onPress={() => navigation.navigate('PlayerSetup')}>
              Start New Game
            </Button>
          </Card>
        ) : (
          <>
            {/* Player selection */}
            <Card style={styles.playerSelectionCard}>
              <View style={styles.playerSelectionHeader}>
                <Typography variant='subtitle1' style={styles.sectionTitle}>
                  Select Player
                </Typography>

                <Button
                  variant='text'
                  leftIcon='refresh'
                  style={styles.refreshButton}
                  onPress={handleRefresh}>
                  Refresh
                </Button>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.playerScroll}>
                <View style={styles.playerButtonContainer}>
                  {players.map((player) => (
                    <Button
                      key={player.id}
                      variant={
                        selectedPlayer === player.id ? 'primary' : 'secondary'
                      }
                      style={styles.playerButton}
                      onPress={() => handlePlayerSelect(player.id)}>
                      {player.name}
                    </Button>
                  ))}
                </View>
              </ScrollView>
            </Card>

            {/* Player summary statistics */}
            {currentStats && (
              <>
                <Typography variant='h2' style={styles.sectionHeader}>
                  {getPlayerName(currentStats.playerId)}'s Statistics
                </Typography>

                <StatisticsSection
                  title='Performance Summary'
                  description='Overall performance metrics'>
                  <View style={styles.statGrid}>
                    <View style={styles.statGridItem}>
                      <StatisticCard
                        label='Average Score'
                        value={formatNumber(currentStats.basic.averageScore)}
                        icon='bar-chart'
                        accent={true}
                        explanation='Your average score across all games. A higher average indicates better overall performance.'
                      />
                    </View>

                    <View style={styles.statGridItem}>
                      <StatisticCard
                        label='High Score'
                        value={currentStats.basic.highScore}
                        icon='award'
                        explanation='The highest score you have achieved in any game.'
                      />
                    </View>

                    <View style={styles.statGridItem}>
                      <StatisticCard
                        label='Strike %'
                        value={`${formatNumber(
                          currentStats.frames.strikePercentage
                        )}%`}
                        icon='star'
                        explanation='The percentage of frames where you achieved a strike. This indicates your ability to knock down all pins on the first roll.'
                      />
                    </View>

                    <View style={styles.statGridItem}>
                      <StatisticCard
                        label='Spare %'
                        value={`${formatNumber(
                          currentStats.frames.sparePercentage
                        )}%`}
                        icon='check-circle'
                        explanation='The percentage of frames where you achieved a spare. This indicates your ability to convert remaining pins on the second roll.'
                      />
                    </View>
                  </View>
                </StatisticsSection>

                {/* Game history summary */}
                <StatisticsSection
                  title='Game History'
                  description='Summary of your bowling history'>
                  <View style={styles.statGrid}>
                    <View style={styles.statGridItem}>
                      <StatisticCard
                        label='Games Played'
                        value={currentStats.basic.gamesPlayed}
                        icon='history'
                        explanation='The total number of games you have played.'
                      />
                    </View>

                    <View style={styles.statGridItem}>
                      <StatisticCard
                        label='Total Strikes'
                        value={currentStats.basic.strikeCount}
                        icon='star'
                        explanation='The total number of strikes you have thrown across all games.'
                      />
                    </View>

                    <View style={styles.statGridItem}>
                      <StatisticCard
                        label='Total Spares'
                        value={currentStats.basic.spareCount}
                        icon='check-circle'
                        explanation='The total number of spares you have converted across all games.'
                      />
                    </View>

                    <View style={styles.statGridItem}>
                      <StatisticCard
                        label='Low Score'
                        value={currentStats.basic.lowScore}
                        icon='alert-circle'
                        explanation='The lowest score you have recorded in any game.'
                      />
                    </View>
                  </View>
                </StatisticsSection>

                {/* Frame performance */}
                <StatisticsSection
                  title='Frame Performance'
                  description='How you perform in different frames'>
                  <Card style={styles.framePerformanceCard}>
                    <Typography
                      variant='body2'
                      color={theme.colors.text.secondary}>
                      Frame-by-frame statistics will be available in a future
                      update.
                    </Typography>
                  </Card>
                </StatisticsSection>
              </>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                variant='secondary'
                style={styles.actionButton}
                onPress={() => navigation.navigate('History')}>
                View Game History
              </Button>
            </View>
          </>
        )}
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  title: {
    marginVertical: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginLeft: -8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    marginTop: 8,
    marginBottom: 24,
  },
  newGameButton: {
    minWidth: 200,
  },
  playerSelectionCard: {
    padding: 16,
    marginBottom: 16,
  },
  playerSelectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  refreshButton: {
    marginRight: -8,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  playerScroll: {
    flexGrow: 0,
    marginBottom: 8,
  },
  playerButtonContainer: {
    flexDirection: 'row',
    paddingRight: 8,
  },
  playerButton: {
    marginRight: 8,
    minWidth: 100,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 16,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statGridItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  framePerformanceCard: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  actions: {
    marginTop: 24,
    marginBottom: 24,
  },
  actionButton: {
    width: '100%',
  },
});

export default StatisticsScreen;
