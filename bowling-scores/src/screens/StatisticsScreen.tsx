/**
 * StatisticsScreen component
 * Displays player and game statistics with charts and data visualizations
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  RootStackParamList,
  Game,
  Player,
  PlayerStatistics,
  FrameNumber,
} from '../types';
import {
  Container,
  Typography,
  Button,
  Card,
  Icon,
  Divider,
} from '../components/ui';
import { StatisticCard, StatisticsSection } from '../components/statistics';
import {
  ScoreTrendChart,
  FramePerformanceChart,
  PinDistributionChart,
} from '../components/charts';
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

  // Frame numbers for rendering frame performance section
  const frameNumbers: FrameNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

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
                  {currentStats.basic.gamesPlayed > 0 ? (
                    <>
                      <Typography
                        variant='subtitle2'
                        style={styles.framePerformanceTitle}>
                        Frame-by-Frame Analysis
                      </Typography>

                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={true}>
                        <View style={styles.framePerformanceTable}>
                          {/* Table headers */}
                          <View style={styles.frameHeaderRow}>
                            <View style={styles.frameHeaderCell}>
                              <Typography
                                variant='caption'
                                color={theme.colors.text.secondary}>
                                Frame
                              </Typography>
                            </View>
                            <View style={styles.frameHeaderCell}>
                              <Typography
                                variant='caption'
                                color={theme.colors.text.secondary}>
                                Avg. Score
                              </Typography>
                            </View>
                            <View style={styles.frameHeaderCell}>
                              <Typography
                                variant='caption'
                                color={theme.colors.text.secondary}>
                                Strike %
                              </Typography>
                            </View>
                            <View style={styles.frameHeaderCell}>
                              <Typography
                                variant='caption'
                                color={theme.colors.text.secondary}>
                                Spare %
                              </Typography>
                            </View>
                          </View>

                          {/* Table rows */}
                          {frameNumbers.map((frameNumber) => {
                            const framePerf =
                              currentStats.frames.framePerformance[frameNumber];
                            if (!framePerf) return null;

                            return (
                              <View
                                key={frameNumber}
                                style={styles.frameDataRow}>
                                <View style={styles.frameDataCell}>
                                  <Typography
                                    variant='body2'
                                    style={styles.frameCellText}>
                                    {frameNumber}
                                  </Typography>
                                </View>
                                <View style={styles.frameDataCell}>
                                  <Typography
                                    variant='body2'
                                    style={styles.frameCellText}>
                                    {formatNumber(framePerf.averageScore)}
                                  </Typography>
                                </View>
                                <View style={styles.frameDataCell}>
                                  <Typography
                                    variant='body2'
                                    style={[
                                      styles.frameCellText,
                                      framePerf.strikePercentage > 50
                                        ? styles.highlightText
                                        : null,
                                    ]}>
                                    {formatNumber(framePerf.strikePercentage)}%
                                  </Typography>
                                </View>
                                <View style={styles.frameDataCell}>
                                  <Typography
                                    variant='body2'
                                    style={[
                                      styles.frameCellText,
                                      framePerf.sparePercentage > 50
                                        ? styles.highlightText
                                        : null,
                                    ]}>
                                    {formatNumber(framePerf.sparePercentage)}%
                                  </Typography>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      </ScrollView>

                      <View style={styles.rollStatsContainer}>
                        <Typography
                          variant='subtitle2'
                          style={styles.framePerformanceTitle}>
                          Roll Statistics
                        </Typography>

                        <View style={styles.statGrid}>
                          <View style={styles.statGridItem}>
                            <StatisticCard
                              label='First Roll Avg'
                              value={formatNumber(
                                currentStats.rolls.firstRollAverage
                              )}
                              icon='trending-up'
                              explanation='Average pins knocked down on your first roll.'
                            />
                          </View>
                          <View style={styles.statGridItem}>
                            <StatisticCard
                              label='Second Roll Avg'
                              value={formatNumber(
                                currentStats.rolls.secondRollAverage
                              )}
                              icon='trending-up'
                              explanation='Average pins knocked down on your second roll.'
                            />
                          </View>
                        </View>
                      </View>

                      <View style={styles.trendStatsContainer}>
                        <Typography
                          variant='subtitle2'
                          style={styles.framePerformanceTitle}>
                          Trend Analysis
                        </Typography>

                        <View style={styles.statGrid}>
                          <View style={styles.statGridItem}>
                            <StatisticCard
                              label='Recent Trend'
                              value={
                                currentStats.trends.recentTrend > 0
                                  ? `+${formatNumber(
                                      currentStats.trends.recentTrend
                                    )}`
                                  : formatNumber(
                                      currentStats.trends.recentTrend
                                    )
                              }
                              icon='trending-up'
                              accent={currentStats.trends.recentTrend > 0}
                              explanation='Indicates if your scores are improving (positive) or declining (negative) recently.'
                            />
                          </View>
                          <View style={styles.statGridItem}>
                            <StatisticCard
                              label='Consistency'
                              value={formatNumber(
                                currentStats.trends.consistencyScore
                              )}
                              icon='activity'
                              explanation='A lower score indicates more consistent performance across games.'
                            />
                          </View>
                          <View style={styles.statGridItem}>
                            <StatisticCard
                              label='Last 5 Games Avg'
                              value={formatNumber(
                                currentStats.trends.last5GamesAverage
                              )}
                              icon='bar-chart'
                              explanation='Your average score across your 5 most recent games.'
                            />
                          </View>
                          <View style={styles.statGridItem}>
                            <StatisticCard
                              label='Overall Improvement'
                              value={
                                currentStats.trends.scoreImprovement > 0
                                  ? `+${formatNumber(
                                      currentStats.trends.scoreImprovement
                                    )}`
                                  : formatNumber(
                                      currentStats.trends.scoreImprovement
                                    )
                              }
                              icon='arrow-up-right'
                              accent={currentStats.trends.scoreImprovement > 0}
                              explanation='The difference between your average scores in the first half of your games versus the second half.'
                            />
                          </View>
                        </View>
                      </View>
                    </>
                  ) : (
                    <Card style={styles.framePerformanceCard}>
                      <Typography
                        variant='body2'
                        color={theme.colors.text.secondary}>
                        Play more games to see detailed frame-by-frame
                        statistics.
                      </Typography>
                    </Card>
                  )}
                </StatisticsSection>

                {/* Visual Charts Section */}
                {currentStats.basic.gamesPlayed > 0 && (
                  <>
                    <StatisticsSection
                      title='Score Trends'
                      description='Visual representation of your scoring performance over time'>
                      <ScoreTrendChart
                        games={games}
                        playerId={selectedPlayer!}
                        title='Score Progression'
                      />
                    </StatisticsSection>

                    <StatisticsSection
                      title='Frame Performance Analysis'
                      description='Strike and spare percentages by frame position'>
                      <FramePerformanceChart
                        framePerformance={currentStats.frames.framePerformance}
                        title='Strike & Spare Rates by Frame'
                        showStrikes={true}
                        showSpares={true}
                      />
                    </StatisticsSection>

                    <StatisticsSection
                      title='Pin Distribution'
                      description='Distribution of pins knocked down per roll'>
                      <PinDistributionChart
                        pinDistribution={currentStats.rolls.pinsDistribution}
                        title='Pin Count Distribution'
                      />
                    </StatisticsSection>
                  </>
                )}
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
  framePerformanceTitle: {
    marginTop: 16,
    marginBottom: 12,
  },
  framePerformanceTable: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  frameHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  frameHeaderCell: {
    width: 100,
    padding: 10,
    alignItems: 'center',
  },
  frameDataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  frameDataCell: {
    width: 100,
    padding: 10,
    alignItems: 'center',
  },
  frameCellText: {
    textAlign: 'center',
  },
  highlightText: {
    fontWeight: 'bold',
    color: '#4caf50',
  },
  rollStatsContainer: {
    marginTop: 8,
  },
  trendStatsContainer: {
    marginTop: 16,
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
