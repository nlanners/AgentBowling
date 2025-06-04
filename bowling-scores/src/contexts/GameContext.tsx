/**
 * Game context for the bowling score app
 * Provides game state management throughout the application
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
} from 'react';
import { Game, Player } from '../types';
import { createNewGame, addRoll, isGameComplete } from '../utils/scoring';
import {
  GameValidationHelper,
  ValidationError,
} from '../utils/validation/gameValidationHelper';
import * as HistoryStorage from '../services/storage/history';
import { STORAGE_KEYS, setValue } from '../services/storage/mmkvStorage';

// Game action types
export enum GameActionType {
  CREATE_GAME = 'CREATE_GAME',
  ADD_ROLL = 'ADD_ROLL',
  RESET_GAME = 'RESET_GAME',
  RESET_FRAME = 'RESET_FRAME',
}

// Game actions interface
type GameAction =
  | { type: GameActionType.CREATE_GAME; payload: { players: Player[] } }
  | { type: GameActionType.ADD_ROLL; payload: { pinsKnocked: number } }
  | { type: GameActionType.RESET_GAME }
  | { type: GameActionType.RESET_FRAME };

// Game context state interface
interface GameContextState {
  game: Game | null;
  error: string | null;
  isLoading: boolean;
}

// Game context interface
interface GameContextType extends GameContextState {
  createGame: (players: Player[]) => void;
  addRoll: (pinsKnocked: number) => void;
  resetGame: () => void;
  resetFrame: () => void;
  canAddRoll: (pinsKnocked: number) => { valid: boolean; error?: string };
  isGameOver: () => boolean;
  getCurrentPlayer: () => Player | undefined;
  getCurrentFrameIndex: () => number;
  saveGameToHistory: () => Promise<boolean>;
}

// Initial state
const initialState: GameContextState = {
  game: null,
  error: null,
  isLoading: false,
};

// Create context with default undefined value
const GameContext = createContext<GameContextType | undefined>(undefined);

// Game reducer
function gameReducer(
  state: GameContextState,
  action: GameAction
): GameContextState {
  switch (action.type) {
    case GameActionType.CREATE_GAME: {
      const { players } = action.payload;
      if (!players || players.length === 0) {
        return {
          ...state,
          error: 'At least one player is required to start a game',
        };
      }

      // Validate players
      const playerValidation = GameValidationHelper.validatePlayers(players);
      if (playerValidation) {
        return {
          ...state,
          error: GameValidationHelper.getErrorMessage(playerValidation),
        };
      }

      const newGame = createNewGame(players);
      return {
        ...state,
        game: newGame,
        error: null,
      };
    }

    case GameActionType.ADD_ROLL: {
      const { pinsKnocked } = action.payload;

      if (!state.game) {
        return {
          ...state,
          error: 'No active game to add a roll to',
        };
      }

      // Validate roll using GameValidationHelper
      const validation = GameValidationHelper.validateRoll(
        state.game,
        pinsKnocked
      );
      if (validation) {
        return {
          ...state,
          error: GameValidationHelper.getErrorMessage(validation),
        };
      }

      // Add roll to the game
      const updatedGame = addRoll(state.game, pinsKnocked);

      return {
        ...state,
        game: updatedGame,
        error: null,
      };
    }

    case GameActionType.RESET_GAME:
      return {
        ...initialState,
      };

    case GameActionType.RESET_FRAME: {
      if (!state.game) {
        return state;
      }

      // Create a shallow copy of the game
      const updatedGame = { ...state.game };

      // Get current player and frame
      const { currentPlayer, currentFrame } = updatedGame;

      // Reset the current frame by removing all rolls
      if (updatedGame.frames[currentPlayer][currentFrame]) {
        updatedGame.frames[currentPlayer][currentFrame].rolls = [];
        updatedGame.frames[currentPlayer][currentFrame].isStrike = false;
        updatedGame.frames[currentPlayer][currentFrame].isSpare = false;
        updatedGame.frames[currentPlayer][currentFrame].score = 0;

        // Update cumulative scores
        // (This is a simplified approach - in a real app, we'd recalculate all scores)
        if (currentFrame > 0) {
          updatedGame.frames[currentPlayer][currentFrame].cumulativeScore =
            updatedGame.frames[currentPlayer][currentFrame - 1].cumulativeScore;
        } else {
          updatedGame.frames[currentPlayer][currentFrame].cumulativeScore = 0;
        }
      }

      return {
        ...state,
        game: updatedGame,
        error: null,
      };
    }

    default:
      return state;
  }
}

// Game provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Action to create a new game
  const createGame = useCallback((players: Player[]) => {
    dispatch({
      type: GameActionType.CREATE_GAME,
      payload: { players },
    });
  }, []);

  // Action to add a roll to the current game
  const addGameRoll = useCallback((pinsKnocked: number) => {
    dispatch({
      type: GameActionType.ADD_ROLL,
      payload: { pinsKnocked },
    });
  }, []);

  // Action to reset the game
  const resetGame = useCallback(() => {
    dispatch({ type: GameActionType.RESET_GAME });
  }, []);

  // Action to reset the current frame
  const resetFrame = useCallback(() => {
    dispatch({ type: GameActionType.RESET_FRAME });
  }, []);

  // Check if a roll is valid
  const canAddRoll = useCallback(
    (pinsKnocked: number) => {
      if (!state.game) {
        return { valid: false, error: 'No active game' };
      }

      // Use GameValidationHelper for validation but adapt the response format
      const validation = GameValidationHelper.validateRoll(
        state.game,
        pinsKnocked
      );
      return {
        valid: validation === null,
        error: validation
          ? GameValidationHelper.getErrorMessage(validation)
          : undefined,
      };
    },
    [state.game]
  );

  // Check if the game is over
  const isGameOver = useCallback(() => {
    if (!state.game) {
      return false;
    }

    return GameValidationHelper.isGameComplete(state.game);
  }, [state.game]);

  // Get the current player
  const getCurrentPlayer = useCallback(() => {
    if (!state.game) {
      return undefined;
    }

    return state.game.players[state.game.currentPlayer];
  }, [state.game]);

  // Get the current frame index
  const getCurrentFrameIndex = useCallback(() => {
    if (!state.game) {
      return 0;
    }

    return state.game.currentFrame;
  }, [state.game]);

  // Add a function to save the current game to history
  const saveGameToHistory = async (): Promise<boolean> => {
    if (!state.game) {
      console.error('Cannot save game to history: No active game');
      return false;
    }

    try {
      // Make sure the game has a date
      if (!state.game.date) {
        state.game.date = new Date().toISOString();
      }

      // Save to storage using the history service
      const success = await HistoryStorage.saveGame(state.game);

      if (success) {
        // Also save this as the most recent active game
        setValue(STORAGE_KEYS.ACTIVE_GAME, state.game);
      }

      return success;
    } catch (error) {
      console.error('Error saving game to history:', error);
      return false;
    }
  };

  // Build context value
  const contextValue = useMemo(
    () => ({
      ...state,
      createGame,
      addRoll: addGameRoll,
      resetGame,
      resetFrame,
      canAddRoll,
      isGameOver,
      getCurrentPlayer,
      getCurrentFrameIndex,
      saveGameToHistory,
    }),
    [
      state,
      createGame,
      addGameRoll,
      resetGame,
      resetFrame,
      canAddRoll,
      isGameOver,
      getCurrentPlayer,
      getCurrentFrameIndex,
      saveGameToHistory,
    ]
  );

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export default GameProvider;
