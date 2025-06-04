import {
  calculateStrikes,
  calculateSpares,
  calculateOpenFrames,
  calculateAveragePinsPerRoll,
  calculateGamePlayerStatistics,
  calculateBasicStatistics,
  calculateAllPlayersBasicStatistics,
} from '../basic';
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

describe('Basic Statistics Tests', () => {
  describe('calculateStrikes', () => {
    it('should count strikes correctly', () => {
      const frames = [
        createFrame([10], true), // strike
        createFrame([5, 5], false, true), // spare
        createFrame([10], true), // strike
        createFrame([3, 4]), // open
      ];

      expect(calculateStrikes(frames)).toBe(2);
    });

    it('should return 0 for frames with no strikes', () => {
      const frames = [createFrame([5, 5], false, true), createFrame([3, 4])];

      expect(calculateStrikes(frames)).toBe(0);
    });

    it('should handle empty frames array', () => {
      expect(calculateStrikes([])).toBe(0);
    });
  });

  describe('calculateSpares', () => {
    it('should count spares correctly', () => {
      const frames = [
        createFrame([10], true), // strike
        createFrame([5, 5], false, true), // spare
        createFrame([6, 4], false, true), // spare
        createFrame([3, 4]), // open
      ];

      expect(calculateSpares(frames)).toBe(2);
    });

    it('should return 0 for frames with no spares', () => {
      const frames = [createFrame([10], true), createFrame([3, 4])];

      expect(calculateSpares(frames)).toBe(0);
    });

    it('should handle empty frames array', () => {
      expect(calculateSpares([])).toBe(0);
    });
  });

  describe('calculateOpenFrames', () => {
    it('should count open frames correctly', () => {
      const frames = [
        createFrame([10], true), // strike
        createFrame([5, 5], false, true), // spare
        createFrame([3, 4]), // open
        createFrame([2, 5]), // open
      ];

      expect(calculateOpenFrames(frames)).toBe(2);
    });

    it('should return 0 for frames with no open frames', () => {
      const frames = [
        createFrame([10], true),
        createFrame([5, 5], false, true),
      ];

      expect(calculateOpenFrames(frames)).toBe(0);
    });

    it('should handle empty frames array', () => {
      expect(calculateOpenFrames([])).toBe(0);
    });
  });

  describe('calculateAveragePinsPerRoll', () => {
    it('should calculate average pins per roll correctly', () => {
      const frames = [
        createFrame([10]), // 1 roll, 10 pins
        createFrame([5, 3]), // 2 rolls, 8 pins total
        createFrame([7, 2]), // 2 rolls, 9 pins total
      ];

      // Total: 27 pins in 5 rolls = 5.4 average
      expect(calculateAveragePinsPerRoll(frames)).toBeCloseTo(5.4);
    });

    it('should return 0 for empty frames', () => {
      expect(calculateAveragePinsPerRoll([])).toBe(0);
    });

    it('should handle frames with no rolls', () => {
      const frames = [createFrame([])];
      expect(calculateAveragePinsPerRoll(frames)).toBe(0);
    });
  });

  describe('calculateGamePlayerStatistics', () => {
    it('should calculate complete game statistics for a player', () => {
      const frames = [
        createFrame([10], true), // strike
        createFrame([5, 5], false, true), // spare
        createFrame([3, 4]), // open
      ];
      const score = 150;

      const stats = calculateGamePlayerStatistics('player1', frames, score);

      expect(stats.playerId).toBe('player1');
      expect(stats.score).toBe(150);
      expect(stats.strikes).toBe(1);
      expect(stats.spares).toBe(1);
      expect(stats.openFrames).toBe(1);
      expect(stats.averagePinsPerRoll).toBeCloseTo(5.4); // 27 pins in 5 rolls: (10 + 5 + 5 + 3 + 4) = 27, 27/5 = 5.4
    });
  });

  describe('calculateBasicStatistics', () => {
    it('should calculate basic statistics for a player across multiple games', () => {
      const players = [createPlayer('1', 'John')];

      const game1Frames = [
        createFrame([10], true, false, 30, 30),
        createFrame([5, 5], false, true, 20, 50),
        ...Array(8).fill(createFrame([5, 3], false, false, 8, 58)),
      ];
      game1Frames[9] = createFrame([5, 3], false, false, 8, 180);

      const game2Frames = [
        createFrame([7, 3], false, true, 15, 15),
        createFrame([10], true, false, 25, 40),
        ...Array(8).fill(createFrame([6, 2], false, false, 8, 48)),
      ];
      game2Frames[9] = createFrame([6, 2], false, false, 8, 160);

      const games = [
        createGame(players, [game1Frames], [180]),
        createGame(players, [game2Frames], [160]),
      ];

      const stats = calculateBasicStatistics(games, '1');

      expect(stats.gamesPlayed).toBe(2);
      expect(stats.averageScore).toBe(170); // (180 + 160) / 2
      expect(stats.highScore).toBe(180);
      expect(stats.lowScore).toBe(160);
      expect(stats.strikeCount).toBe(2); // 1 in each game
      expect(stats.spareCount).toBe(2); // 1 in each game
      expect(stats.openFrameCount).toBe(16); // 8 in each game
    });

    it('should return default stats for player with no games', () => {
      const stats = calculateBasicStatistics([], 'player1');

      expect(stats.gamesPlayed).toBe(0);
      expect(stats.averageScore).toBe(0);
      expect(stats.highScore).toBe(0);
      expect(stats.lowScore).toBe(0);
      expect(stats.strikeCount).toBe(0);
      expect(stats.spareCount).toBe(0);
      expect(stats.openFrameCount).toBe(0);
      expect(stats.perfectGameCount).toBe(0);
    });

    it('should count perfect games correctly', () => {
      const players = [createPlayer('1', 'John')];

      // Perfect game
      const perfectFrames = Array(9)
        .fill(null)
        .map(() => createFrame([10], true, false, 30, 30));
      perfectFrames.push(createFrame([10, 10, 10], true, false, 30, 300));

      // Regular game
      const regularFrames = Array(10)
        .fill(null)
        .map(() => createFrame([5, 3], false, false, 8, 80));

      const games = [
        createGame(players, [perfectFrames], [300]),
        createGame(players, [regularFrames], [80]),
      ];

      const stats = calculateBasicStatistics(games, '1');

      expect(stats.perfectGameCount).toBe(1);
      expect(stats.gamesPlayed).toBe(2);
    });

    it('should handle games where player is not found', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [[createFrame([10], true)]];
      const games = [createGame(players, frames, [150])];

      const stats = calculateBasicStatistics(games, 'player2'); // Different player

      expect(stats.gamesPlayed).toBe(0);
    });
  });

  describe('calculateAllPlayersBasicStatistics', () => {
    it('should calculate statistics for all players', () => {
      const players = [createPlayer('1', 'John'), createPlayer('2', 'Jane')];

      const frames = [
        [createFrame([10], true, false, 30, 150)],
        [createFrame([5, 5], false, true, 15, 120)],
      ];

      const games = [createGame(players, frames, [150, 120])];
      const allStats = calculateAllPlayersBasicStatistics(games);

      expect(allStats.size).toBe(2);
      expect(allStats.get('1')?.gamesPlayed).toBe(1);
      expect(allStats.get('2')?.gamesPlayed).toBe(1);
      expect(allStats.get('1')?.averageScore).toBe(150);
      expect(allStats.get('2')?.averageScore).toBe(120);
    });

    it('should handle empty games array', () => {
      const allStats = calculateAllPlayersBasicStatistics([]);

      expect(allStats.size).toBe(0);
    });

    it('should handle multiple games with same players', () => {
      const players = [createPlayer('1', 'John')];

      const games = [
        createGame(players, [[createFrame([10], true, false, 30, 150)]], [150]),
        createGame(
          players,
          [[createFrame([5, 5], false, true, 15, 120)]],
          [120]
        ),
      ];

      const allStats = calculateAllPlayersBasicStatistics(games);

      expect(allStats.size).toBe(1);
      expect(allStats.get('1')?.gamesPlayed).toBe(2);
      expect(allStats.get('1')?.averageScore).toBe(135); // (150 + 120) / 2
    });
  });
});
