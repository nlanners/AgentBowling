import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  Alert,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Player } from '../types';
import { useGame } from '../contexts/GameContext';
import { Container, Typography, Button, Card } from '../components/ui';
import { useTheme } from '../contexts/ThemeContext';

type PlayerSetupScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PlayerSetup'
>;

const PlayerSetupScreen: React.FC = () => {
  const navigation = useNavigation<PlayerSetupScreenNavigationProp>();
  const { resetGame } = useGame();
  const { theme } = useTheme();
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const addPlayer = () => {
    if (!newPlayerName.trim()) {
      Alert.alert('Error', 'Player name cannot be empty');
      return;
    }

    const newPlayer: Player = {
      id: Date.now().toString(),
      name: newPlayerName.trim(),
    };

    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter((player) => player.id !== id));
  };

  const startGame = () => {
    if (players.length === 0) {
      Alert.alert('Error', 'Please add at least one player');
      return;
    }

    // Convert Player[] to PlayerState[] by adding frames and score properties
    const playerStates = players.map((player) => ({
      ...player,
      frames: [],
      score: 0,
    }));

    navigation.navigate('Game', { players: playerStates });
  };

  const renderPlayerItem = ({ item }: { item: Player }) => (
    <Card style={styles.playerItem}>
      <Typography variant='body1'>{item.name}</Typography>
      <Button
        variant='text'
        onPress={() => removePlayer(item.id)}
        style={{ paddingHorizontal: 8 }}>
        <Text style={{ color: theme.colors.error }}>Remove</Text>
      </Button>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Typography variant='h1' align='center' style={styles.title}>
          Player Setup
        </Typography>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder='Enter player name'
            value={newPlayerName}
            onChangeText={setNewPlayerName}
            autoFocus={true}
          />
          <Button
            variant='primary'
            onPress={addPlayer}
            style={styles.addButton}>
            Add
          </Button>
        </View>

        <FlatList
          data={players}
          keyExtractor={(item) => item.id}
          renderItem={renderPlayerItem}
          style={styles.playerList}
          contentContainerStyle={styles.playerListContent}
          ListEmptyComponent={
            <Typography
              variant='body1'
              align='center'
              color={theme.colors.text.secondary}
              style={styles.emptyText}>
              No players added yet
            </Typography>
          }
        />

        <View style={styles.footer}>
          <Button
            variant='secondary'
            onPress={() => navigation.goBack()}
            style={{ marginRight: 10, flex: 1 }}>
            Back
          </Button>

          <Button
            variant='primary'
            onPress={startGame}
            disabled={players.length === 0}
            style={{ flex: 1 }}>
            Start Game
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    marginVertical: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    height: 50, // Match height with buttons
    fontSize: 16,
  },
  addButton: {
    minWidth: 80,
    height: 50,
  },
  playerList: {
    flex: 1,
  },
  playerListContent: {
    paddingBottom: 16,
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  emptyText: {
    marginTop: 40,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 24,
  },
});

export default PlayerSetupScreen;
