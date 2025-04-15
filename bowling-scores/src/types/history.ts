import { Game } from './game';

/**
 * GameHistory interface representing the collection of past games
 * for recording and statistics purposes
 */
export interface GameHistory {
  /** Array of completed Game objects */
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
