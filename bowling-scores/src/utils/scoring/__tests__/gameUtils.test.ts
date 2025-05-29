import {
  createEmptyFrame,
  initializeGameFrames,
  addRoll,
  isGameComplete,
  createNewGame,
} from '../gameUtils';
import { Game } from '../../../types/game';
import { Player } from '../../../types/player';
import { Frame } from '../../../types/frame';

// Helper function to create test players
const createTestPlayers = (): Player[] => [
  { id: '1', name: 'Player 1' },
  { id: '2', name: 'Player 2' },
];

describe('Game Utils Tests', () => {
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

  describe('initializeGameFrames', () => {
    it('should initialize frames for all players', () => {
      const players = createTestPlayers();
      const game: Game = {
        id: '1',
        date: '2025-05-29',
        players,
        frames: [],
        currentPlayer: 0,
        currentFrame: 0,
        isComplete: false,
      };

      const initializedGame = initializeGameFrames(game);

      expect(initializedGame.frames.length).toBe(players.length);
      expect(initializedGame.frames[0].length).toBe(10); // 10 frames per player
      expect(initializedGame.frames[1].length).toBe(10);

      // Check that frames are properly initialized
      initializedGame.frames.forEach((playerFrames) => {
        playerFrames.forEach((frame) => {
          expect(frame).toEqual({
            rolls: [],
            isSpare: false,
            isStrike: false,
            score: 0,
            cumulativeScore: 0,
          });
        });
      });
    });
  });

  describe('addRoll', () => {
    it('should add a roll to the current frame', () => {
      const players = createTestPlayers();
      const game: Game = {
        id: '1',
        date: '2025-05-29',
        players,
        frames: [],
        currentPlayer: 0,
        currentFrame: 0,
        isComplete: false,
      };

      const initializedGame = initializeGameFrames(game);
      const updatedGame = addRoll(initializedGame, 5);

      expect(updatedGame.frames[0][0].rolls.length).toBe(1);
      expect(updatedGame.frames[0][0].rolls[0].pinsKnocked).toBe(5);
      expect(updatedGame.frames[0][0].isStrike).toBe(false);
      expect(updatedGame.frames[0][0].isSpare).toBe(false);
    });

    it('should update frame flags when a strike is rolled', () => {
      const players = createTestPlayers();
      const game: Game = {
        id: '1',
        date: '2025-05-29',
        players,
        frames: [],
        currentPlayer: 0,
        currentFrame: 0,
        isComplete: false,
      };

      const initializedGame = initializeGameFrames(game);
      const updatedGame = addRoll(initializedGame, 10);

      expect(updatedGame.frames[0][0].rolls.length).toBe(1);
      expect(updatedGame.frames[0][0].rolls[0].pinsKnocked).toBe(10);
      expect(updatedGame.frames[0][0].isStrike).toBe(true);
      expect(updatedGame.frames[0][0].isSpare).toBe(false);

      // After a strike, should move to next frame
      expect(updatedGame.currentFrame).toBe(1);
      expect(updatedGame.currentPlayer).toBe(0);
    });

    it('should update frame flags when a spare is rolled', () => {
      const players = createTestPlayers();
      const game: Game = {
        id: '1',
        date: '2025-05-29',
        players,
        frames: [],
        currentPlayer: 0,
        currentFrame: 0,
        isComplete: false,
      };

      let gameState = initializeGameFrames(game);
      gameState = addRoll(gameState, 5);
      gameState = addRoll(gameState, 5);

      expect(gameState.frames[0][0].rolls.length).toBe(2);
      expect(gameState.frames[0][0].rolls[0].pinsKnocked).toBe(5);
      expect(gameState.frames[0][0].rolls[1].pinsKnocked).toBe(5);
      expect(gameState.frames[0][0].isStrike).toBe(false);
      expect(gameState.frames[0][0].isSpare).toBe(true);

      // After a spare, should move to next frame
      expect(gameState.currentFrame).toBe(1);
      expect(gameState.currentPlayer).toBe(0);
    });

    it('should move to the next player after completing a frame', () => {
      const players = createTestPlayers();
      const game: Game = {
        id: '1',
        date: '2025-05-29',
        players,
        frames: [],
        currentPlayer: 0,
        currentFrame: 0,
        isComplete: false,
      };

      let gameState = initializeGameFrames(game);

      // First player completes a frame
      gameState = addRoll(gameState, 3);
      gameState = addRoll(gameState, 4);

      // Should move to next player, same frame
      expect(gameState.currentFrame).toBe(1);
      expect(gameState.currentPlayer).toBe(0);

      // Second player completes a frame
      gameState = addRoll(gameState, 2);
      gameState = addRoll(gameState, 3);

      // Should move back to first player, next frame
      expect(gameState.currentFrame).toBe(2);
      expect(gameState.currentPlayer).toBe(0);
    });

    it('should handle 10th frame special rules for strikes', () => {
      const players = [{ id: '1', name: 'Player 1' }];
      const game: Game = {
        id: '1',
        date: '2025-05-29',
        players,
        frames: [],
        currentPlayer: 0,
        currentFrame: 9, // 10th frame (0-based index)
        isComplete: false,
      };

      let gameState = initializeGameFrames(game);

      // Strike in 10th frame
      gameState = addRoll(gameState, 10);

      // Should stay on 10th frame for bonus rolls
      expect(gameState.currentFrame).toBe(9);
      expect(gameState.currentPlayer).toBe(0);
      expect(gameState.isComplete).toBe(false);

      // Bonus roll 1
      gameState = addRoll(gameState, 10);

      // Should still stay on 10th frame
      expect(gameState.currentFrame).toBe(9);
      expect(gameState.currentPlayer).toBe(0);
      expect(gameState.isComplete).toBe(false);

      // Bonus roll 2
      gameState = addRoll(gameState, 10);

      // Now game should be complete
      expect(gameState.isComplete).toBe(true);
    });
  });

  describe('createNewGame', () => {
    it('should create a new game with initialized frames', () => {
      const players = createTestPlayers();
      const game = createNewGame(players);

      expect(game.players).toEqual(players);
      expect(game.frames.length).toBe(players.length);
      expect(game.frames[0].length).toBe(10);
      expect(game.currentPlayer).toBe(0);
      expect(game.currentFrame).toBe(0);
      expect(game.isComplete).toBe(false);
      expect(game.id).toBeDefined();
      expect(game.date).toBeDefined();
    });
  });

  describe('isGameComplete', () => {
    it('should return false for a new game', () => {
      const players = createTestPlayers();
      const game = createNewGame(players);

      expect(isGameComplete(game)).toBe(false);
    });

    it('should return true when all players have completed all frames', () => {
      const players = [{ id: '1', name: 'Player 1' }];
      let game = createNewGame(players);

      // Roll a perfect game (12 strikes)
      for (let i = 0; i < 12; i++) {
        game = addRoll(game, 10);
      }

      expect(isGameComplete(game)).toBe(true);
    });
  });
});
