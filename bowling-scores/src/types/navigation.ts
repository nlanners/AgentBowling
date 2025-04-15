import { Player } from './player';

/**
 * Type definitions for application navigation
 */
export type RootStackParamList = {
  Home: undefined;
  PlayerSetup: undefined;
  Game: {
    players: Player[];
  };
  GameSummary: {
    players: Player[];
  };
  History: undefined;
};
