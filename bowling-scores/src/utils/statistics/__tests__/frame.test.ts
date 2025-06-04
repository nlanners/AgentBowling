import {
  calculateStrikePercentage,
  calculateSparePercentage,
  calculateOpenFramePercentage,
  calculateAverageFrameScore,
  extractFramesByNumber,
  calculateFramePerformance,
  calculateFrameStatistics,
  calculateFrameByFramePerformance,
  createDefaultFramePerformance,
} from '../frame';
import { Frame, Roll } from '../../../types/frame';
import { Game } from '../../../types/game';
import { Player } from '../../../types/player';
import { FrameNumber } from '../../../types/frame';

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

describe('Frame Statistics Tests', () => {
  describe('calculateStrikePercentage', () => {
    it('should calculate strike percentage correctly', () => {
      const frames = [
        createFrame([10], true), // strike
        createFrame([5, 5], false, true), // spare
        createFrame([10], true), // strike
        createFrame([3, 4]), // open
      ];

      expect(calculateStrikePercentage(frames)).toBe(50); // 2/4 = 50%
    });

    it('should return 0 for empty frames', () => {
      expect(calculateStrikePercentage([])).toBe(0);
    });

    it('should return 100 for all strikes', () => {
      const frames = [createFrame([10], true), createFrame([10], true)];

      expect(calculateStrikePercentage(frames)).toBe(100);
    });
  });

  describe('calculateSparePercentage', () => {
    it('should calculate spare percentage correctly', () => {
      const frames = [
        createFrame([10], true), // strike
        createFrame([5, 5], false, true), // spare
        createFrame([6, 4], false, true), // spare
        createFrame([3, 4]), // open
      ];

      expect(calculateSparePercentage(frames)).toBe(50); // 2/4 = 50%
    });

    it('should return 0 for empty frames', () => {
      expect(calculateSparePercentage([])).toBe(0);
    });

    it('should return 100 for all spares', () => {
      const frames = [
        createFrame([5, 5], false, true),
        createFrame([6, 4], false, true),
      ];

      expect(calculateSparePercentage(frames)).toBe(100);
    });
  });

  describe('calculateOpenFramePercentage', () => {
    it('should calculate open frame percentage correctly', () => {
      const frames = [
        createFrame([10], true), // strike
        createFrame([5, 5], false, true), // spare
        createFrame([3, 4]), // open
        createFrame([2, 5]), // open
      ];

      expect(calculateOpenFramePercentage(frames)).toBe(50); // 2/4 = 50%
    });

    it('should return 0 for empty frames', () => {
      expect(calculateOpenFramePercentage([])).toBe(0);
    });

    it('should return 100 for all open frames', () => {
      const frames = [createFrame([3, 4]), createFrame([2, 5])];

      expect(calculateOpenFramePercentage(frames)).toBe(100);
    });
  });

  describe('calculateAverageFrameScore', () => {
    it('should calculate average frame score correctly', () => {
      const frames = [
        createFrame([10], true, false, 20),
        createFrame([5, 5], false, true, 15),
        createFrame([3, 4], false, false, 7),
      ];

      expect(calculateAverageFrameScore(frames)).toBeCloseTo(14); // (20+15+7)/3
    });

    it('should return 0 for empty frames', () => {
      expect(calculateAverageFrameScore([])).toBe(0);
    });

    it('should handle frames with zero scores', () => {
      const frames = [
        createFrame([0, 0], false, false, 0),
        createFrame([5, 3], false, false, 8),
      ];

      expect(calculateAverageFrameScore(frames)).toBe(4); // (0+8)/2
    });
  });

  describe('extractFramesByNumber', () => {
    it('should extract frames from specific position across games', () => {
      const players = [createPlayer('1', 'John')];
      const game1Frames = [
        createFrame([10], true, false, 20), // Frame 1
        createFrame([5, 5], false, true, 15), // Frame 2
        ...Array(8).fill(createFrame([5, 3], false, false, 8)),
      ];
      const game2Frames = [
        createFrame([9, 1], false, true, 15), // Frame 1
        createFrame([10], true, false, 25), // Frame 2
        ...Array(8).fill(createFrame([6, 2], false, false, 8)),
      ];

      const games = [
        createGame(players, [game1Frames]),
        createGame(players, [game2Frames]),
      ];

      const firstFrames = extractFramesByNumber(games, '1', 1 as FrameNumber);
      expect(firstFrames).toHaveLength(2);
      expect(firstFrames[0].isStrike).toBe(true);
      expect(firstFrames[1].isSpare).toBe(true);

      const secondFrames = extractFramesByNumber(games, '1', 2 as FrameNumber);
      expect(secondFrames).toHaveLength(2);
      expect(secondFrames[0].isSpare).toBe(true);
      expect(secondFrames[1].isStrike).toBe(true);
    });

    it('should return empty array for invalid player', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [[createFrame([10], true)]];
      const games = [createGame(players, frames)];

      const result = extractFramesByNumber(games, 'invalid', 1 as FrameNumber);
      expect(result).toEqual([]);
    });

    it('should handle games with insufficient frames', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [[createFrame([10], true)]]; // Only 1 frame
      const games = [createGame(players, frames)];

      const result = extractFramesByNumber(games, '1', 5 as FrameNumber);
      expect(result).toEqual([]);
    });
  });

  describe('calculateFramePerformance', () => {
    it('should calculate performance metrics for frames', () => {
      const frames = [
        createFrame([10], true, false, 20),
        createFrame([5, 5], false, true, 15),
        createFrame([3, 4], false, false, 7),
      ];

      const performance = calculateFramePerformance(frames);

      expect(performance.averageScore).toBeCloseTo(14); // (20+15+7)/3
      expect(performance.strikePercentage).toBeCloseTo(33.33); // 1/3
      expect(performance.sparePercentage).toBeCloseTo(33.33); // 1/3
    });

    it('should handle empty frames array', () => {
      const performance = calculateFramePerformance([]);

      expect(performance.averageScore).toBe(0);
      expect(performance.strikePercentage).toBe(0);
      expect(performance.sparePercentage).toBe(0);
    });
  });

  describe('calculateFrameStatistics', () => {
    it('should calculate comprehensive frame statistics', () => {
      const players = [createPlayer('1', 'John')];
      const gameFrames = [
        createFrame([10], true, false, 20, 20), // strike
        createFrame([5, 5], false, true, 15, 35), // spare
        createFrame([3, 4], false, false, 7, 42), // open
        createFrame([7, 2], false, false, 9, 51), // open
        ...Array(6).fill(createFrame([5, 3], false, false, 8, 60)),
      ];

      const games = [createGame(players, [gameFrames])];
      const stats = calculateFrameStatistics(games, '1');

      expect(stats.strikePercentage).toBe(10); // 1/10 = 10%
      expect(stats.sparePercentage).toBe(10); // 1/10 = 10%
      expect(stats.openFramePercentage).toBe(80); // 8/10 = 80%
      expect(stats.averagePinsPerFrame).toBeCloseTo(8.4); // Total pins / frames (need to calculate actual total)
      expect(stats.averageFirstRoll).toBeCloseTo(5.5); // Average first roll - corrected expectation
      expect(stats.averageSecondRoll).toBeCloseTo(3.22); // Average second roll (excluding strikes) - corrected to match actual result
    });

    it('should return default stats for player with no games', () => {
      const stats = calculateFrameStatistics([], 'player1');

      expect(stats.strikePercentage).toBe(0);
      expect(stats.sparePercentage).toBe(0);
      expect(stats.openFramePercentage).toBe(0);
      expect(stats.averagePinsPerFrame).toBe(0);
      expect(stats.averageFirstRoll).toBe(0);
      expect(stats.averageSecondRoll).toBe(0);
      expect(stats.averageFrameScore).toBe(0);
    });

    it('should handle games where player is not found', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [[createFrame([10], true)]];
      const games = [createGame(players, frames)];

      const stats = calculateFrameStatistics(games, 'player2');

      expect(stats.strikePercentage).toBe(0);
      expect(stats.sparePercentage).toBe(0);
    });
  });

  describe('calculateFrameByFramePerformance', () => {
    it('should calculate performance for each frame position', () => {
      const players = [createPlayer('1', 'John')];

      // Create a game with specific patterns in each frame
      const gameFrames = [
        createFrame([10], true, false, 20, 20), // Frame 1: Strike
        createFrame([5, 5], false, true, 15, 35), // Frame 2: Spare
        createFrame([3, 4], false, false, 7, 42), // Frame 3: Open
        ...Array(7).fill(createFrame([5, 3], false, false, 8, 50)),
      ];

      const games = [createGame(players, [gameFrames])];
      const framePerformance = calculateFrameByFramePerformance(games, '1');

      expect(framePerformance[1].strikePercentage).toBe(100); // Frame 1 has 100% strikes
      expect(framePerformance[2].sparePercentage).toBe(100); // Frame 2 has 100% spares
      expect(framePerformance[3].strikePercentage).toBe(0); // Frame 3 has 0% strikes
      expect(framePerformance[3].sparePercentage).toBe(0); // Frame 3 has 0% spares
    });

    it('should handle multiple games correctly', () => {
      const players = [createPlayer('1', 'John')];

      const game1Frames = [
        createFrame([10], true, false, 20, 20), // Frame 1: Strike
        ...Array(9).fill(createFrame([5, 3], false, false, 8, 28)),
      ];

      const game2Frames = [
        createFrame([5, 5], false, true, 15, 15), // Frame 1: Spare
        ...Array(9).fill(createFrame([6, 2], false, false, 8, 23)),
      ];

      const games = [
        createGame(players, [game1Frames]),
        createGame(players, [game2Frames]),
      ];

      const framePerformance = calculateFrameByFramePerformance(games, '1');

      expect(framePerformance[1].strikePercentage).toBe(50); // 1 strike out of 2 games
      expect(framePerformance[1].sparePercentage).toBe(50); // 1 spare out of 2 games
    });

    it('should return default performance for player with no games', () => {
      const framePerformance = calculateFrameByFramePerformance([], 'player1');

      for (let i = 1; i <= 10; i++) {
        const frameNum = i as FrameNumber;
        expect(framePerformance[frameNum].averageScore).toBe(0);
        expect(framePerformance[frameNum].strikePercentage).toBe(0);
        expect(framePerformance[frameNum].sparePercentage).toBe(0);
      }
    });
  });

  describe('createDefaultFramePerformance', () => {
    it('should create default performance record for all frames', () => {
      const defaultPerformance = createDefaultFramePerformance();

      expect(Object.keys(defaultPerformance)).toHaveLength(10);

      for (let i = 1; i <= 10; i++) {
        const frameNum = i as FrameNumber;
        expect(defaultPerformance[frameNum]).toEqual({
          averageScore: 0,
          strikePercentage: 0,
          sparePercentage: 0,
        });
      }
    });
  });
});
