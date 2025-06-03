/**
 * HistoryScreen component
 * Displays a list of past games with the ability to view details
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import {
  FilterOptions,
  DEFAULT_FILTER_OPTIONS,
  SortOption,
} from '../types/history';
import {
  Container,
  Typography,
  Button,
  Card,
  Icon,
  Divider,
  ConfirmDialog,
} from '../components/ui';
import { FilterPanel } from '../components/history';
import { useTheme } from '../contexts/ThemeContext';
import { useHistory } from '../contexts/HistoryContext';

type HistoryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'History'
>;

// History item interface
interface HistoryItem {
  id: string;
  date: string;
  winner: string;
  players: Array<{
    playerId: string;
    playerName: string;
    score: number;
  }>;
  isComplete: boolean;
}

// History item component
const HistoryItem: React.FC<{
  item: HistoryItem;
  onPress: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ item, onPress, onDelete }) => {
  const { theme } = useTheme();

  return (
    <Card
      style={[styles.historyCard, { backgroundColor: theme.colors.surface }]}>
      <TouchableOpacity
        style={styles.historyCardContent}
        onPress={() => onPress(item.id)}>
        <View style={styles.historyCardHeader}>
          <Typography variant='subtitle1' style={styles.historyCardDate}>
            {item.date}
          </Typography>
          <Button
            variant='text'
            style={styles.deleteButton}
            leftIcon='trash'
            onPress={() => onDelete(item.id)}>
            Delete
          </Button>
        </View>

        <View style={styles.historyCardInfo}>
          <View style={styles.winnerContainer}>
            <Typography variant='body2' color={theme.colors.text.secondary}>
              Winner:
            </Typography>
            <Typography variant='body1' style={styles.winnerName}>
              {item.winner}
            </Typography>
          </View>

          <View style={styles.playersList}>
            {item.players.map((player, index) => (
              <View key={player.playerId} style={styles.playerRow}>
                <Typography
                  variant='body2'
                  color={theme.colors.text.secondary}
                  style={styles.playerRank}>
                  {index + 1}.
                </Typography>
                <Typography variant='body2' style={styles.playerName}>
                  {player.playerName}
                </Typography>
                <Typography variant='body2' style={styles.playerScore}>
                  {player.score}
                </Typography>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const { theme } = useTheme();
  const { games, isLoading, deleteGame, clearHistory } = useHistory();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTER_OPTIONS);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>(
    DEFAULT_FILTER_OPTIONS
  );

  // Extract unique players from all games
  const allPlayers = useMemo(() => {
    const uniquePlayers = new Map<string, { id: string; name: string }>();

    games.forEach((game) => {
      game.players.forEach((player) => {
        if (!uniquePlayers.has(player.id)) {
          uniquePlayers.set(player.id, { id: player.id, name: player.name });
        }
      });
    });

    return Array.from(uniquePlayers.values());
  }, [games]);

  // Apply filters to games and format for display
  const filteredAndSortedGames = useMemo(() => {
    // First, filter the games
    let filteredGames = [...games];

    // Filter by date range
    if (activeFilters.dateRange.startDate) {
      filteredGames = filteredGames.filter(
        (game) => new Date(game.date) >= activeFilters.dateRange.startDate!
      );
    }

    if (activeFilters.dateRange.endDate) {
      filteredGames = filteredGames.filter(
        (game) => new Date(game.date) <= activeFilters.dateRange.endDate!
      );
    }

    // Filter by players
    if (activeFilters.playerIds.length > 0) {
      filteredGames = filteredGames.filter((game) =>
        game.players.some((player) =>
          activeFilters.playerIds.includes(player.id)
        )
      );
    }

    // Filter by score range
    if (activeFilters.scoreRange.minScore !== null) {
      filteredGames = filteredGames.filter((game) => {
        const maxPlayerScore = game.scores ? Math.max(...game.scores) : 0;
        return maxPlayerScore >= (activeFilters.scoreRange.minScore || 0);
      });
    }

    if (activeFilters.scoreRange.maxScore !== null) {
      filteredGames = filteredGames.filter((game) => {
        const maxPlayerScore = game.scores ? Math.max(...game.scores) : 0;
        return maxPlayerScore <= (activeFilters.scoreRange.maxScore || 300);
      });
    }

    // Sort the games
    filteredGames.sort((a, b) => {
      switch (activeFilters.sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'score-desc': {
          const aMaxScore = a.scores ? Math.max(...a.scores) : 0;
          const bMaxScore = b.scores ? Math.max(...b.scores) : 0;
          return bMaxScore - aMaxScore;
        }
        case 'score-asc': {
          const aMaxScore = a.scores ? Math.max(...a.scores) : 0;
          const bMaxScore = b.scores ? Math.max(...b.scores) : 0;
          return aMaxScore - bMaxScore;
        }
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    // Format games for display
    return filteredGames.map((game) => {
      // Format date
      const gameDate = new Date(game.date);
      const formattedDate = gameDate.toLocaleDateString();

      // Get winner name if available
      let winnerName = 'No winner';
      if (game.winner) {
        const winner = game.players.find((p) => p.id === game.winner);
        if (winner) {
          winnerName = winner.name;
        }
      }

      // Get scores
      const playerScores = game.players.map((player, index) => {
        const score = game.scores?.[index] ?? 0;
        return { playerId: player.id, playerName: player.name, score };
      });

      // Sort by score descending
      playerScores.sort((a, b) => b.score - a.score);

      return {
        id: game.id,
        date: formattedDate,
        winner: winnerName,
        players: playerScores,
        isComplete: game.completed,
      };
    });
  }, [games, activeFilters]);

  // Handle game selection
  const handleGameSelect = (gameId: string) => {
    navigation.navigate('GameDetails', { gameId });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (selectedGame) {
      await deleteGame(selectedGame);
      setShowDeleteConfirm(false);
      setSelectedGame(null);
    }
  };

  // Handle clear confirmation
  const handleClearConfirm = async () => {
    await clearHistory();
    setShowClearConfirm(false);
  };

  // Handle delete button press
  const handleDeletePress = (gameId: string) => {
    setSelectedGame(gameId);
    setShowDeleteConfirm(true);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  // Apply filters
  const applyFilters = () => {
    setActiveFilters(filters);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters(DEFAULT_FILTER_OPTIONS);
    setActiveFilters(DEFAULT_FILTER_OPTIONS);
  };

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      activeFilters.dateRange.startDate !== null ||
      activeFilters.dateRange.endDate !== null ||
      activeFilters.playerIds.length > 0 ||
      activeFilters.scoreRange.minScore !== null ||
      activeFilters.scoreRange.maxScore !== null ||
      activeFilters.sortBy !== 'date-desc'
    );
  }, [activeFilters]);

  return (
    <Container>
      <View style={styles.header}>
        <Button
          variant='text'
          style={styles.backButton}
          leftIcon='back'
          onPress={() => navigation.navigate('Home')}>
          Home
        </Button>
        <Typography variant='h1' style={styles.title}>
          Game History
        </Typography>
      </View>

      <View style={styles.actions}>
        <Button
          variant='secondary'
          style={styles.filterButton}
          leftIcon={showFilters ? 'filter-off' : 'filter'}
          onPress={() => setShowFilters(!showFilters)}>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {hasActiveFilters && !showFilters && (
            <View
              style={[
                styles.filterBadge,
                { backgroundColor: theme.colors.primary.main },
              ]}>
              <Typography
                variant='caption'
                color={theme.colors.white}
                style={styles.filterBadgeText}>
                !
              </Typography>
            </View>
          )}
        </Button>
        {filteredAndSortedGames.length > 0 && (
          <Button
            variant='text'
            style={styles.clearButton}
            leftIcon='trash'
            onPress={() => setShowClearConfirm(true)}>
            Clear All
          </Button>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Typography variant='body1' color={theme.colors.text.secondary}>
            Loading game history...
          </Typography>
        </View>
      ) : filteredAndSortedGames.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          {showFilters && (
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
              players={allPlayers}
              onApplyFilters={applyFilters}
              onResetFilters={resetFilters}
            />
          )}

          {hasActiveFilters ? (
            <>
              <Icon
                name='filter'
                size='large'
                color={theme.colors.text.disabled}
                style={styles.emptyIcon}
              />
              <Typography variant='h3' color={theme.colors.text.secondary}>
                No Matching Games
              </Typography>
              <Typography
                variant='body1'
                color={theme.colors.text.secondary}
                style={styles.emptyText}>
                No games match your current filters
              </Typography>
              <Button
                variant='primary'
                style={styles.newGameButton}
                onPress={resetFilters}>
                Reset Filters
              </Button>
            </>
          ) : (
            <>
              <Icon
                name='history'
                size='large'
                color={theme.colors.text.disabled}
                style={styles.emptyIcon}
              />
              <Typography variant='h3' color={theme.colors.text.secondary}>
                No Game History
              </Typography>
              <Typography
                variant='body1'
                color={theme.colors.text.secondary}
                style={styles.emptyText}>
                Play some games to see your history
              </Typography>
              <Button
                variant='primary'
                style={styles.newGameButton}
                onPress={() => navigation.navigate('PlayerSetup')}>
                Start New Game
              </Button>
            </>
          )}
        </ScrollView>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {/* Filter panel */}
          {showFilters && (
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
              players={allPlayers}
              onApplyFilters={applyFilters}
              onResetFilters={resetFilters}
            />
          )}

          {/* Results summary */}
          {hasActiveFilters && (
            <View style={styles.resultsSummary}>
              <Typography variant='body2' color={theme.colors.text.secondary}>
                Showing {filteredAndSortedGames.length}{' '}
                {filteredAndSortedGames.length === 1 ? 'game' : 'games'}
                {games.length > filteredAndSortedGames.length
                  ? ` (filtered from ${games.length})`
                  : ''}
              </Typography>
              <Button
                variant='text'
                style={styles.resetFilterButton}
                onPress={resetFilters}>
                Reset
              </Button>
            </View>
          )}

          {/* Game list */}
          {filteredAndSortedGames.map((item) => (
            <HistoryItem
              key={item.id}
              item={item}
              onPress={handleGameSelect}
              onDelete={handleDeletePress}
            />
          ))}
        </ScrollView>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        visible={showDeleteConfirm}
        title='Delete Game'
        message='Are you sure you want to delete this game? This action cannot be undone.'
        confirmLabel='Delete'
        cancelLabel='Cancel'
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Clear history confirmation dialog */}
      <ConfirmDialog
        visible={showClearConfirm}
        title='Clear History'
        message='Are you sure you want to clear all game history? This action cannot be undone.'
        confirmLabel='Clear'
        cancelLabel='Cancel'
        onConfirm={handleClearConfirm}
        onCancel={() => setShowClearConfirm(false)}
      />
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    marginRight: 8,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  clearButton: {
    marginLeft: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  resultsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  resetFilterButton: {
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
  },
  newGameButton: {
    minWidth: 200,
  },
  historyCard: {
    marginBottom: 12,
    overflow: 'hidden',
  },
  historyCardContent: {
    padding: 16,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyCardDate: {
    fontWeight: 'bold',
  },
  deleteButton: {
    marginRight: -8,
  },
  historyCardInfo: {
    marginTop: 8,
  },
  winnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  winnerName: {
    fontWeight: 'bold',
    marginLeft: 8,
  },
  playersList: {
    marginTop: 8,
  },
  playerRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  playerRank: {
    width: 24,
  },
  playerName: {
    flex: 1,
  },
  playerScore: {
    width: 40,
    textAlign: 'right',
    fontWeight: 'bold',
  },
});

export default HistoryScreen;
