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
import { RootStackParamList } from '../types';
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
  const { players } = route.params;
  const { game, createGame, resetGame, isGameOver } = useGame();
  const { theme } = useTheme();

  // Initialize a new game when component mounts
  useEffect(() => {
    // Always reset and create a fresh game
    resetGame();
    createGame(players);
  }, [players, createGame, resetGame]);

  // Handle navigating to game summary
  const handleEndGame = () => {
    if (game && isGameOver()) {
      navigation.navigate('GameSummary', { players });
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
    navigation.navigate('GameSummary', { players });
  };

  if (!game) {
    return (
      <Container variant='centered'>
        <Typography variant='h3'>Loading game...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Typography variant='h3'>Frame {game.currentFrame + 1}</Typography>
          <Typography variant='body1'>
            {players[game.currentPlayer].name}'s turn
          </Typography>
        </View>

        <Scoreboard game={game} />

        {!game.isComplete && <PinInput game={game} />}

        {game.isComplete ? (
          <Card style={styles.gameCompleteCard}>
            <Typography
              variant='h2'
              align='center'
              color={theme.colors.success}
              style={styles.gameCompleteText}>
              Game Complete!
            </Typography>

            <View style={styles.buttonRow}>
              <Button
                variant='secondary'
                style={[styles.actionButton, { marginRight: 12 }]}
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
          <Button
            variant='secondary'
            style={styles.endGameButton}
            onPress={handleEndGame}>
            End Game
          </Button>
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
    paddingBottom: 24,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  endGameButton: {
    marginTop: 20,
    marginBottom: 16,
  },
  gameCompleteCard: {
    marginTop: 20,
    marginBottom: 16,
    padding: 20,
  },
  gameCompleteText: {
    marginBottom: 20,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
  },
});

export default GameScreen;
