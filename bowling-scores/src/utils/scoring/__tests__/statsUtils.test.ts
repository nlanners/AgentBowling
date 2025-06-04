import {
  isPerfectGame,
  calculatePlayerPerformance,
  calculateAllPlayerPerformance,
  calculateGameStatistics,
  calculateFramePositionStatistics,
  calculateScoreDistribution,
  PlayerPerformance,
  GameStatistics,
} from '../statsUtils';
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

describe('Stats Utils Tests', () => {
  describe('isPerfectGame', () => {
    it('should return true for a perfect game (300)', () => {
      const players = [createPlayer('1', 'John')];
      const perfectFrames = Array(9)
        .fill(null)
        .map(() => createFrame([10], true, false, 30, 0));
      perfectFrames.push(createFrame([10, 10, 10], true, false, 30, 300));
      const frames = [perfectFrames];
      const game = createGame(players, frames, [300]);

      expect(isPerfectGame(game, '1')).toBe(true);
    });

    it('should return false for incomplete game', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [[createFrame([10], true)]];
      const game = { ...createGame(players, frames), isComplete: false };

      expect(isPerfectGame(game, '1')).toBe(false);
    });

    it('should return false for non-perfect score', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [[createFrame([9, 1], false, true)]];
      const game = createGame(players, frames, [250]);

      expect(isPerfectGame(game, '1')).toBe(false);
    });

    it('should return false for invalid player', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [[createFrame([10], true)]];
      const game = createGame(players, frames, [300]);

      expect(isPerfectGame(game, 'invalid')).toBe(false);
    });
  });

  describe('calculatePlayerPerformance', () => {
    it('should calculate performance for player with games', () => {
      const players = [createPlayer('1', 'John')];
      // Create frames with proper cumulative scores
      const game1Frames = [
        createFrame([10], true, false, 20, 20),
        createFrame([5, 5], false, true, 15, 35),
        ...Array(8).fill(createFrame([5, 3], false, false, 8, 50)),
      ];
      game1Frames[9] = createFrame([5, 3], false, false, 8, 150); // Set final score to 150

      const game2Frames = [
        createFrame([9, 1], false, true, 15, 15),
        createFrame([8, 1], false, false, 9, 24),
        ...Array(8).fill(createFrame([5, 2], false, false, 7, 50)),
      ];
      game2Frames[9] = createFrame([5, 2], false, false, 7, 120); // Set final score to 120

      const games = [
        createGame(players, [game1Frames], [150]),
        createGame(players, [game2Frames], [120]),
      ];

      const performance = calculatePlayerPerformance(games, '1');

      expect(performance.playerId).toBe('1');
      expect(performance.playerName).toBe('John');
      expect(performance.gamesPlayed).toBe(2);
      expect(performance.averageScore).toBe(135); // (150 + 120) / 2
      expect(performance.highScore).toBe(150);
      expect(performance.lowScore).toBe(120);
      expect(performance.scoreHistory).toEqual([150, 120]);
    });

    it('should return default stats for player with no games', () => {
      const performance = calculatePlayerPerformance([], '1');

      expect(performance.playerId).toBe('1');
      expect(performance.playerName).toBe('Unknown Player');
      expect(performance.gamesPlayed).toBe(0);
      expect(performance.averageScore).toBe(0);
      expect(performance.highScore).toBe(0);
      expect(performance.lowScore).toBe(0);
      expect(performance.perfectGameCount).toBe(0);
      expect(performance.scoreHistory).toEqual([]);
    });

    it('should filter out incomplete games', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [[createFrame([10], true)]];
      const incompleteGame = {
        ...createGame(players, frames),
        isComplete: false,
      };
      const completeGame = createGame(players, frames, [150]);

      const games = [incompleteGame, completeGame];
      const performance = calculatePlayerPerformance(games, '1');

      expect(performance.gamesPlayed).toBe(1);
    });
  });

  describe('calculateAllPlayerPerformance', () => {
    it('should calculate performance for all players', () => {
      const players = [createPlayer('1', 'John'), createPlayer('2', 'Jane')];
      const frames = [
        [createFrame([10], true), createFrame([5, 5], false, true)],
        [createFrame([9, 1], false, true), createFrame([8, 1], false, false)],
      ];
      const games = [createGame(players, frames, [150, 120])];

      const allPerformance = calculateAllPlayerPerformance(games);

      expect(allPerformance.length).toBe(2);
      expect(allPerformance[0].playerId).toBe('1');
      expect(allPerformance[1].playerId).toBe('2');
    });

    it('should handle empty games array', () => {
      const allPerformance = calculateAllPlayerPerformance([]);

      expect(allPerformance).toEqual([]);
    });
  });

  describe('calculateGameStatistics', () => {
    it('should calculate statistics for games with data', () => {
      const players = [createPlayer('1', 'John'), createPlayer('2', 'Jane')];
      const frames = [
        [createFrame([10], true), createFrame([5, 5], false, true)],
        [createFrame([9, 1], false, true), createFrame([8, 1], false, false)],
      ];
      const games = [createGame(players, frames, [150, 120])];

      const stats = calculateGameStatistics(games);

      expect(stats.gameCount).toBe(1);
      expect(stats.averageScore).toBe(135); // (150 + 120) / 2
      expect(stats.highestScore.score).toBe(150);
      expect(stats.highestScore.playerId).toBe('1');
      expect(stats.highestScore.playerName).toBe('John');
      expect(stats.playerCount).toBe(2);
    });

    it('should return default stats for empty games', () => {
      const stats = calculateGameStatistics([]);

      expect(stats.gameCount).toBe(0);
      expect(stats.averageScore).toBe(0);
      expect(stats.highestScore.score).toBe(0);
      expect(stats.strikePercentage).toBe(0);
      expect(stats.sparePercentage).toBe(0);
      expect(stats.perfectGameCount).toBe(0);
      expect(stats.playerCount).toBe(0);
    });

    it('should count strikes and spares correctly', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [
        [
          createFrame([10], true), // strike
          createFrame([5, 5], false, true), // spare
          createFrame([3, 4], false, false), // open
        ],
      ];
      const games = [createGame(players, frames, [150])];

      const stats = calculateGameStatistics(games);

      expect(stats.strikePercentage).toBe(33); // 1/3 = 33%
      expect(stats.sparePercentage).toBe(33); // 1/3 = 33%
    });
  });

  describe('calculateFramePositionStatistics', () => {
    it('should calculate statistics for each frame position', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [
        [
          createFrame([10], true, false, 20, 20), // Frame 1: Strike
          createFrame([5, 5], false, true, 15, 35), // Frame 2: Spare
          createFrame([3, 4], false, false, 7, 42), // Frame 3: Open
          ...Array(7).fill(createFrame([5, 3], false, false, 8, 50)),
        ],
      ];
      const games = [createGame(players, frames, [150])];

      const frameStats = calculateFramePositionStatistics(games);

      expect(frameStats.length).toBe(10);
      expect(frameStats[0].frameNumber).toBe(1);
      expect(frameStats[0].strikePercentage).toBe(100); // Frame 1 has 1 strike out of 1 game
      expect(frameStats[1].sparePercentage).toBe(100); // Frame 2 has 1 spare out of 1 game
      expect(frameStats[2].openPercentage).toBe(100); // Frame 3 has 1 open out of 1 game
    });

    it('should return default stats for empty games', () => {
      const frameStats = calculateFramePositionStatistics([]);

      expect(frameStats.length).toBe(10);
      frameStats.forEach((stat, index) => {
        expect(stat.frameNumber).toBe(index + 1);
        expect(stat.averageScore).toBe(0);
        expect(stat.strikePercentage).toBe(0);
        expect(stat.sparePercentage).toBe(0);
        expect(stat.openPercentage).toBe(0);
      });
    });
  });

  describe('calculateScoreDistribution', () => {
    it('should calculate score distribution correctly', () => {
      const players = [createPlayer('1', 'John')];
      const games = [
        createGame(players, [[]], [75]), // 0-50 range
        createGame(players, [[]], [125]), // 101-150 range
        createGame(players, [[]], [225]), // 201-250 range
        createGame(players, [[]], [275]), // 251-300 range
      ];

      const distribution = calculateScoreDistribution(games);

      expect(distribution.length).toBe(6);
      expect(distribution[1].range).toBe('51-100');
      expect(distribution[1].count).toBe(1); // Score 75
      expect(distribution[2].range).toBe('101-150');
      expect(distribution[2].count).toBe(1); // Score 125
      expect(distribution[4].range).toBe('201-250');
      expect(distribution[4].count).toBe(1); // Score 225
      expect(distribution[5].range).toBe('251-300');
      expect(distribution[5].count).toBe(1); // Score 275
    });

    it('should handle empty games', () => {
      const distribution = calculateScoreDistribution([]);

      expect(distribution.length).toBe(6);
      distribution.forEach((item) => {
        expect(item.count).toBe(0);
        expect(item.percentage).toBe(0);
      });
    });

    it('should calculate percentages correctly', () => {
      const players = [createPlayer('1', 'John')];
      const games = [
        createGame(players, [[]], [75]),
        createGame(players, [[]], [85]),
        createGame(players, [[]], [95]),
        createGame(players, [[]], [125]),
      ];

      const distribution = calculateScoreDistribution(games);

      expect(distribution[1].count).toBe(3); // 75, 85, 95 in 51-100 range
      expect(distribution[1].percentage).toBe(75); // 3/4 = 75%
      expect(distribution[2].count).toBe(1); // 125 in 101-150 range
      expect(distribution[2].percentage).toBe(25); // 1/4 = 25%
    });
  });
});
