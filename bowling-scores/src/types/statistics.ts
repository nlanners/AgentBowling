/**
 * Statistics types for the bowling score application
 */

/**
 * Types related to statistics and analytics
 */

// Import FrameNumber from frame.ts to avoid duplication
import { FrameNumber } from './frame';

// Frame performance metrics
export interface FramePerformance {
  averageScore: number;
  strikePercentage: number;
  sparePercentage: number;
}

// Basic game statistics
export interface BasicStatistics {
  gamesPlayed: number;
  highScore: number;
  lowScore: number;
  averageScore: number;
  strikeCount: number;
  spareCount: number;
  openFrameCount: number;
  perfectGameCount: number;
}

// Frame-specific statistics
export interface FrameStatistics {
  strikePercentage: number;
  sparePercentage: number;
  openFramePercentage: number;
  averagePinsPerFrame: number;
  averageFirstRoll: number;
  averageSecondRoll: number;
  averageFrameScore: number;
  framePerformance: Record<FrameNumber, FramePerformance>;
}

// Trend statistics to track improvement
export interface TrendStatistics {
  frameByFrameAverage: number[];
  scoreImprovement: number;
  consistencyScore: number;
  recentTrend: number;
  last5GamesAverage: number;
  last10GamesAverage: number;
}

// Roll-specific statistics
export interface RollStatistics {
  firstRollAverage: number;
  secondRollAverage: number;
  pinsDistribution: number[];
}

// Comprehensive player statistics
export interface PlayerStatistics {
  playerId: string;
  playerName: string;
  basic: BasicStatistics;
  frames: FrameStatistics;
  trends: TrendStatistics;
  rolls: RollStatistics;
  lastUpdated?: string;
}

// Per-player statistics for a specific game
export interface GamePlayerStatistics {
  playerId: string;
  score: number;
  strikes: number;
  spares: number;
  openFrames: number;
  averagePinsPerRoll: number;
}

// Overall game statistics
export interface GameStatistics {
  gameId: string;
  date: string;
  playerStats: Record<string, GamePlayerStatistics>;
  totalStrikes: number;
  totalSpares: number;
  openFrames: number;
  highScore: number;
  averageScore: number;
  strikePercentage: number;
  sparePercentage: number;
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
