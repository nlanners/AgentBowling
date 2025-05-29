import {
  GameValidationHelper,
  ValidationErrorType,
} from '../gameValidationHelper';
import { Game } from '../../../types/game';
import { Player } from '../../../types/player';
import { Frame } from '../../../types/frame';

// Helper functions to create test objects
const createRoll = (pinsKnocked: number) => ({ pinsKnocked });

const createFrame = (
  rolls: number[],
  isStrike = false,
  isSpare = false
): Frame => ({
  rolls: rolls.map((pins) => createRoll(pins)),
  score: 0,
  cumulativeScore: 0,
  isStrike,
  isSpare,
});

const createPlayer = (id: string, name: string): Player => ({
  id,
  name,
});

const createGame = (players: Player[], frames: Frame[][]): Game => ({
  id: '1',
  date: new Date().toISOString(),
  players,
  frames,
  currentPlayer: 0,
  currentFrame: 0,
  isComplete: false,
});

describe('GameValidationHelper Tests', () => {
  describe('validatePlayer', () => {
    it('should return null for valid player names', () => {
      expect(GameValidationHelper.validatePlayer('John')).toBeNull();
      expect(GameValidationHelper.validatePlayer('Jane Doe')).toBeNull();
    });

    it('should return ValidationError for invalid player names', () => {
      const result = GameValidationHelper.validatePlayer('');
      expect(result).not.toBeNull();
      expect(result?.type).toBe(ValidationErrorType.INVALID_PLAYER);
    });
  });

  describe('validatePlayers', () => {
    it('should return null for valid player list', () => {
      const players = [createPlayer('1', 'John'), createPlayer('2', 'Jane')];

      expect(GameValidationHelper.validatePlayers(players)).toBeNull();
    });

    it('should return ValidationError for empty player list', () => {
      const result = GameValidationHelper.validatePlayers([]);
      expect(result).not.toBeNull();
      expect(result?.type).toBe(ValidationErrorType.INVALID_GAME_SETUP);
    });

    it('should return ValidationError for duplicate player names', () => {
      const players = [createPlayer('1', 'John'), createPlayer('2', 'John')];

      const result = GameValidationHelper.validatePlayers(players);
      expect(result).not.toBeNull();
      expect(result?.type).toBe(ValidationErrorType.INVALID_GAME_SETUP);
    });
  });

  describe('validateRoll', () => {
    it('should return null for valid roll', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [[createFrame([5]), ...Array(9).fill(createFrame([]))]];
      const game = createGame(players, frames);

      expect(GameValidationHelper.validateRoll(game, 3)).toBeNull();
    });

    it('should return ValidationError for invalid pin count', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [[createFrame([5]), ...Array(9).fill(createFrame([]))]];
      const game = createGame(players, frames);

      const result = GameValidationHelper.validateRoll(game, 6); // 5+6 > 10
      expect(result).not.toBeNull();
      expect(result?.type).toBe(ValidationErrorType.INVALID_ROLL);
    });
  });

  describe('validateGame', () => {
    it('should return null for valid game state', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [
        [
          createFrame([1, 2]),
          createFrame([3, 4]),
          ...Array(8).fill(createFrame([])),
        ],
      ];

      // Set frame scores correctly
      frames[0][0].score = 3;
      frames[0][0].cumulativeScore = 3;
      frames[0][1].score = 7;
      frames[0][1].cumulativeScore = 10;

      const game = createGame(players, frames);

      expect(GameValidationHelper.validateGame(game)).toBeNull();
    });

    it('should return ValidationError for invalid game state', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [
        [createFrame([1, 2]), createFrame([3, 4])], // Missing 8 frames
      ];
      const game = createGame(players, frames);

      const result = GameValidationHelper.validateGame(game);
      expect(result).not.toBeNull();
      expect(result?.type).toBe(ValidationErrorType.INVALID_GAME_STATE);
    });
  });

  describe('validateRolls', () => {
    it('should return null for valid roll sequence', () => {
      const rolls = [10, 10, 9, 1, 5, 5, 7, 2];
      expect(GameValidationHelper.validateRolls(rolls)).toBeNull();
    });

    it('should return ValidationError for invalid roll sequence', () => {
      const rolls = [10, 11, 5]; // 11 is invalid
      const result = GameValidationHelper.validateRolls(rolls);
      expect(result).not.toBeNull();
      expect(result?.type).toBe(ValidationErrorType.INVALID_ROLL_SEQUENCE);
    });
  });

  describe('getErrorMessage', () => {
    it('should return simple message for error without details', () => {
      const error = {
        type: ValidationErrorType.INVALID_PLAYER,
        message: 'Invalid player name',
      };

      const message = GameValidationHelper.getErrorMessage(error);
      expect(message).toBe('Invalid player name');
    });

    it('should return combined message for error with one detail', () => {
      const error = {
        type: ValidationErrorType.INVALID_GAME_SETUP,
        message: 'Invalid game setup',
        details: ['At least one player is required'],
      };

      const message = GameValidationHelper.getErrorMessage(error);
      expect(message).toBe(
        'Invalid game setup: At least one player is required'
      );
    });

    it('should return formatted message for error with multiple details', () => {
      const error = {
        type: ValidationErrorType.INVALID_GAME_STATE,
        message: 'Game state is invalid',
        details: [
          'Player 1 must have exactly 10 frames',
          'Current player index is out of bounds',
        ],
      };

      const message = GameValidationHelper.getErrorMessage(error);
      expect(message).toContain('Game state is invalid:');
      expect(message).toContain('- Player 1 must have exactly 10 frames');
      expect(message).toContain('- Current player index is out of bounds');
    });
  });

  describe('validateRollAndGameState', () => {
    it('should return null when both game and roll are valid', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [
        [
          createFrame([1, 2]),
          createFrame([3, 4]),
          ...Array(8).fill(createFrame([])),
        ],
      ];

      // Set frame scores correctly
      frames[0][0].score = 3;
      frames[0][0].cumulativeScore = 3;
      frames[0][1].score = 7;
      frames[0][1].cumulativeScore = 10;

      const game = {
        ...createGame(players, frames),
        currentFrame: 2,
        currentPlayer: 0,
      };

      expect(GameValidationHelper.validateRollAndGameState(game, 5)).toBeNull();
    });

    it('should return game validation error first', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [
        [createFrame([1, 2]), createFrame([3, 4])], // Missing 8 frames
      ];
      const game = {
        ...createGame(players, frames),
        currentPlayer: 5, // Invalid
      };

      const result = GameValidationHelper.validateRollAndGameState(game, 5);
      expect(result).not.toBeNull();
      expect(result?.type).toBe(ValidationErrorType.INVALID_GAME_STATE);
    });
  });
});
