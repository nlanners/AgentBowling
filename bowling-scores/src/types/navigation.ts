import { Player } from './player';

/**
 * Navigation types for the bowling score application
 */

/**
 * Root stack parameter list
 */
export type RootStackParamList = {
  /** Home screen */
  Home: undefined;

  /** Player setup screen */
  PlayerSetup: undefined;

  /** Game screen */
  Game: {
    /** Players in the game */
    players: Player[];
  };

  /** Game summary screen */
  GameSummary: {
    /** Players in the game */
    players: Player[];
  };

  /** Game history screen */
  History: undefined;

  /** Game details screen */
  GameDetails: {
    /** ID of the game to view */
    gameId: string;
  };

  /** Statistics screen */
  Statistics: undefined;
};
