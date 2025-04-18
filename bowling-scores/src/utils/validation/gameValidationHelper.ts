import { Game } from '../../types/game';
import { Player } from '../../types/player';
import { Frame, Roll } from '../../types/frame';
import {
  validateGameState,
  validateRollAttempt,
  validatePlayerName,
  validateGameCreation,
  validateRollSequence,
} from './bowlingValidation';

/**
 * Types of validation errors that can occur in the bowling game
 */
export enum ValidationErrorType {
  INVALID_PLAYER = 'INVALID_PLAYER',
  INVALID_GAME_SETUP = 'INVALID_GAME_SETUP',
  INVALID_ROLL = 'INVALID_ROLL',
  INVALID_GAME_STATE = 'INVALID_GAME_STATE',
  INVALID_ROLL_SEQUENCE = 'INVALID_ROLL_SEQUENCE',
  INVALID_FRAME = 'INVALID_FRAME',
  INVALID_SCORE = 'INVALID_SCORE',
  GAME_COMPLETE = 'GAME_COMPLETE',
}

/**
 * Validation error interface for structured error handling
 */
export interface ValidationError {
  type: ValidationErrorType;
  message: string;
  details?: string[];
}

/**
 * Helper class for game validation operations
 */
export class GameValidationHelper {
  /**
   * Validates a player name and returns a structured ValidationError if invalid
   * @param name Player name to validate
   * @returns ValidationError or null if valid
   */
  static validatePlayer(name: string): ValidationError | null {
    const result = validatePlayerName(name);

    if (!result.valid) {
      return {
        type: ValidationErrorType.INVALID_PLAYER,
        message: result.error || 'Invalid player name',
      };
    }

    return null;
  }

  /**
   * Validates a list of players for game creation
   * @param players Array of players to validate
   * @returns ValidationError or null if valid
   */
  static validatePlayers(players: Player[]): ValidationError | null {
    const result = validateGameCreation(players);

    if (!result.valid) {
      return {
        type: ValidationErrorType.INVALID_GAME_SETUP,
        message: 'Invalid player setup for the game',
        details: result.errors,
      };
    }

    return null;
  }

  /**
   * Validates if a roll is permitted in the current game state
   * @param game Current game state
   * @param pinsKnocked Number of pins to be knocked down
   * @returns ValidationError or null if valid
   */
  static validateRoll(game: Game, pinsKnocked: number): ValidationError | null {
    const result = validateRollAttempt(game, pinsKnocked);

    if (!result.valid) {
      return {
        type: ValidationErrorType.INVALID_ROLL,
        message: result.error || 'Invalid roll',
      };
    }

    return null;
  }

  /**
   * Validates the entire game state for integrity
   * @param game Game state to validate
   * @returns ValidationError or null if valid
   */
  static validateGame(game: Game): ValidationError | null {
    const result = validateGameState(game);

    if (!result.valid) {
      return {
        type: ValidationErrorType.INVALID_GAME_STATE,
        message: 'Game state is invalid',
        details: result.errors,
      };
    }

    return null;
  }

  /**
   * Validates a sequence of rolls
   * @param rolls Array of pin counts from rolls
   * @returns ValidationError or null if valid
   */
  static validateRolls(rolls: number[]): ValidationError | null {
    const result = validateRollSequence(rolls);

    if (!result.valid) {
      return {
        type: ValidationErrorType.INVALID_ROLL_SEQUENCE,
        message: 'Invalid roll sequence',
        details: result.errors,
      };
    }

    return null;
  }

  /**
   * Gets a user-friendly error message from a validation error
   * @param error ValidationError object
   * @returns User-friendly error message
   */
  static getErrorMessage(error: ValidationError): string {
    // Return the main message if no details are available
    if (!error.details || error.details.length === 0) {
      return error.message;
    }

    // For a single detail, return a combined message
    if (error.details.length === 1) {
      return `${error.message}: ${error.details[0]}`;
    }

    // For multiple details, return the main message followed by a list
    return `${error.message}:\n${error.details
      .map((detail) => `- ${detail}`)
      .join('\n')}`;
  }

  /**
   * Performs all validation checks on a game before allowing a roll
   * @param game Current game state
   * @param pinsKnocked Number of pins to be knocked down
   * @returns ValidationError or null if all valid
   */
  static validateRollAndGameState(
    game: Game,
    pinsKnocked: number
  ): ValidationError | null {
    // First check if the game state is valid
    const gameValidation = this.validateGame(game);
    if (gameValidation) {
      return gameValidation;
    }

    // Then check if the roll is valid
    return this.validateRoll(game, pinsKnocked);
  }

  /**
   * Validates a game setup
   */
  static validateGameSetup(game: Game): void {
    if (!game.players || game.players.length === 0) {
      throw {
        type: ValidationErrorType.INVALID_GAME_SETUP,
        message: 'Invalid game setup',
        details: ['At least one player is required to start a game'],
      } as ValidationError;
    }

    if (game.players.length > 6) {
      throw {
        type: ValidationErrorType.INVALID_GAME_SETUP,
        message: 'Invalid game setup',
        details: ['Maximum 6 players allowed per game'],
      } as ValidationError;
    }
  }

  /**
   * Checks if a game is complete
   */
  static isGameComplete(game: Game): boolean {
    // Game is complete when all players have completed all 10 frames
    return game.players.every((player) => {
      // Player must have 10 frames
      const playerIndex = game.players.findIndex((p) => p.id === player.id);
      if (playerIndex === -1 || game.frames[playerIndex].length !== 10)
        return false;

      const lastFrame = game.frames[playerIndex][9];

      // Last frame must be complete
      if (lastFrame.isStrike || lastFrame.isSpare) {
        // Strike or spare in last frame requires additional rolls
        return lastFrame.rolls.length === 3;
      } else {
        // No strike or spare in last frame
        return lastFrame.rolls.length === 2;
      }
    });
  }

  /**
   * Validates if a player's turn is valid
   */
  static validatePlayerTurn(
    player: Player,
    currentPlayerIndex: number,
    players: Player[]
  ): void {
    const playerIndex = players.findIndex((p) => p.id === player.id);

    if (playerIndex !== currentPlayerIndex) {
      throw {
        type: ValidationErrorType.INVALID_GAME_SETUP,
        message: 'Not your turn',
        details: [`It's ${players[currentPlayerIndex].name}'s turn`],
      } as ValidationError;
    }
  }
}
