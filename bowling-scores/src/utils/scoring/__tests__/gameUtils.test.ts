import { Frame } from '../../../types/frame';
import { Game } from '../../../types/game';
import { Player } from '../../../types/player';
import {
  createEmptyFrame,
  createNewGame,
  isGameComplete,
  addRoll,
} from '../gameUtils';

// Mock the GameValidationHelper (required for isGameComplete function)
jest.mock('../../../utils/validation/gameValidationHelper', () => ({
  GameValidationHelper: {
    isGameComplete: jest.fn((game) => {
      // Basic implementation for testing
      if (!game) return false;
      return game.isComplete === true;
    }),
  },
}));

describe('createEmptyFrame', () => {
  it('should create an empty frame with default values', () => {
    const frame = createEmptyFrame();

    expect(frame).toEqual({
      rolls: [],
      isSpare: false,
      isStrike: false,
      score: 0,
      cumulativeScore: 0,
    });
  });
});

// Replace addRollToFrame tests with tests for addRoll
describe('addRoll', () => {
  it('should add a roll to the game', () => {
    const players = [{ id: 'player1', name: 'Player 1' }];
    let game = createNewGame(players);

    // Add a roll of 7 pins
    game = addRoll(game, 7);

    expect(game.frames[0][0].rolls).toHaveLength(1);
    expect(game.frames[0][0].rolls[0].pinsKnocked).toBe(7);
    expect(game.frames[0][0].isStrike).toBe(false);
  });

  it('should correctly identify a strike', () => {
    const players = [{ id: 'player1', name: 'Player 1' }];
    let game = createNewGame(players);

    // Add a strike
    game = addRoll(game, 10);

    expect(game.frames[0][0].rolls).toHaveLength(1);
    expect(game.frames[0][0].rolls[0].pinsKnocked).toBe(10);
    expect(game.frames[0][0].isStrike).toBe(true);

    // A strike should advance to the next frame
    expect(game.currentFrame).toBe(1);
  });

  it('should correctly identify a spare', () => {
    const players = [{ id: 'player1', name: 'Player 1' }];
    let game = createNewGame(players);

    // First roll: 7 pins
    game = addRoll(game, 7);
    // Second roll: 3 pins (makes a spare)
    game = addRoll(game, 3);

    expect(game.frames[0][0].rolls).toHaveLength(2);
    expect(game.frames[0][0].rolls[0].pinsKnocked).toBe(7);
    expect(game.frames[0][0].rolls[1].pinsKnocked).toBe(3);
    expect(game.frames[0][0].isSpare).toBe(true);

    // A spare should advance to the next frame
    expect(game.currentFrame).toBe(1);
  });
});

describe('createNewGame', () => {
  it('should create a game with correct structure', () => {
    const players: Player[] = [
      { id: 'player1', name: 'Player 1' },
      { id: 'player2', name: 'Player 2' },
    ];

    const game = createNewGame(players);

    expect(game.id).toBeDefined();
    expect(game.date).toBeDefined();
    expect(game.players).toEqual(players);
    expect(game.frames).toHaveLength(players.length);

    // Each player should have 10 frames
    expect(game.frames[0]).toHaveLength(10);
    expect(game.frames[1]).toHaveLength(10);

    // Frames should be empty initially
    expect(game.frames[0][0].rolls).toHaveLength(0);

    // Game state should be initialized correctly
    expect(game.currentFrame).toBe(0);
    expect(game.currentPlayer).toBe(0);
    expect(game.isComplete).toBe(false);
  });

  it('should handle an empty players array', () => {
    const game = createNewGame([]);

    expect(game.players).toEqual([]);
    expect(game.frames).toEqual([]);
  });
});

describe('isGameComplete', () => {
  it('should call GameValidationHelper to check if game is complete', () => {
    const mockGame = { isComplete: true } as Game;

    const result = isGameComplete(mockGame);

    // Should return true since we mocked isComplete to be true
    expect(result).toBe(true);
  });

  it('should handle incomplete games', () => {
    const mockGame = { isComplete: false } as Game;

    const result = isGameComplete(mockGame);

    expect(result).toBe(false);
  });
});
