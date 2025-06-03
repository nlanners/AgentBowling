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

// Players
export interface Player {
  id: string;
  name: string;
  color?: string;
  isActive?: boolean;
}

// Roll
export interface Roll {
  pinsKnocked: number;
}

// Game
export interface Game {
  id: string;
  date: string; // ISO date string
  location?: string;
  players: PlayerState[];
  currentFrame: number;
  completed: boolean;
  winner?: string; // player id of the winner
  notes?: string;

  // Properties from game.ts
  frames?: Frame[][];
  currentPlayer?: number;
  isComplete?: boolean;
  scores?: number[];
}

// Player State within a Game
export interface PlayerState extends Player {
  frames: Frame[];
  score: number;
}

// Single Frame
export interface Frame {
  rolls: (number | Roll)[];
  score?: number;
  isStrike?: boolean;
  isSpare?: boolean;
  isFoul?: boolean;
  isSplit?: boolean;
  cumulativeScore?: number;
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

// Statistics Types
export interface PlayerStatistics {
  playerId: string;
  basic: BasicStatistics;
  frames: FrameStatistics;
  trends: TrendStatistics;
}

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

export interface FrameStatistics {
  strikePercentage: number;
  sparePercentage: number;
  openFramePercentage: number;
  averagePinsPerFrame: number;
  averageFirstRoll: number;
  averageSecondRoll: number;
}

export interface TrendStatistics {
  frameByFrameAverage: number[];
  scoreImprovement: number;
  consistencyScore: number;
}
