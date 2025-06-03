/**
 * History context for the bowling score app
 * Provides game history management throughout the application
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { Game } from '../types';
import { MMKV } from 'react-native-mmkv';
import * as StatisticsStorage from '../services/storage/statistics';
import * as HistoryStorage from '../services/storage/history';

// Player statistics interface
interface PlayerStatistics {
  totalGames: number;
  highScore: number;
  averageScore: number;
  strikePercentage: number;
  sparePercentage: number;
  recentScores: number[];
}

// History context state interface
interface HistoryContextState {
  games: Game[];
  isLoading: boolean;
  error: string | null;
}

// History context interface
interface HistoryContextType extends HistoryContextState {
  addGame: (game: Game) => Promise<void>;
  updateGame: (game: Game) => Promise<void>;
  deleteGame: (gameId: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  getGameById: (gameId: string) => Game | undefined;
  getPlayerGames: (playerId: string) => Game[];
  getPlayerStatistics: (playerId: string) => PlayerStatistics;
}

// Create context with default undefined value
const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

// History provider component
export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load games from storage on component mount
  useEffect(() => {
    const loadGames = async () => {
      setIsLoading(true);
      try {
        const allGames = await HistoryStorage.getAllGames();
        setGames(allGames);
      } catch (error) {
        console.error('Error loading game history:', error);
        setError('Failed to load game history');
      } finally {
        setIsLoading(false);
      }
    };

    loadGames();
  }, []);

  /**
   * Add a game to history
   */
  const addGame = async (game: Game): Promise<void> => {
    try {
      await HistoryStorage.addGame(game);
      setGames((prevGames) => [...prevGames, game]);

      // Invalidate statistics cache for players in the game
      await StatisticsStorage.updateStatisticsAfterGameChange(game);
    } catch (error) {
      console.error('Error adding game to history:', error);
      setError('Failed to add game to history');
    }
  };

  /**
   * Update an existing game
   */
  const updateGame = async (game: Game): Promise<void> => {
    try {
      await HistoryStorage.updateGame(game);
      setGames((prevGames) =>
        prevGames.map((g) => (g.id === game.id ? game : g))
      );

      // Invalidate statistics cache for players in the game
      await StatisticsStorage.updateStatisticsAfterGameChange(game);
    } catch (error) {
      console.error('Error updating game in history:', error);
      setError('Failed to update game');
    }
  };

  /**
   * Delete a game from history
   */
  const deleteGame = async (gameId: string): Promise<void> => {
    try {
      const gameToDelete = games.find((game) => game.id === gameId);

      await HistoryStorage.deleteGame(gameId);
      setGames((prevGames) => prevGames.filter((g) => g.id !== gameId));

      // Invalidate statistics cache if game was found
      if (gameToDelete) {
        await StatisticsStorage.updateStatisticsAfterGameChange(gameToDelete);
      }
    } catch (error) {
      console.error('Error deleting game from history:', error);
      setError('Failed to delete game');
    }
  };

  /**
   * Clear all game history
   */
  const clearHistory = async (): Promise<void> => {
    try {
      await HistoryStorage.clearAllGames();
      setGames([]);

      // Clear all statistics cache
      StatisticsStorage.clearAllStatistics();
    } catch (error) {
      console.error('Error clearing game history:', error);
      setError('Failed to clear history');
    }
  };

  /**
   * Get a game by ID
   */
  const getGameById = useCallback(
    (gameId: string): Game | undefined => {
      return games.find((game) => game.id === gameId);
    },
    [games]
  );

  /**
   * Get games for a specific player
   */
  const getPlayerGames = useCallback(
    (playerId: string): Game[] => {
      return games.filter((game) =>
        game.players.some((player) => player.id === playerId)
      );
    },
    [games]
  );

  /**
   * Calculate player statistics
   * Note: This is now a fallback, as we should use the cached statistics service
   */
  const getPlayerStatistics = useCallback(
    (playerId: string): PlayerStatistics => {
      const playerGames = getPlayerGames(playerId);

      if (playerGames.length === 0) {
        return {
          totalGames: 0,
          highScore: 0,
          averageScore: 0,
          strikePercentage: 0,
          sparePercentage: 0,
          recentScores: [],
        };
      }

      // Calculate player scores from each game
      const scores = playerGames
        .map((game) => {
          const playerIndex = game.players.findIndex(
            (player) => player.id === playerId
          );
          if (playerIndex >= 0 && game.scores && game.scores[playerIndex]) {
            return game.scores[playerIndex];
          }
          return 0;
        })
        .filter((score) => score > 0);

      // Calculate strike and spare percentages
      let totalFrames = 0;
      let strikes = 0;
      let spares = 0;

      playerGames.forEach((game) => {
        const playerIndex = game.players.findIndex(
          (player) => player.id === playerId
        );
        if (playerIndex >= 0 && game.frames && game.frames[playerIndex]) {
          const playerFrames = game.frames[playerIndex];

          totalFrames += playerFrames.length;

          playerFrames.forEach((frame) => {
            if (frame.isStrike) strikes++;
            else if (frame.isSpare) spares++;
          });
        }
      });

      // Sort scores by date (newest first) for recent scores
      const gamesByDate = [...playerGames].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const recentScores = gamesByDate
        .slice(0, 5)
        .map((game) => {
          const playerIndex = game.players.findIndex(
            (player) => player.id === playerId
          );
          if (playerIndex >= 0 && game.scores && game.scores[playerIndex]) {
            return game.scores[playerIndex];
          }
          return 0;
        })
        .filter((score) => score > 0);

      return {
        totalGames: playerGames.length,
        highScore: scores.length > 0 ? Math.max(...scores) : 0,
        averageScore:
          scores.length > 0
            ? Math.round(
                scores.reduce((sum, score) => sum + score, 0) / scores.length
              )
            : 0,
        strikePercentage:
          totalFrames > 0 ? Math.round((strikes / totalFrames) * 100) : 0,
        sparePercentage:
          totalFrames > 0 ? Math.round((spares / totalFrames) * 100) : 0,
        recentScores,
      };
    },
    [getPlayerGames]
  );

  // Build context value
  const contextValue = useMemo(
    () => ({
      games,
      isLoading,
      error,
      addGame,
      updateGame,
      deleteGame,
      clearHistory,
      getGameById,
      getPlayerGames,
      getPlayerStatistics,
    }),
    [games, isLoading, error, getGameById, getPlayerGames, getPlayerStatistics]
  );

  return (
    <HistoryContext.Provider value={contextValue}>
      {children}
    </HistoryContext.Provider>
  );
};

// Custom hook for accessing history state and actions
export const useHistory = (): HistoryContextType => {
  const context = useContext(HistoryContext);

  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }

  return context;
};

// Add default export for compatibility with existing imports
export default HistoryProvider;
