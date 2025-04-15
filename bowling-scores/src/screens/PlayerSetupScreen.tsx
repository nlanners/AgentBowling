import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Player } from '../types';

type PlayerSetupScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PlayerSetup'
>;

const PlayerSetupScreen: React.FC = () => {
  const navigation = useNavigation<PlayerSetupScreenNavigationProp>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');

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

    navigation.navigate('Game', { players });
  };

  const renderPlayerItem = ({ item }: { item: Player }) => (
    <View style={styles.playerItem}>
      <Text style={styles.playerName}>{item.name}</Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removePlayer(item.id)}>
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Player Setup</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder='Enter player name'
          value={newPlayerName}
          onChangeText={setNewPlayerName}
        />
        <TouchableOpacity style={styles.addButton} onPress={addPlayer}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={renderPlayerItem}
        style={styles.playerList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No players added yet</Text>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.startButton,
            players.length === 0 && styles.disabledButton,
          ]}
          onPress={startGame}
          disabled={players.length === 0}>
          <Text style={styles.buttonText}>Start Game</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  playerList: {
    flex: 1,
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  playerName: {
    fontSize: 16,
  },
  removeButton: {
    padding: 5,
  },
  removeButtonText: {
    color: '#FF3B30',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#777',
  },
});

export default PlayerSetupScreen;
