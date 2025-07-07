import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Player } from '../types';
import { Scoreboard } from '../components/scoreboard';
import { PinInput } from '../components/game';
import { Container, Typography, Button, Card } from '../components/ui';
import { useGame } from '../contexts/GameContext';
import { useTheme } from '../contexts/ThemeContext';

type GameScreenRouteProp = RouteProp<RootStackParamList, 'Game'>;
type GameScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Game'
>;

const GameScreen: React.FC = () => {
  const navigation = useNavigation<GameScreenNavigationProp>();
  const route = useRoute<GameScreenRouteProp>();
  const { players = [] } = route.params;
  const { game, createGame, resetGame, isGameOver } = useGame();
  const { theme } = useTheme();

  // Initialize a new game when component mounts
  useEffect(() => {
    if (players.length > 0) {
      // Always reset and create a fresh game
      resetGame();
      // Convert PlayerState to Player objects before creating the game
      const playerObjects: Player[] = players.map((player) => ({
        id: player.id,
        name: player.name,
        isActive: player.isActive,
      }));
      createGame(playerObjects);
    }
  }, [players, createGame, resetGame]);

  // Handle navigating to game summary
  const handleEndGame = () => {
    if (game && isGameOver()) {
      // Ensure players is not undefined before navigating
      if (game.players) {
        // Convert Players to PlayerState objects
        const playerStates = game.players.map((player) => ({
          ...player,
          frames: player.frames || [],
          score: typeof player.score === 'number' ? player.score : 0,
        }));

        navigation.navigate('GameSummary', { players: playerStates });
      }
    } else {
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
    }
  };

  // Handle navigating to home screen
  const handleReturnHome = () => {
    navigation.navigate('Home');
  };

  // Handle viewing game summary
  const handleViewSummary = () => {
    // Ensure players is not undefined before navigating
    if (game && game.players) {
      // Convert Players to PlayerState objects
      const playerStates = game.players.map((player) => ({
        ...player,
        frames: player.frames || [],
        score: typeof player.score === 'number' ? player.score : 0,
      }));

      navigation.navigate('GameSummary', { players: playerStates });
    }
  };

  if (!game) {
    return (
      <Container variant='screenCentered'>
        <Typography variant='h3'>Loading game...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Typography variant='h2' style={styles.frameTitle}>
            Frame {game.currentFrame + 1}
          </Typography>
          <Typography
            variant='h4'
            color={theme.colors.text.secondary}
            style={styles.playerTurn}>
            {game.players[game.currentPlayer].name}'s turn
          </Typography>
        </View>

        <View style={styles.scoreboardContainer}>
          <Scoreboard game={game} />
        </View>

        {!game.isComplete && (
          <View style={styles.pinInputContainer}>
            <PinInput game={game} />
          </View>
        )}

        {game.isComplete ? (
          <Card style={styles.gameCompleteCard}>
            <Typography
              variant='h2'
              color={theme.colors.success}
              style={styles.gameCompleteText}>
              🎉 Game Complete!
            </Typography>

            <View style={styles.buttonRow}>
              <Button
                variant='secondary'
                style={styles.actionButton}
                onPress={handleReturnHome}>
                Return Home
              </Button>

              <Button
                variant='primary'
                style={styles.actionButton}
                onPress={handleViewSummary}>
                View Summary
              </Button>
            </View>
          </Card>
        ) : (
          <View style={styles.endGameContainer}>
            <Button
              variant='outline'
              style={styles.endGameButton}
              onPress={handleEndGame}>
              End Game
            </Button>
          </View>
        )}
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20, // Better separation from viewport edges
    paddingBottom: 40, // More bottom padding for better scrolling
  },
  header: {
    alignItems: 'center',
    marginBottom: 32, // More breathing room
    paddingVertical: 20, // Better vertical padding
    paddingHorizontal: 16, // Ensure content doesn't touch edges
  },
  frameTitle: {
    textAlign: 'center',
    marginBottom: 12, // Better separation
  },
  playerTurn: {
    textAlign: 'center',
    marginBottom: 0,
  },
  scoreboardContainer: {
    marginBottom: 32, // More breathing room
    paddingHorizontal: 4, // Slight padding for visual separation
  },
  pinInputContainer: {
    marginBottom: 32, // More breathing room
    paddingHorizontal: 4, // Slight padding for visual separation
  },
  endGameContainer: {
    alignItems: 'center',
    paddingTop: 24, // More breathing room
    paddingHorizontal: 16, // Ensure button doesn't touch edges
  },
  endGameButton: {
    minWidth: 200,
    marginVertical: 0,
  },
  gameCompleteCard: {
    marginTop: 16, // Better separation from content above
    padding: 32, // More generous padding
    alignItems: 'center',
    marginVertical: 0,
    marginHorizontal: 8, // Slight horizontal margin
  },
  gameCompleteText: {
    textAlign: 'center',
    marginBottom: 32, // More breathing room
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 20, // Better gap between buttons
    paddingHorizontal: 8, // Ensure buttons don't touch card edges
  },
  actionButton: {
    flex: 1,
    marginVertical: 0,
  },
});

export default GameScreen;
