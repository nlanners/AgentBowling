/**
 * Tests for statistics index.ts file
 * Covers game statistics calculation, player statistics, and utility functions
 */

import {
  calculateGameStatistics,
  calculateAveragePinsPerRoll,
  calculatePlayerStatistics,
  calculateAllPlayersStatistics,
} from '../index';
import {
  Game,
  Player,
  Frame,
  GameStatistics,
  PlayerStatistics,
} from '../../../types';

// Mock data for testing
const mockPlayer1: Player = {
  id: 'player1',
  name: 'Alice',
  isActive: true,
};

const mockPlayer2: Player = {
  id: 'player2',
  name: 'Bob',
  isActive: true,
};

const mockFrames1: Frame[] = [
  {
    rolls: [{ pinsKnocked: 10 }],
    score: 30,
    cumulativeScore: 30,
    isStrike: true,
    isSpare: false,
  },
  {
    rolls: [{ pinsKnocked: 7 }, { pinsKnocked: 3 }],
    score: 20,
    cumulativeScore: 50,
    isStrike: false,
    isSpare: true,
  },
  {
    rolls: [{ pinsKnocked: 5 }, { pinsKnocked: 2 }],
    score: 7,
    cumulativeScore: 57,
    isStrike: false,
    isSpare: false,
  },
];

const mockFrames2: Frame[] = [
  {
    rolls: [{ pinsKnocked: 8 }, { pinsKnocked: 2 }],
    score: 10,
    cumulativeScore: 10,
    isStrike: false,
    isSpare: true,
  },
  {
    rolls: [{ pinsKnocked: 10 }],
    score: 20,
    cumulativeScore: 30,
    isStrike: true,
    isSpare: false,
  },
  {
    rolls: [{ pinsKnocked: 6 }, { pinsKnocked: 1 }],
    score: 7,
    cumulativeScore: 37,
    isStrike: false,
    isSpare: false,
  },
];

const mockGame: Game = {
  id: 'game1',
  players: [mockPlayer1, mockPlayer2],
  frames: [mockFrames1, mockFrames2],
  scores: [57, 37],
  currentPlayer: 0,
  currentFrame: 0,
  isComplete: true,
  completed: true,
  date: '2024-01-01T00:00:00.000Z',
};

const mockEmptyGame: Game = {
  id: 'empty-game',
  players: [],
  frames: [],
  scores: [],
  currentPlayer: 0,
  currentFrame: 0,
  isComplete: false,
  completed: false,
  date: '2024-01-01T00:00:00.000Z',
};

describe('calculateGameStatistics', () => {
  it('should calculate correct game statistics for a valid game', () => {
    const result: GameStatistics = calculateGameStatistics(mockGame);

    expect(result.gameId).toBe('game1');
    expect(result.date).toBe('2024-01-01T00:00:00.000Z');
    expect(result.highScore).toBe(57);
    expect(result.averageScore).toBe(47); // (57 + 37) / 2
    expect(result.totalStrikes).toBe(2); // 1 from each player
    expect(result.totalSpares).toBe(2); // 1 from each player
    expect(result.openFrames).toBe(2); // 1 from each player
    expect(result.strikePercentage).toBe((2 / 6) * 100); // 2 strikes out of 6 total frames
    expect(result.sparePercentage).toBe((2 / 6) * 100); // 2 spares out of 6 total frames
  });

  it('should handle player statistics correctly', () => {
    const result: GameStatistics = calculateGameStatistics(mockGame);

    expect(result.playerStats['player1']).toEqual({
      playerId: 'player1',
      score: 57,
      strikes: 1,
      spares: 1,
      openFrames: 1,
      averagePinsPerRoll: expect.any(Number),
    });

    expect(result.playerStats['player2']).toEqual({
      playerId: 'player2',
      score: 37,
      strikes: 1,
      spares: 1,
      openFrames: 1,
      averagePinsPerRoll: expect.any(Number),
    });
  });

  it('should handle empty game correctly', () => {
    const result: GameStatistics = calculateGameStatistics(mockEmptyGame);

    expect(result.gameId).toBe('empty-game');
    expect(result.highScore).toBe(0);
    expect(result.averageScore).toBe(0);
    expect(result.totalStrikes).toBe(0);
    expect(result.totalSpares).toBe(0);
    expect(result.openFrames).toBe(0);
    expect(result.strikePercentage).toBe(0);
    expect(result.sparePercentage).toBe(0);
    expect(Object.keys(result.playerStats)).toHaveLength(0);
  });

  it('should handle game with missing scores array', () => {
    const gameWithoutScores: Game = {
      ...mockGame,
      scores: undefined,
    };

    const result: GameStatistics = calculateGameStatistics(gameWithoutScores);

    expect(result.averageScore).toBe(0);
    expect(result.playerStats['player1'].score).toBe(0);
    expect(result.playerStats['player2'].score).toBe(0);
  });

  it('should handle game with empty frames arrays', () => {
    const gameWithEmptyFrames: Game = {
      ...mockGame,
      frames: [[], []],
    };

    const result: GameStatistics = calculateGameStatistics(gameWithEmptyFrames);

    expect(result.totalStrikes).toBe(0);
    expect(result.totalSpares).toBe(0);
    expect(result.openFrames).toBe(0);
  });
});

describe('calculateAveragePinsPerRoll', () => {
  it('should calculate correct average pins per roll', () => {
    const result = calculateAveragePinsPerRoll(mockFrames1);

    // Frame 1: 10 pins in 1 roll
    // Frame 2: 7+3=10 pins in 2 rolls
    // Frame 3: 5+2=7 pins in 2 rolls
    // Total: 27 pins in 5 rolls = 5.4 average
    expect(result).toBe(27 / 5);
  });

  it('should return 0 for empty frames', () => {
    const result = calculateAveragePinsPerRoll([]);
    expect(result).toBe(0);
  });

  it('should handle frames with no rolls', () => {
    const framesWithoutRolls: Frame[] = [
      {
        rolls: [],
        score: 0,
        cumulativeScore: 0,
        isStrike: false,
        isSpare: false,
      },
    ];

    const result = calculateAveragePinsPerRoll(framesWithoutRolls);
    expect(result).toBe(0);
  });
});

describe('calculatePlayerStatistics', () => {
  const games: Game[] = [mockGame];

  it('should calculate complete player statistics for valid player', () => {
    const result: PlayerStatistics = calculatePlayerStatistics(
      games,
      mockPlayer1
    );

    expect(result.playerId).toBe('player1');
    expect(result.playerName).toBe('Alice');
    expect(result.basic).toBeDefined();
    expect(result.frames).toBeDefined();
    expect(result.trends).toBeDefined();
    expect(result.rolls).toBeDefined();
    expect(result.lastUpdated).toBeDefined();
    expect(typeof result.lastUpdated).toBe('string');
    expect(new Date(result.lastUpdated!)).toBeInstanceOf(Date);
  });

  it('should return default statistics for player with no games', () => {
    const playerWithNoGames: Player = {
      id: 'no-games',
      name: 'No Games Player',
      isActive: true,
    };

    const result: PlayerStatistics = calculatePlayerStatistics(
      games,
      playerWithNoGames
    );

    expect(result.playerId).toBe('no-games');
    expect(result.playerName).toBe('No Games Player');
    expect(result.basic.gamesPlayed).toBe(0);
    expect(result.basic.averageScore).toBe(0);
    expect(result.basic.highScore).toBe(0);
    expect(result.basic.lowScore).toBe(0);
  });

  it('should handle empty games array', () => {
    const result: PlayerStatistics = calculatePlayerStatistics([], mockPlayer1);

    expect(result.playerId).toBe('player1');
    expect(result.playerName).toBe('Alice');
    expect(result.basic.gamesPlayed).toBe(0);
  });

  it('should sort games by date for trend analysis', () => {
    const game1: Game = {
      ...mockGame,
      id: 'game1',
      date: '2024-01-02T00:00:00.000Z',
    };

    const game2: Game = {
      ...mockGame,
      id: 'game2',
      date: '2024-01-01T00:00:00.000Z',
    };

    const unsortedGames = [game1, game2];
    const result = calculatePlayerStatistics(unsortedGames, mockPlayer1);

    // Should handle the sorting internally
    expect(result.basic.gamesPlayed).toBe(2);
  });
});

describe('calculateAllPlayersStatistics', () => {
  const games: Game[] = [mockGame];
  const players: Player[] = [mockPlayer1, mockPlayer2];

  it('should calculate statistics for all players', () => {
    const result: Map<string, PlayerStatistics> = calculateAllPlayersStatistics(
      games,
      players
    );

    expect(result.size).toBe(2);
    expect(result.has('player1')).toBe(true);
    expect(result.has('player2')).toBe(true);

    const player1Stats = result.get('player1')!;
    const player2Stats = result.get('player2')!;

    expect(player1Stats.playerId).toBe('player1');
    expect(player1Stats.playerName).toBe('Alice');
    expect(player2Stats.playerId).toBe('player2');
    expect(player2Stats.playerName).toBe('Bob');
  });

  it('should handle empty players array', () => {
    const result: Map<string, PlayerStatistics> = calculateAllPlayersStatistics(
      games,
      []
    );

    expect(result.size).toBe(0);
  });

  it('should handle empty games array', () => {
    const result: Map<string, PlayerStatistics> = calculateAllPlayersStatistics(
      [],
      players
    );

    expect(result.size).toBe(2);

    const player1Stats = result.get('player1')!;
    expect(player1Stats.basic.gamesPlayed).toBe(0);
  });

  it('should handle players not found in any games', () => {
    const unknownPlayer: Player = {
      id: 'unknown',
      name: 'Unknown Player',
      isActive: true,
    };

    const result: Map<string, PlayerStatistics> = calculateAllPlayersStatistics(
      games,
      [unknownPlayer]
    );

    expect(result.size).toBe(1);
    const unknownStats = result.get('unknown')!;
    expect(unknownStats.basic.gamesPlayed).toBe(0);
    expect(unknownStats.playerName).toBe('Unknown Player');
  });
});

describe('Edge cases and error handling', () => {
  it('should handle game with undefined frames array', () => {
    const gameWithUndefinedFrames: Game = {
      ...mockGame,
      frames: undefined as any,
    };

    expect(() =>
      calculateGameStatistics(gameWithUndefinedFrames)
    ).not.toThrow();
  });

  it('should handle frames with undefined rolls', () => {
    const framesWithUndefinedRolls: Frame[] = [
      {
        rolls: undefined as any,
        score: 0,
        cumulativeScore: 0,
        isStrike: false,
        isSpare: false,
      },
    ];

    expect(() =>
      calculateAveragePinsPerRoll(framesWithUndefinedRolls)
    ).not.toThrow();
  });

  it('should handle game with missing player at index', () => {
    const gameWithMissingPlayerFrames: Game = {
      ...mockGame,
      frames: [mockFrames1], // Only one player's frames
      scores: [57, 37], // But two scores
    };

    const result = calculateGameStatistics(gameWithMissingPlayerFrames);
    expect(result.playerStats['player2'].score).toBe(37);
    expect(result.playerStats['player2'].strikes).toBe(0);
  });
});
