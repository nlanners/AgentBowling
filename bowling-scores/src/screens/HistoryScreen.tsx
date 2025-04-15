import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type HistoryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'History'
>;

// Mock data for history entries
const mockHistoryData = [
  {
    id: '1',
    date: '2025-04-13',
    players: ['Alice', 'Bob'],
    winner: 'Alice',
    highScore: 210,
  },
  {
    id: '2',
    date: '2025-04-10',
    players: ['Charlie', 'Dave', 'Eve'],
    winner: 'Eve',
    highScore: 245,
  },
  {
    id: '3',
    date: '2025-04-06',
    players: ['Frank', 'Grace'],
    winner: 'Frank',
    highScore: 186,
  },
];

const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<HistoryScreenNavigationProp>();

  const renderHistoryItem = ({
    item,
  }: {
    item: (typeof mockHistoryData)[0];
  }) => (
    <TouchableOpacity style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <Text style={styles.dateText}>{item.date}</Text>
        <Text style={styles.scoreText}>{item.highScore}</Text>
      </View>

      <View style={styles.historyDetails}>
        <Text style={styles.playersText}>
          Players: {item.players.join(', ')}
        </Text>
        <Text style={styles.winnerText}>
          Winner: <Text style={styles.winnerName}>{item.winner}</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game History</Text>

      {mockHistoryData.length > 0 ? (
        <FlatList
          data={mockHistoryData}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No game history available</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  historyCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#555',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyDetails: {
    marginTop: 8,
  },
  playersText: {
    fontSize: 14,
    marginBottom: 4,
  },
  winnerText: {
    fontSize: 14,
  },
  winnerName: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HistoryScreen;
