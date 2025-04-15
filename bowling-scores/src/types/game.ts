import { Player } from './player';
import { Frame } from './frame';

/**
 * Game interface representing a complete bowling game with all its frames and players
 */
export interface Game {
  /** Unique identifier for the game */
  id: string;

  /** Date/time when the game was played */
  date: string;

  /** Array of Player objects participating in the game */
  players: Player[];

  /** 2D array of Frame objects for each player (10 frames per player) */
  frames: Frame[][];

  /** Index of the current frame being played */
  currentFrame: number;

  /** Index of the current player whose turn it is */
  currentPlayer: number;

  /** Boolean indicating if the game is complete */
  isComplete: boolean;

  /** Final scores of each player (available when the game is complete) */
  scores?: number[];
}
