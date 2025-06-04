import {
  calculateFirstRollAverage,
  calculateSecondRollAverage,
  calculatePinsDistribution,
  calculateSpareConversionRates,
  calculateCommonPinPatterns,
  calculateRollStatistics,
} from '../roll';
import { Frame, Roll } from '../../../types/frame';
import { Game } from '../../../types/game';
import { Player } from '../../../types/player';

// Helper functions to create test objects
const createRoll = (pinsKnocked: number): Roll => ({ pinsKnocked });

const createFrame = (
  rolls: number[],
  isStrike = false,
  isSpare = false,
  score = 0,
  cumulativeScore = 0
): Frame => ({
  rolls: rolls.map((pins) => createRoll(pins)),
  score,
  cumulativeScore,
  isStrike,
  isSpare,
});

const createPlayer = (id: string, name: string): Player => ({
  id,
  name,
});

const createGame = (
  players: Player[],
  frames: Frame[][],
  scores?: number[]
): Game => ({
  id: '1',
  date: '2023-05-01',
  players,
  frames,
  currentPlayer: 0,
  currentFrame: 0,
  isComplete: true,
  completed: true,
  scores,
});

describe('Roll Statistics Tests', () => {
  describe('calculateFirstRollAverage', () => {
    it('should calculate average pins on first roll', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [
        createFrame([10]), // strike
        createFrame([7, 3]), // first roll: 7
        createFrame([6, 2]), // first roll: 6
        createFrame([5, 4]), // first roll: 5
      ];
      const games = [createGame(players, [frames])];

      const average = calculateFirstRollAverage(games, '1');
      expect(average).toBeCloseTo(7); // (10 + 7 + 6 + 5) / 4 = 7
    });

    it('should handle empty games', () => {
      expect(calculateFirstRollAverage([], '1')).toBe(0);
    });

    it('should handle invalid player', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [createFrame([10])];
      const games = [createGame(players, [frames])];
      expect(calculateFirstRollAverage(games, 'invalid')).toBe(0);
    });

    it('should handle only strikes', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [
        createFrame([10], true),
        createFrame([10], true),
        createFrame([10], true),
      ];
      const games = [createGame(players, [frames])];

      const average = calculateFirstRollAverage(games, '1');
      expect(average).toBe(10);
    });
  });

  describe('calculateSecondRollAverage', () => {
    it('should calculate average pins on second roll (excluding strikes)', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [
        createFrame([10], true), // strike - no second roll
        createFrame([7, 3]), // second roll: 3
        createFrame([6, 2]), // second roll: 2
        createFrame([5, 4]), // second roll: 4
      ];
      const games = [createGame(players, [frames])];

      const average = calculateSecondRollAverage(games, '1');
      expect(average).toBe(3); // (3 + 2 + 4) / 3 = 3
    });

    it('should return 0 when no second rolls exist', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [createFrame([10], true), createFrame([10], true)];
      const games = [createGame(players, [frames])];

      expect(calculateSecondRollAverage(games, '1')).toBe(0);
    });

    it('should handle empty games', () => {
      expect(calculateSecondRollAverage([], '1')).toBe(0);
    });

    it('should handle invalid player', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [createFrame([7, 3])];
      const games = [createGame(players, [frames])];
      expect(calculateSecondRollAverage(games, 'invalid')).toBe(0);
    });
  });

  describe('calculatePinsDistribution', () => {
    it('should count frequency of each pin count', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [
        createFrame([10]), // 10 pins
        createFrame([7, 3]), // 7 pins, 3 pins
        createFrame([6, 2]), // 6 pins, 2 pins
        createFrame([0, 5]), // 0 pins, 5 pins
      ];
      const games = [createGame(players, [frames])];

      const distribution = calculatePinsDistribution(games, '1');

      expect(distribution[0]).toBe(1); // One roll with 0 pins
      expect(distribution[2]).toBe(1); // One roll with 2 pins
      expect(distribution[3]).toBe(1); // One roll with 3 pins
      expect(distribution[5]).toBe(1); // One roll with 5 pins
      expect(distribution[6]).toBe(1); // One roll with 6 pins
      expect(distribution[7]).toBe(1); // One roll with 7 pins
      expect(distribution[10]).toBe(1); // One roll with 10 pins
      expect(distribution[1]).toBe(0); // No rolls with 1 pin
    });

    it('should return array of zeros for empty games', () => {
      const distribution = calculatePinsDistribution([], '1');
      expect(distribution).toHaveLength(11); // 0-10 pins
      expect(distribution.every((count) => count === 0)).toBe(true);
    });

    it('should handle multiple occurrences', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [
        createFrame([5, 5]),
        createFrame([5, 3]),
        createFrame([5, 2]),
      ];
      const games = [createGame(players, [frames])];

      const distribution = calculatePinsDistribution(games, '1');
      expect(distribution[5]).toBe(4); // Four rolls with 5 pins (3 first rolls + 1 second roll)
      expect(distribution[3]).toBe(1); // One roll with 3 pins
      expect(distribution[2]).toBe(1); // One roll with 2 pins
    });
  });

  describe('calculateSpareConversionRates', () => {
    it('should calculate spare conversion rates by pin count', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [
        createFrame([7, 3], false, true), // 7-pin spare converted
        createFrame([7, 2]), // 7-pin spare missed
        createFrame([6, 4], false, true), // 6-pin spare converted
        createFrame([6, 3]), // 6-pin spare missed
        createFrame([6, 4], false, true), // 6-pin spare converted
        createFrame([10], true), // strike (not counted)
      ];
      const games = [createGame(players, [frames])];

      const rates = calculateSpareConversionRates(games, '1');

      expect(rates[7]).toBeCloseTo(50); // 1 converted out of 2 attempts = 50%
      expect(rates[6]).toBeCloseTo(66.67); // 2 converted out of 3 attempts = 66.67%
      expect(rates[10] || 0).toBe(0); // Strikes don't count as spare attempts
    });

    it('should handle no spare attempts', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [createFrame([10], true), createFrame([10], true)];
      const games = [createGame(players, [frames])];

      const rates = calculateSpareConversionRates(games, '1');
      expect(Object.values(rates).every((rate) => rate === 0)).toBe(true);
    });

    it('should return zeros for empty games', () => {
      const rates = calculateSpareConversionRates([], '1');
      expect(Object.keys(rates)).toContain('0');
      expect(Object.values(rates).every((rate) => rate === 0)).toBe(true);
    });
  });

  describe('calculateCommonPinPatterns', () => {
    it('should identify most common pin combinations', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [
        createFrame([7, 3]),
        createFrame([7, 3]),
        createFrame([7, 3]),
        createFrame([6, 4]),
        createFrame([6, 4]),
        createFrame([5, 2]),
      ];
      const games = [createGame(players, [frames])];

      const patterns = calculateCommonPinPatterns(games, '1');

      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns[0]).toEqual({ pattern: '7-3', count: 3 });
      expect(patterns[1]).toEqual({ pattern: '6-4', count: 2 });
      expect(patterns[2]).toEqual({ pattern: '5-2', count: 1 });
    });

    it('should handle strikes as single-roll patterns', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [
        createFrame([10], true),
        createFrame([10], true),
        createFrame([5, 3]),
      ];
      const games = [createGame(players, [frames])];

      const patterns = calculateCommonPinPatterns(games, '1');

      expect(patterns[0]).toEqual({ pattern: '10', count: 2 });
      expect(patterns[1]).toEqual({ pattern: '5-3', count: 1 });
    });

    it('should return empty array for empty games', () => {
      const patterns = calculateCommonPinPatterns([], '1');
      expect(patterns).toEqual([]);
    });
  });

  describe('calculateRollStatistics', () => {
    it('should calculate comprehensive roll statistics', () => {
      const players = [createPlayer('1', 'John')];
      const gameFrames = [
        createFrame([10], true, false, 30, 30),
        createFrame([7, 3], false, true, 20, 50),
        createFrame([6, 2], false, false, 8, 58),
        createFrame([5, 4], false, false, 9, 67),
        createFrame([8, 1], false, false, 9, 76),
        createFrame([9, 0], false, false, 9, 85),
        createFrame([4, 6], false, true, 15, 100),
        createFrame([3, 5], false, false, 8, 108),
        createFrame([2, 7], false, false, 9, 117),
        createFrame([1, 8], false, false, 9, 126),
      ];

      const games = [createGame(players, [gameFrames])];
      const rollStats = calculateRollStatistics(games, '1');

      expect(rollStats.firstRollAverage).toBeCloseTo(5.5); // Average of first rolls
      expect(rollStats.secondRollAverage).toBeCloseTo(4); // Average of second rolls (excluding strikes) - adjusted expectation
      expect(rollStats.pinsDistribution).toHaveLength(11); // 0-10 pins
    });

    it('should return default stats for player with no games', () => {
      const rollStats = calculateRollStatistics([], 'player1');

      expect(rollStats.firstRollAverage).toBe(0);
      expect(rollStats.secondRollAverage).toBe(0);
      expect(rollStats.pinsDistribution.every((count) => count === 0)).toBe(
        true
      );
    });

    it('should handle games where player is not found', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [[createFrame([10], true)]];
      const games = [createGame(players, frames)];

      const rollStats = calculateRollStatistics(games, 'player2');

      expect(rollStats.firstRollAverage).toBe(0);
      expect(rollStats.secondRollAverage).toBe(0);
    });

    it('should handle multiple games correctly', () => {
      const players = [createPlayer('1', 'John')];

      const game1Frames = [
        createFrame([10], true),
        createFrame([7, 3], false, true),
        ...Array(8).fill(createFrame([5, 3], false, false, 8, 50)),
      ];

      const game2Frames = [
        createFrame([9, 1], false, true),
        createFrame([8, 2], false, true),
        ...Array(8).fill(createFrame([6, 2], false, false, 8, 60)),
      ];

      const games = [
        createGame(players, [game1Frames]),
        createGame(players, [game2Frames]),
      ];

      const rollStats = calculateRollStatistics(games, '1');

      expect(rollStats.firstRollAverage).toBeGreaterThan(0);
      expect(rollStats.pinsDistribution[5]).toBeGreaterThan(0); // Should have some 5-pin rolls
      expect(rollStats.pinsDistribution[6]).toBeGreaterThan(0); // Should have some 6-pin rolls
    });
  });
});
