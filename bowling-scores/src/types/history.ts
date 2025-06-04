import { Game } from './game';

/**
 * GameHistory interface representing the history of all saved games
 */
export interface GameHistory {
  /** Array of saved games */
  games: Game[];
}

/**
 * Statistics interface for tracking player and game performance
 */
export interface Statistics {
  /** Average score per game */
  averageScore: number;

  /** Number of strikes thrown */
  strikes: number;

  /** Number of spares converted */
  spares: number;

  /** Highest game score achieved */
  highScore: number;

  /** Average score per frame */
  averageFrameScore: number;
}

/**
 * Filter criteria for game history queries
 */
export interface GameFilter {
  /** Start date for filtering (ISO string) */
  startDate?: string;

  /** End date for filtering (ISO string) */
  endDate?: string;

  /** Specific player IDs to include */
  playerIds?: string[];

  /** Minimum score threshold */
  minScore?: number;

  /** Maximum score threshold */
  maxScore?: number;

  /** Sort order ('asc' or 'desc') */
  sortOrder?: 'asc' | 'desc';

  /** Sort by field */
  sortBy?: 'date' | 'playerScore' | 'playerName';

  /** Limit the number of results */
  limit?: number;
}

/**
 * Game history entry for display in UI
 */
export interface GameHistoryEntry {
  /** Game ID */
  id: string;

  /** Date of the game */
  date: string;

  /** Formatted date string for display */
  formattedDate: string;

  /** Player names involved in the game */
  playerNames: string[];

  /** Winning player name */
  winner: string;

  /** Winning score */
  topScore: number;

  /** Whether this is a favorite game */
  isFavorite: boolean;
}

/**
 * History types
 * Type definitions related to game history and filtering
 */

export type SortOption =
  | 'date-desc' // Newest first (default)
  | 'date-asc' // Oldest first
  | 'score-desc' // Highest score first
  | 'score-asc'; // Lowest score first

export interface FilterOptions {
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
  playerIds: string[]; // Empty array means all players
  scoreRange: {
    minScore: number | null;
    maxScore: number | null;
  };
  sortBy: SortOption;
}

export interface HistoryItemData {
  id: string;
  date: string;
  formattedDate: string;
  winner: string;
  players: Array<{
    playerId: string;
    playerName: string;
    score: number;
  }>;
  topScore: number;
  isComplete: boolean;
}

// Default filter options
export const DEFAULT_FILTER_OPTIONS: FilterOptions = {
  dateRange: {
    startDate: null,
    endDate: null,
  },
  playerIds: [],
  scoreRange: {
    minScore: null,
    maxScore: null,
  },
  sortBy: 'date-desc',
};
