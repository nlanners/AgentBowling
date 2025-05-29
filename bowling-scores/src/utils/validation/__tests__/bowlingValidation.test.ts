import {
  validateGameState,
  validateFrame,
  validateScoreCalculation,
  validatePlayerName,
  validateGameCreation,
  validateRollAttempt,
  validateRollSequence,
  validateRoll,
} from '../bowlingValidation';
import { Frame } from '../../../types/frame';
import { Game } from '../../../types/game';
import { Player } from '../../../types/player';

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

describe('Bowling Validation Tests', () => {
  describe('validatePlayerName', () => {
    it('should validate correct player names', () => {
      expect(validatePlayerName('John').valid).toBe(true);
      expect(validatePlayerName('Jane Doe').valid).toBe(true);
      expect(validatePlayerName('Player 1').valid).toBe(true);
    });

    it('should reject empty player names', () => {
      const result = validatePlayerName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject too long player names', () => {
      const longName = 'A'.repeat(31);
      const result = validatePlayerName(longName);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateGameCreation', () => {
    it('should validate a valid player list', () => {
      const players = [createPlayer('1', 'John'), createPlayer('2', 'Jane')];

      const result = validateGameCreation(players);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should reject an empty player list', () => {
      const result = validateGameCreation([]);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject a player list with duplicate names', () => {
      const players = [createPlayer('1', 'John'), createPlayer('2', 'John')];

      const result = validateGameCreation(players);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateFrame', () => {
    it('should validate a valid open frame', () => {
      const frame = createFrame([3, 4]);
      const result = validateFrame(frame, false);
      expect(result.valid).toBe(true);
    });

    it('should validate a valid strike frame', () => {
      const frame = createFrame([10], true);
      const result = validateFrame(frame, false);
      expect(result.valid).toBe(true);
    });

    it('should validate a valid spare frame', () => {
      const frame = createFrame([5, 5], false, true);
      const result = validateFrame(frame, false);
      expect(result.valid).toBe(true);
    });

    it('should reject a frame with too many rolls', () => {
      const frame = createFrame([1, 2, 3]);
      const result = validateFrame(frame, false);
      expect(result.valid).toBe(false);
    });

    it('should reject a frame with invalid pin count', () => {
      const frame = createFrame([11, 0]);
      const result = validateFrame(frame, false);
      expect(result.valid).toBe(false);
    });

    it('should validate a 10th frame with extra rolls for strike', () => {
      const frame = createFrame([10, 10, 10], true);
      const result = validateFrame(frame, true);
      expect(result.valid).toBe(true);
    });

    it('should validate a 10th frame with extra rolls for spare', () => {
      const frame = createFrame([5, 5, 10], false, true);
      const result = validateFrame(frame, true);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateScoreCalculation', () => {
    it('should validate correct score calculations', () => {
      const frames = [
        createFrame([1, 2]), // 3
        createFrame([3, 4]), // 7 (10 cumulative)
      ];
      frames[0].score = 3;
      frames[0].cumulativeScore = 3;
      frames[1].score = 7;
      frames[1].cumulativeScore = 10;

      const result = validateScoreCalculation(frames);
      expect(result.valid).toBe(true);
    });

    it('should detect incorrect frame scores', () => {
      const frames = [
        createFrame([1, 2]), // Should be 3
        createFrame([3, 4]), // Should be 7 (10 cumulative)
      ];
      frames[0].score = 5; // Incorrect
      frames[0].cumulativeScore = 5;
      frames[1].score = 7;
      frames[1].cumulativeScore = 12;

      const result = validateScoreCalculation(frames);
      expect(result.valid).toBe(false);
    });

    it('should detect incorrect cumulative scores', () => {
      const frames = [
        createFrame([1, 2]), // 3
        createFrame([3, 4]), // 7 (10 cumulative)
      ];
      frames[0].score = 3;
      frames[0].cumulativeScore = 3;
      frames[1].score = 7;
      frames[1].cumulativeScore = 12; // Incorrect

      const result = validateScoreCalculation(frames);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateRollSequence', () => {
    it('should validate a valid roll sequence', () => {
      const rolls = [10, 10, 9, 1, 5, 5, 7, 2];
      const result = validateRollSequence(rolls);
      expect(result.valid).toBe(true);
    });

    it('should reject a sequence with invalid pin counts', () => {
      const rolls = [10, 11, 5]; // 11 is invalid
      const result = validateRollSequence(rolls);
      expect(result.valid).toBe(false);
    });

    it('should reject a sequence with too many pins in a frame', () => {
      const rolls = [5, 6]; // Frame sum > 10
      const result = validateRollSequence(rolls);
      expect(result.valid).toBe(false);
    });

    it('should validate a perfect game', () => {
      const rolls = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]; // 12 strikes
      const result = validateRollSequence(rolls);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateGameState', () => {
    it('should validate a valid game state', () => {
      const players = [createPlayer('1', 'John'), createPlayer('2', 'Jane')];
      const frames = [
        [
          createFrame([1, 2]),
          createFrame([3, 4]),
          ...Array(8).fill(createFrame([])),
        ],
        [
          createFrame([5, 4]),
          createFrame([10], true),
          ...Array(8).fill(createFrame([])),
        ],
      ];

      frames[0][0].score = 3;
      frames[0][0].cumulativeScore = 3;
      frames[0][1].score = 7;
      frames[0][1].cumulativeScore = 10;

      frames[1][0].score = 9;
      frames[1][0].cumulativeScore = 9;
      frames[1][1].score = 10;
      frames[1][1].cumulativeScore = 19;

      const game = createGame(players, frames);
      const result = validateGameState(game);
      expect(result.valid).toBe(true);
    });

    it('should reject a game with no players', () => {
      const game = createGame([], []);
      const result = validateGameState(game);
      expect(result.valid).toBe(false);
    });

    it('should reject a game with mismatched frame arrays', () => {
      const players = [createPlayer('1', 'John'), createPlayer('2', 'Jane')];
      const frames = [
        [
          createFrame([1, 2]),
          createFrame([3, 4]),
          ...Array(8).fill(createFrame([])),
        ],
      ];

      const game = {
        ...createGame(players, frames),
        frames,
      };
      const result = validateGameState(game);
      expect(result.valid).toBe(false);
    });

    it('should reject a game with invalid current player index', () => {
      const players = [createPlayer('1', 'John'), createPlayer('2', 'Jane')];
      const frames = [
        [
          createFrame([1, 2]),
          createFrame([3, 4]),
          ...Array(8).fill(createFrame([])),
        ],
        [
          createFrame([5, 4]),
          createFrame([10], true),
          ...Array(8).fill(createFrame([])),
        ],
      ];

      frames[0][0].score = 3;
      frames[0][0].cumulativeScore = 3;
      frames[0][1].score = 7;
      frames[0][1].cumulativeScore = 10;

      frames[1][0].score = 9;
      frames[1][0].cumulativeScore = 9;
      frames[1][1].score = 10;
      frames[1][1].cumulativeScore = 19;

      const game = {
        ...createGame(players, frames),
        currentPlayer: 5,
      };
      const result = validateGameState(game);
      expect(result.valid).toBe(false);
    });
  });
});
