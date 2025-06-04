/**
 * Centralized exports for type definitions
 */

// Player types
export * from './player';

// Navigation types
export * from './navigation';

// Game model types
export * from './frame';
export * from './game';
export * from './history';

// Statistics types
export * from './statistics';

// Constants
export * from './constants';

// Import Frame type for direct use
import { Frame } from './frame';

/**
 * Application Types
 */

// Navigation
export type RootStackParamList = {
  Home: undefined;
  PlayerSetup: undefined;
  Game: {
    gameId?: string;
    newGame?: boolean;
    players?: PlayerState[];
  };
  History: undefined;
  GameDetails: {
    gameId: string;
  };
  Statistics: undefined;
  GameSummary: {
    players: PlayerState[];
  };
};

// Roll
export interface Roll {
  pinsKnocked: number;
}

// Player State within a Game
export interface PlayerState {
  id: string;
  name: string;
  isActive?: boolean;
  frames: Frame[];
  score: number;
}

// Frame Display Data
export interface FrameDisplayData {
  frameNumber: number;
  roll1Display: string;
  roll2Display: string;
  roll3Display?: string;
  score: string;
  isCurrentFrame: boolean;
  isComplete: boolean;
  isTenth: boolean;
}

// Game Settings
export interface GameSettings {
  showRunningScore: boolean;
  autoAdvanceFrames: boolean;
  highlightStrikesAndSpares: boolean;
  soundEffects: boolean;
}

// Game filter type
export interface GameFilter {
  startDate?: string;
  endDate?: string;
  playerIds?: string[];
  minScore?: number;
  maxScore?: number;
}
