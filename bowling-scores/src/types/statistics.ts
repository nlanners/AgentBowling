/**
 * Statistics types for the bowling score application
 */

import { FrameNumber } from './frame';

/**
 * Basic statistics interface for tracking player and game performance
 */
export interface BasicStatistics {
  /** Average score per game */
  averageScore: number;

  /** Number of strikes thrown */
  strikeCount: number;

  /** Number of spares converted */
  spareCount: number;

  /** Highest game score achieved */
  highScore: number;

  /** Lowest game score achieved */
  lowScore: number;

  /** Total number of games played */
  gamesPlayed: number;
}

/**
 * Frame-specific statistics
 */
export interface FrameStatistics {
  /** Strike percentage (0-100) */
  strikePercentage: number;

  /** Spare percentage (0-100) */
  sparePercentage: number;

  /** Open frame percentage (0-100) */
  openFramePercentage: number;

  /** Average score per frame */
  averageFrameScore: number;

  /** Performance by frame number (1-10) */
  framePerformance: Record<FrameNumber, FramePerformance>;
}

/**
 * Performance metrics for a specific frame
 */
export interface FramePerformance {
  /** Average score for this frame */
  averageScore: number;

  /** Strike percentage for this frame */
  strikePercentage: number;

  /** Spare percentage for this frame */
  sparePercentage: number;
}

/**
 * Detailed roll statistics
 */
export interface RollStatistics {
  /** Average pins knocked down on first roll */
  firstRollAverage: number;

  /** Average pins knocked down on second roll */
  secondRollAverage: number;

  /** Distribution of pins knocked down (0-10) */
  pinsDistribution: number[];
}

/**
 * Trend statistics showing performance over time
 */
export interface TrendStatistics {
  /** Recent trend (positive value means improving) */
  recentTrend: number;

  /** Last 5 games average */
  last5GamesAverage: number;

  /** Last 10 games average */
  last10GamesAverage: number;
}

/**
 * Complete player statistics combining all statistic types
 */
export interface PlayerStatistics {
  /** Player ID */
  playerId: string;

  /** Player name */
  playerName: string;

  /** Basic statistics */
  basic: BasicStatistics;

  /** Frame statistics */
  frames: FrameStatistics;

  /** Roll statistics */
  rolls: RollStatistics;

  /** Trend statistics */
  trends: TrendStatistics;

  /** Last updated timestamp */
  lastUpdated: string;
}

/**
 * Game-specific statistics for a single game
 */
export interface GameStatistics {
  /** Game ID */
  gameId: string;

  /** Date of the game */
  date: string;

  /** Player statistics for this game only */
  playerStats: Record<string, GamePlayerStatistics>;

  /** Total strikes in the game */
  totalStrikes: number;

  /** Total spares in the game */
  totalSpares: number;

  /** Total open frames in the game */
  openFrames: number;

  /** Highest score in the game */
  highScore: number;

  /** Average score across all players */
  averageScore: number;

  /** Strike percentage for the game */
  strikePercentage: number;

  /** Spare percentage for the game */
  sparePercentage: number;
}

/**
 * Player statistics for a specific game
 */
export interface GamePlayerStatistics {
  /** Player ID */
  playerId: string;

  /** Final score */
  score: number;

  /** Number of strikes */
  strikes: number;

  /** Number of spares */
  spares: number;

  /** Number of open frames */
  openFrames: number;

  /** Average pins per roll */
  averagePinsPerRoll: number;
}

/**
 * Filter options for statistics queries
 */
export interface StatisticsFilter {
  /** Start date for filtering (ISO string) */
  startDate?: string;

  /** End date for filtering (ISO string) */
  endDate?: string;

  /** Specific player IDs to include */
  playerIds?: string[];

  /** Minimum number of games required */
  minGames?: number;
}
