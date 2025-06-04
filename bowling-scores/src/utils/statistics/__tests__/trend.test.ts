import {
  calculateScoreImprovement,
  calculateConsistencyScore,
  calculateRecentTrend,
  calculateRecentGamesAverage,
  calculateTrendStatistics,
  calculateFrameByFrameAverage,
} from '../trend';
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
  scores?: number[],
  date?: string
): Game => ({
  id: Math.random().toString(),
  date: date || '2023-05-01',
  players,
  frames,
  currentPlayer: 0,
  currentFrame: 0,
  isComplete: true,
  completed: true,
  scores,
});

describe('Trend Statistics Tests', () => {
  describe('calculateScoreImprovement', () => {
    it('should calculate positive improvement', () => {
      const players = [createPlayer('1', 'John')];
      const games = [
        createGame(players, [[]], [100]),
        createGame(players, [[]], [120]),
        createGame(players, [[]], [140]),
        createGame(players, [[]], [160]),
        createGame(players, [[]], [180]),
      ];

      const improvement = calculateScoreImprovement(games, '1');
      expect(improvement).toBe(50); // Average of last half (160, 180) = 170, first half (100, 120, 140) = 120, diff = 50
    });

    it('should calculate negative improvement (decline)', () => {
      const players = [createPlayer('1', 'John')];
      const games = [
        createGame(players, [[]], [180]),
        createGame(players, [[]], [160]),
        createGame(players, [[]], [140]),
        createGame(players, [[]], [120]),
        createGame(players, [[]], [100]),
      ];

      const improvement = calculateScoreImprovement(games, '1');
      expect(improvement).toBeLessThan(0); // Declining trend
    });

    it('should return 0 for insufficient scores', () => {
      expect(calculateScoreImprovement([], '1')).toBe(0);

      const players = [createPlayer('1', 'John')];
      const games = [createGame(players, [[]], [150])];
      expect(calculateScoreImprovement(games, '1')).toBe(0);
    });

    it('should handle no change in scores', () => {
      const players = [createPlayer('1', 'John')];
      const games = [
        createGame(players, [[]], [150]),
        createGame(players, [[]], [150]),
        createGame(players, [[]], [150]),
        createGame(players, [[]], [150]),
      ];

      const improvement = calculateScoreImprovement(games, '1');
      expect(improvement).toBe(0);
    });
  });

  describe('calculateConsistencyScore', () => {
    it('should calculate low consistency score for similar scores', () => {
      const players = [createPlayer('1', 'John')];
      const games = [
        createGame(players, [[]], [148]),
        createGame(players, [[]], [150]),
        createGame(players, [[]], [152]),
        createGame(players, [[]], [149]),
        createGame(players, [[]], [151]),
      ];

      const consistency = calculateConsistencyScore(games, '1');
      expect(consistency).toBeLessThan(5); // Very consistent (low standard deviation)
    });

    it('should calculate high consistency score for varied scores', () => {
      const players = [createPlayer('1', 'John')];
      const games = [
        createGame(players, [[]], [100]),
        createGame(players, [[]], [200]),
        createGame(players, [[]], [50]),
        createGame(players, [[]], [180]),
        createGame(players, [[]], [90]),
      ];

      const consistency = calculateConsistencyScore(games, '1');
      expect(consistency).toBeGreaterThan(50); // Very inconsistent (high standard deviation)
    });

    it('should return 0 for perfect consistency', () => {
      const players = [createPlayer('1', 'John')];
      const games = [
        createGame(players, [[]], [150]),
        createGame(players, [[]], [150]),
        createGame(players, [[]], [150]),
        createGame(players, [[]], [150]),
        createGame(players, [[]], [150]),
      ];

      const consistency = calculateConsistencyScore(games, '1');
      expect(consistency).toBe(0); // Perfect consistency (no deviation)
    });

    it('should return 0 for insufficient scores', () => {
      expect(calculateConsistencyScore([], '1')).toBe(0);

      const players = [createPlayer('1', 'John')];
      const games = [createGame(players, [[]], [150])];
      expect(calculateConsistencyScore(games, '1')).toBe(0);
    });
  });

  describe('calculateRecentTrend', () => {
    it('should identify positive recent trend', () => {
      const players = [createPlayer('1', 'John')];
      const games = [
        createGame(players, [[]], [120]),
        createGame(players, [[]], [130]),
        createGame(players, [[]], [140]),
      ];

      const trend = calculateRecentTrend(games, '1');
      expect(trend).toBe(20); // 140 - 120 = 20
    });

    it('should identify negative recent trend', () => {
      const players = [createPlayer('1', 'John')];
      const games = [
        createGame(players, [[]], [160]),
        createGame(players, [[]], [150]),
        createGame(players, [[]], [140]),
      ];

      const trend = calculateRecentTrend(games, '1');
      expect(trend).toBe(-20); // 140 - 160 = -20
    });

    it('should return 0 for insufficient data', () => {
      expect(calculateRecentTrend([], '1')).toBe(0);

      const players = [createPlayer('1', 'John')];
      const games = [createGame(players, [[]], [150])];
      expect(calculateRecentTrend(games, '1')).toBe(0);

      const games2 = [
        createGame(players, [[]], [150]),
        createGame(players, [[]], [160]),
      ];
      expect(calculateRecentTrend(games2, '1')).toBe(0);
    });

    it('should handle mixed trends correctly', () => {
      const players = [createPlayer('1', 'John')];
      const games = [
        createGame(players, [[]], [180]),
        createGame(players, [[]], [160]),
        createGame(players, [[]], [140]),
        createGame(players, [[]], [120]),
        createGame(players, [[]], [130]),
        createGame(players, [[]], [140]),
      ];

      const trend = calculateRecentTrend(games, '1'); // Last 3: [120, 130, 140]
      expect(trend).toBe(20); // 140 - 120 = 20 (recent improvement)
    });
  });

  describe('calculateRecentGamesAverage', () => {
    it('should calculate average of recent games', () => {
      const players = [createPlayer('1', 'John')];
      const games = [
        createGame(players, [[]], [100]),
        createGame(players, [[]], [120]),
        createGame(players, [[]], [140]),
        createGame(players, [[]], [160]),
        createGame(players, [[]], [180]),
        createGame(players, [[]], [200]),
      ];

      const average = calculateRecentGamesAverage(games, '1', 5);
      expect(average).toBe(160); // Average of [120, 140, 160, 180, 200] = 160
    });

    it('should handle fewer games than requested', () => {
      const players = [createPlayer('1', 'John')];
      const games = [
        createGame(players, [[]], [100]),
        createGame(players, [[]], [120]),
        createGame(players, [[]], [140]),
      ];

      const average = calculateRecentGamesAverage(games, '1', 5);
      expect(average).toBe(120); // Average of all 3 games
    });

    it('should return 0 for empty scores', () => {
      expect(calculateRecentGamesAverage([], '1', 5)).toBe(0);
    });

    it('should handle exactly requested number of games', () => {
      const players = [createPlayer('1', 'John')];
      const games = [
        createGame(players, [[]], [100]),
        createGame(players, [[]], [120]),
        createGame(players, [[]], [140]),
        createGame(players, [[]], [160]),
        createGame(players, [[]], [180]),
      ];

      const average = calculateRecentGamesAverage(games, '1', 5);
      expect(average).toBe(140); // Average of all 5 games
    });
  });

  describe('calculateTrendStatistics', () => {
    it('should calculate comprehensive trend statistics', () => {
      const players = [createPlayer('1', 'John')];

      // Create games with increasing scores (improvement trend)
      const games = Array.from({ length: 8 }, (_, i) => {
        const score = 120 + i * 10; // 120, 130, 140, ..., 190
        const frames = [
          Array(10).fill(createFrame([5, 3], false, false, 8, score)),
        ];
        return createGame(players, frames, [score]);
      });

      const trendStats = calculateTrendStatistics(games, '1');

      expect(trendStats.scoreImprovement).toBe(40); // Actual calculation result based on the implementation
      expect(trendStats.last5GamesAverage).toBe(170); // Average of last 5: [150,160,170,180,190]
      expect(trendStats.last10GamesAverage).toBe(155); // Average of all 8 games
      expect(trendStats.consistencyScore).toBeLessThan(30); // Very consistent improvement
    });

    it('should handle player with few games', () => {
      const players = [createPlayer('1', 'John')];
      const games = [
        createGame(players, [[]], [150]),
        createGame(players, [[]], [160]),
      ];

      const trendStats = calculateTrendStatistics(games, '1');

      expect(trendStats.scoreImprovement).toBe(10); // 160 - 150 = 10 (with 2 games, this is the difference)
      expect(trendStats.last5GamesAverage).toBe(155); // Average of 2 games
      expect(trendStats.last10GamesAverage).toBe(155);
    });

    it('should return default stats for player with no games', () => {
      const trendStats = calculateTrendStatistics([], 'player1');

      expect(trendStats.scoreImprovement).toBe(0);
      expect(trendStats.last5GamesAverage).toBe(0);
      expect(trendStats.last10GamesAverage).toBe(0);
      expect(trendStats.consistencyScore).toBe(0);
    });

    it('should handle declining performance', () => {
      const players = [createPlayer('1', 'John')];

      // Create games with decreasing scores
      const games = Array.from({ length: 6 }, (_, i) => {
        const score = 200 - i * 15; // 200, 185, 170, 155, 140, 125
        const frames = [
          Array(10).fill(createFrame([5, 3], false, false, 8, score)),
        ];
        return createGame(players, frames, [score]);
      });

      const trendStats = calculateTrendStatistics(games, '1');

      expect(trendStats.scoreImprovement).toBeLessThan(0); // Negative improvement
      expect(trendStats.consistencyScore).toBeLessThan(30); // Consistently declining
    });

    it('should handle inconsistent performance', () => {
      const players = [createPlayer('1', 'John')];

      // Create games with highly variable scores
      const scores = [100, 200, 80, 180, 90, 190];
      const games = scores.map((score) => {
        const frames = [
          Array(10).fill(createFrame([5, 3], false, false, 8, score)),
        ];
        return createGame(players, frames, [score]);
      });

      const trendStats = calculateTrendStatistics(games, '1');

      expect(trendStats.consistencyScore).toBeGreaterThan(40); // Very inconsistent
    });
  });
});
