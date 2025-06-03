/**
 * History context for the bowling score app
 * Provides game history management throughout the application
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
} from 'react';
import { Game } from '../types';
import { MMKV } from 'react-native-mmkv';

// Storage key for game history
const HISTORY_STORAGE_KEY = 'BowlingApp.GameHistory';

// Storage instance for persisting game history
let storage: MMKV | null = null;

try {
  storage = new MMKV({
    id: 'bowling-app-storage',
  });
} catch (error) {
  console.error('Failed to initialize MMKV storage:', error);
  // Provide a fallback if MMKV fails to initialize
  storage = null;
}

// History action types
export enum HistoryActionType {
  ADD_GAME = 'ADD_GAME',
  REMOVE_GAME = 'REMOVE_GAME',
  CLEAR_HISTORY = 'CLEAR_HISTORY',
}

// History actions interface
type HistoryAction =
  | { type: HistoryActionType.ADD_GAME; payload: { game: Game } }
  | { type: HistoryActionType.REMOVE_GAME; payload: { gameId: string } }
  | { type: HistoryActionType.CLEAR_HISTORY };

// History context state interface
interface HistoryContextState {
  gameHistory: Game[];
  isLoading: boolean;
  error: string | null;
}

// History context interface
interface HistoryContextType extends HistoryContextState {
  addGameToHistory: (game: Game) => void;
  removeGameFromHistory: (gameId: string) => void;
  clearHistory: () => void;
  getGameById: (gameId: string) => Game | undefined;
  getPlayerGameHistory: (playerId: string) => Game[];
  getPlayerStatistics: (playerId: string) => PlayerStatistics;
}

// Player statistics interface
interface PlayerStatistics {
  totalGames: number;
  highScore: number;
  averageScore: number;
  strikePercentage: number;
  sparePercentage: number;
  recentScores: number[];
}

// Load game history from storage
function loadHistoryFromStorage(): Game[] {
  if (!storage) return [];

  const storedHistory = storage.getString(HISTORY_STORAGE_KEY);
  if (storedHistory) {
    try {
      return JSON.parse(storedHistory);
    } catch (e) {
      console.error('Failed to parse stored game history', e);
    }
  }
  return [];
}

// Save game history to storage
function saveHistoryToStorage(history: Game[]): void {
  if (!storage) return;

  try {
    storage.set(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save game history to storage', e);
  }
}

// Initial state
const initialState: HistoryContextState = {
  gameHistory: loadHistoryFromStorage(),
  isLoading: false,
  error: null,
};

// Create context with default undefined value
const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

// History reducer
function historyReducer(
  state: HistoryContextState,
  action: HistoryAction
): HistoryContextState {
  switch (action.type) {
    case HistoryActionType.ADD_GAME: {
      const { game } = action.payload;

      // Verify game is complete
      if (!game.isComplete) {
        return {
          ...state,
          error: 'Cannot add incomplete game to history',
        };
      }

      // Add game to history
      const updatedHistory = [...state.gameHistory, game];

      // Sort by date (newest first)
      updatedHistory.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Save to storage
      saveHistoryToStorage(updatedHistory);

      return {
        ...state,
        gameHistory: updatedHistory,
        error: null,
      };
    }

    case HistoryActionType.REMOVE_GAME: {
      const { gameId } = action.payload;

      // Remove game from history
      const updatedHistory = state.gameHistory.filter(
        (game) => game.id !== gameId
      );

      // Save to storage
      saveHistoryToStorage(updatedHistory);

      return {
        ...state,
        gameHistory: updatedHistory,
        error: null,
      };
    }

    case HistoryActionType.CLEAR_HISTORY: {
      // Clear storage
      saveHistoryToStorage([]);

      return {
        ...state,
        gameHistory: [],
        error: null,
      };
    }

    default:
      return state;
  }
}

// History provider component
export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(historyReducer, initialState);

  // Action to add a game to history
  const addGameToHistory = useCallback((game: Game) => {
    dispatch({
      type: HistoryActionType.ADD_GAME,
      payload: { game },
    });
  }, []);

  // Action to remove a game from history
  const removeGameFromHistory = useCallback((gameId: string) => {
    dispatch({
      type: HistoryActionType.REMOVE_GAME,
      payload: { gameId },
    });
  }, []);

  // Action to clear history
  const clearHistory = useCallback(() => {
    dispatch({
      type: HistoryActionType.CLEAR_HISTORY,
    });
  }, []);

  // Utility to get a game by ID
  const getGameById = useCallback(
    (gameId: string) => {
      return state.gameHistory.find((game) => game.id === gameId);
    },
    [state.gameHistory]
  );

  // Utility to get games for a specific player
  const getPlayerGameHistory = useCallback(
    (playerId: string) => {
      return state.gameHistory.filter((game) =>
        game.players.some((player) => player.id === playerId)
      );
    },
    [state.gameHistory]
  );

  // Utility to calculate player statistics
  const getPlayerStatistics = useCallback(
    (playerId: string): PlayerStatistics => {
      const playerGames = getPlayerGameHistory(playerId);

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
      const scoresByDate = [...scores];
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
    [getPlayerGameHistory]
  );

  // Build context value
  const contextValue = useMemo(
    () => ({
      ...state,
      addGameToHistory,
      removeGameFromHistory,
      clearHistory,
      getGameById,
      getPlayerGameHistory,
      getPlayerStatistics,
    }),
    [
      state,
      addGameToHistory,
      removeGameFromHistory,
      clearHistory,
      getGameById,
      getPlayerGameHistory,
      getPlayerStatistics,
    ]
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

export default HistoryProvider;
