/**
 * GameDetailsScreen component
 * Shows detailed information about a completed game
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Game, Frame } from '../types';
import {
  Container,
  Typography,
  Button,
  Card,
  Icon,
  Divider,
} from '../components/ui';
import { useTheme } from '../contexts/ThemeContext';
import { calculateGameStatistics } from '../utils/statistics';
import { useHistory } from '../contexts/HistoryContext';

type GameDetailsScreenRouteProp = RouteProp<RootStackParamList, 'GameDetails'>;
type GameDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'GameDetails'
>;

interface GameDetailsScreenProps {
  route: GameDetailsScreenRouteProp;
  navigation: GameDetailsScreenNavigationProp;
}

const GameDetailsScreen: React.FC<GameDetailsScreenProps> = ({
  route,
  navigation,
}) => {
  const { theme } = useTheme();
  const { gameId } = route.params;
  const { getGameById } = useHistory();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get game data
  const game = getGameById(gameId);

  // Calculate game statistics when game data changes
  const gameStats = useMemo(() => {
    if (!game) return null;
    return calculateGameStatistics(game);
  }, [game]);

  // Set loading state
  useEffect(() => {
    if (game) {
      setIsLoading(false);
    } else {
      setError('Game not found');
      setIsLoading(false);
    }
  }, [game]);

  // Format date
  const formattedDate = useMemo(() => {
    if (!game) return '';
    return new Date(game.date).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [game]);

  // Get winner name
  const winnerName = useMemo(() => {
    if (!game || !game.winner) return 'No winner';
    const winner = game.players.find((p) => p.id === game.winner);
    return winner ? winner.name : 'Unknown';
  }, [game]);

  // Render a player's frames
  const renderPlayerFrames = (frames: Frame[], index: number) => {
    return (
      <View style={styles.framesContainer}>
        {frames.map((frame, frameIndex) => (
          <View key={frameIndex} style={styles.frameCell}>
            <View style={styles.frameHeader}>
              <Typography variant='caption' style={styles.frameNumber}>
                {frameIndex + 1}
              </Typography>
            </View>
            <View style={styles.frameContent}>
              <View style={styles.frameScores}>
                {frame.rolls.map((roll, rollIndex) => {
                  // Handle case where roll might be a number or an object with pinsKnocked
                  const pins =
                    typeof roll === 'object' && roll.pinsKnocked !== undefined
                      ? roll.pinsKnocked
                      : roll;

                  return (
                    <Typography
                      key={rollIndex}
                      variant='body2'
                      style={styles.rollScore}>
                      {pins === 10
                        ? 'X'
                        : frame.isSpare && rollIndex === 1
                        ? '/'
                        : pins.toString()}
                    </Typography>
                  );
                })}
              </View>
              <Typography variant='body1' style={styles.frameScore}>
                {frame.score}
              </Typography>
            </View>
          </View>
        ))}
      </View>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={theme.colors.primary.main} />
          <Typography
            variant='body1'
            color={theme.colors.text.secondary}
            style={styles.loadingText}>
            Loading game details...
          </Typography>
        </View>
      </Container>
    );
  }

  // Error state
  if (error || !game) {
    return (
      <Container>
        <View style={styles.header}>
          <Button
            variant='text'
            style={styles.backButton}
            leftIcon='back'
            onPress={() => navigation.goBack()}>
            Back
          </Button>
          <Typography variant='h1' style={styles.title}>
            Game Details
          </Typography>
        </View>
        <View style={styles.errorContainer}>
          <Icon
            name='alert-circle'
            size='large'
            color={theme.colors.error}
            style={styles.errorIcon}
          />
          <Typography
            variant='h3'
            color={theme.colors.text.secondary}
            align='center'>
            {error || 'Game not found'}
          </Typography>
          <Typography
            variant='body1'
            color={theme.colors.text.secondary}
            align='center'
            style={styles.errorText}>
            The requested game could not be loaded
          </Typography>
          <Button
            variant='primary'
            style={styles.backToHistoryButton}
            onPress={() => navigation.navigate('History')}>
            Back to History
          </Button>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <ScrollView>
        <View style={styles.header}>
          <Button
            variant='text'
            style={styles.backButton}
            leftIcon='back'
            onPress={() => navigation.goBack()}>
            Back
          </Button>
          <Typography variant='h1' style={styles.title}>
            Game Details
          </Typography>
        </View>

        {/* Game summary */}
        <Card style={styles.summaryCard}>
          <Typography variant='subtitle1' style={styles.sectionTitle}>
            Game Summary
          </Typography>
          <Typography variant='body2' color={theme.colors.text.secondary}>
            {formattedDate}
          </Typography>

          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Typography variant='body2' color={theme.colors.text.secondary}>
                Winner
              </Typography>
              <Typography variant='body1' style={styles.statValue}>
                {winnerName}
              </Typography>
            </View>

            <View style={styles.summaryStat}>
              <Typography variant='body2' color={theme.colors.text.secondary}>
                Players
              </Typography>
              <Typography variant='body1' style={styles.statValue}>
                {game.players.length}
              </Typography>
            </View>

            <View style={styles.summaryStat}>
              <Typography variant='body2' color={theme.colors.text.secondary}>
                Top Score
              </Typography>
              <Typography variant='body1' style={styles.statValue}>
                {gameStats?.highScore || 0}
              </Typography>
            </View>
          </View>
        </Card>

        {/* Player scores */}
        <Typography variant='h2' style={styles.sectionHeader}>
          Player Scores
        </Typography>

        {game.players.map((player, index) => (
          <Card key={player.id} style={styles.playerCard}>
            <View style={styles.playerCardHeader}>
              <Typography variant='subtitle1' style={styles.playerName}>
                {player.name}
              </Typography>
              <Typography variant='subtitle1' style={styles.playerScore}>
                {game.scores?.[index] || 0}
              </Typography>
            </View>

            <Divider style={styles.divider} />

            {game.frames && game.frames[index] ? (
              renderPlayerFrames(game.frames[index], index)
            ) : (
              <Typography
                variant='body2'
                color={theme.colors.text.secondary}
                style={styles.noFramesText}>
                No frame details available
              </Typography>
            )}
          </Card>
        ))}

        {/* Game statistics */}
        <Typography variant='h2' style={styles.sectionHeader}>
          Game Statistics
        </Typography>

        <Card style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Typography variant='body2' color={theme.colors.text.secondary}>
                Total Strikes
              </Typography>
              <Typography variant='body1' style={styles.statItemValue}>
                {gameStats?.totalStrikes || 0}
              </Typography>
            </View>

            <View style={styles.statItem}>
              <Typography variant='body2' color={theme.colors.text.secondary}>
                Total Spares
              </Typography>
              <Typography variant='body1' style={styles.statItemValue}>
                {gameStats?.totalSpares || 0}
              </Typography>
            </View>

            <View style={styles.statItem}>
              <Typography variant='body2' color={theme.colors.text.secondary}>
                Average Score
              </Typography>
              <Typography variant='body1' style={styles.statItemValue}>
                {typeof gameStats?.averageScore === 'number'
                  ? gameStats.averageScore.toFixed(1)
                  : '0.0'}
              </Typography>
            </View>

            <View style={styles.statItem}>
              <Typography variant='body2' color={theme.colors.text.secondary}>
                Strike %
              </Typography>
              <Typography variant='body1' style={styles.statItemValue}>
                {typeof gameStats?.strikePercentage === 'number'
                  ? gameStats.strikePercentage.toFixed(1)
                  : '0.0'}
                %
              </Typography>
            </View>

            <View style={styles.statItem}>
              <Typography variant='body2' color={theme.colors.text.secondary}>
                Spare %
              </Typography>
              <Typography variant='body1' style={styles.statItemValue}>
                {typeof gameStats?.sparePercentage === 'number'
                  ? gameStats.sparePercentage.toFixed(1)
                  : '0.0'}
                %
              </Typography>
            </View>

            <View style={styles.statItem}>
              <Typography variant='body2' color={theme.colors.text.secondary}>
                Open Frames
              </Typography>
              <Typography variant='body1' style={styles.statItemValue}>
                {gameStats?.openFrames || 0}
              </Typography>
            </View>
          </View>
        </Card>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorText: {
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
  },
  backToHistoryButton: {
    minWidth: 200,
  },
  summaryCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  summaryStats: {
    flexDirection: 'row',
    marginTop: 16,
  },
  summaryStat: {
    flex: 1,
  },
  statValue: {
    fontWeight: 'bold',
    marginTop: 4,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 16,
  },
  playerCard: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  playerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  playerName: {
    fontWeight: 'bold',
  },
  playerScore: {
    fontWeight: 'bold',
  },
  divider: {
    marginHorizontal: 0,
  },
  framesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  frameCell: {
    width: '20%',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  frameHeader: {
    backgroundColor: '#f0f0f0',
    padding: 4,
    alignItems: 'center',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  frameNumber: {
    fontWeight: 'bold',
  },
  frameContent: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderTopWidth: 0,
    padding: 4,
    alignItems: 'center',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  frameScores: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 4,
  },
  rollScore: {
    paddingHorizontal: 4,
  },
  frameScore: {
    fontWeight: 'bold',
  },
  noFramesText: {
    padding: 16,
    textAlign: 'center',
  },
  statsCard: {
    padding: 16,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  statItemValue: {
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export default GameDetailsScreen;
