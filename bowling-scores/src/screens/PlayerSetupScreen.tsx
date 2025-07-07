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
      <Typography variant='body1' style={styles.playerName}>
        {item.name}
      </Typography>
      <Button
        variant='text'
        onPress={() => removePlayer(item.id)}
        style={styles.removeButton}>
        <Text style={{ color: theme.colors.error }}>Remove</Text>
      </Button>
    </Card>
  );

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.colors.background.default },
      ]}>
      <Container variant='screen'>
        <View style={styles.header}>
          <Typography variant='h1' style={styles.title}>
            Player Setup
          </Typography>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.colors.gray[300],
                  backgroundColor: theme.colors.background.paper,
                  color: theme.colors.text.primary,
                },
              ]}
              placeholder='Enter player name'
              placeholderTextColor={theme.colors.text.secondary}
              value={newPlayerName}
              onChangeText={setNewPlayerName}
              autoFocus={true}
            />
            <Button
              variant='primary'
              onPress={addPlayer}
              style={styles.addButton}>
              Add Player
            </Button>
          </View>
        </View>

        <View style={styles.playersSection}>
          <Typography variant='h3' style={styles.sectionTitle}>
            Players ({players.length})
          </Typography>

          <FlatList
            data={players}
            keyExtractor={(item) => item.id}
            renderItem={renderPlayerItem}
            style={styles.playerList}
            contentContainerStyle={styles.playerListContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Typography
                  variant='body1'
                  color={theme.colors.text.secondary}
                  style={styles.emptyText}>
                  No players added yet
                </Typography>
              </View>
            }
          />
        </View>

        <View style={styles.footer}>
          <Button
            variant='secondary'
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            Back
          </Button>

          <Button
            variant='primary'
            onPress={startGame}
            disabled={players.length === 0}
            style={styles.startButton}>
            Start Game
          </Button>
        </View>
      </Container>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40, // More breathing room
    paddingHorizontal: 16, // Ensure content doesn't touch edges
  },
  title: {
    textAlign: 'center',
    marginBottom: 0,
  },
  inputSection: {
    marginBottom: 40, // More breathing room
    paddingHorizontal: 4, // Slight padding for better visual separation
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 16, // Better gap between elements
    alignItems: 'center',
    marginHorizontal: 4, // Slight margin for better separation
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 20, // More generous horizontal padding
    paddingVertical: 14, // Better vertical padding
    height: 52, // Slightly taller for better touch target
    fontSize: 16,
    marginHorizontal: 2, // Slight margin for separation
  },
  addButton: {
    minWidth: 120,
    height: 52, // Match input height
    marginVertical: 0,
  },
  playersSection: {
    flex: 1,
    marginBottom: 32, // Better separation from footer
    paddingHorizontal: 4, // Slight padding for visual separation
  },
  sectionTitle: {
    marginBottom: 20, // More breathing room
    marginLeft: 4, // Slight alignment with list items
  },
  playerList: {
    flex: 1,
  },
  playerListContent: {
    gap: 16, // Better gap between list items
    paddingHorizontal: 4, // Ensure list items don't touch edges
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20, // More generous horizontal padding
    paddingVertical: 18, // Better vertical padding
    marginVertical: 0,
    marginHorizontal: 4, // Slight horizontal margin for separation
    minHeight: 60, // Better touch target
  },
  playerName: {
    flex: 1,
    marginRight: 16, // Space between name and button
  },
  removeButton: {
    paddingHorizontal: 12, // Better horizontal padding
    paddingVertical: 8, // Better vertical padding
    marginVertical: 0,
    minHeight: 44, // Better touch target
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64, // More breathing room
    paddingHorizontal: 24, // Ensure text doesn't touch edges
  },
  emptyText: {
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 20, // Better gap between buttons
    paddingTop: 24, // More separation from content
    paddingHorizontal: 8, // Ensure buttons don't touch edges
  },
  backButton: {
    flex: 1,
    marginVertical: 0,
  },
  startButton: {
    flex: 1,
    marginVertical: 0,
  },
});

export default PlayerSetupScreen;
