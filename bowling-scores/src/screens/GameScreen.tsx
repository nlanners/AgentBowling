import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Scoreboard } from '../components/scoreboard';
import { PinInput } from '../components/game';
import { Container, Typography, Button } from '../components/ui';
import { useGame } from '../contexts/GameContext';

type GameScreenRouteProp = RouteProp<RootStackParamList, 'Game'>;
type GameScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Game'
>;

const GameScreen: React.FC = () => {
  const navigation = useNavigation<GameScreenNavigationProp>();
  const route = useRoute<GameScreenRouteProp>();
  const { players } = route.params;
  const { game, createGame, isGameOver } = useGame();

  // Initialize game if not already created
  useEffect(() => {
    if (!game) {
      createGame(players);
    }
  }, [game, players, createGame]);

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

  if (!game) {
    return (
      <Container variant='centered'>
        <Typography variant='h3'>Loading game...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <View style={styles.header}>
        <Typography variant='h3'>Frame {game.currentFrame + 1}</Typography>
        <Typography variant='body1'>
          {players[game.currentPlayer].name}'s turn
        </Typography>
      </View>

      <Scoreboard game={game} />
      <PinInput game={game} />

      <Button
        variant='secondary'
        style={styles.endGameButton}
        onPress={handleEndGame}>
        {game.isComplete ? 'View Summary' : 'End Game'}
      </Button>
    </Container>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  endGameButton: {
    marginTop: 'auto',
    marginBottom: 16,
  },
});

export default GameScreen;
