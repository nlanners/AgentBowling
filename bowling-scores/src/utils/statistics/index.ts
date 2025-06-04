/**
 * Statistics utilities for the bowling score app
 * Centralized export of all statistics calculation functions
 */

// Basic statistics calculations
export * from './basic';

// Frame statistics calculations
export * from './frame';

// Trend statistics calculations
export * from './trend';

// Roll-specific statistics calculations
export * from './roll';

// Import types
import {
  Game,
  Player,
  GameStatistics,
  PlayerStatistics,
  GamePlayerStatistics,
  BasicStatistics,
  FrameStatistics,
  Frame,
  TrendStatistics,
  RollStatistics,
  FrameNumber,
  FramePerformance,
} from '../../types';

import { calculateBasicStatistics } from './basic';
import { calculateFrameStatistics } from './frame';
import { calculateTrendStatistics } from './trend';
import { calculateRollStatistics } from './roll';

/**
 * Calculate game statistics for a specific game
 * @param game Game to analyze
 * @returns Game statistics
 */
export const calculateGameStatistics = (game: Game): GameStatistics => {
  const playerStats: Record<string, GamePlayerStatistics> = {};

  // Initialize game statistics
  const stats: GameStatistics = {
    gameId: game.id,
    date: game.date,
    playerStats: {},
    totalStrikes: 0,
    totalSpares: 0,
    openFrames: 0,
    highScore: 0,
    averageScore: 0,
    strikePercentage: 0,
    sparePercentage: 0,
  };

  let totalScore = 0;
  let totalFrames = 0;
  let totalStrikes = 0;
  let totalSpares = 0;
  let openFrames = 0;

  game.players.forEach((player, index) => {
    const frames = game.frames[index] || [];
    const score = game.scores?.[index] ?? 0;

    const strikes = frames.filter((frame) => frame.isStrike).length;
    const spares = frames.filter((frame) => frame.isSpare).length;
    const openFrameCount = frames.filter(
      (frame) => !frame.isStrike && !frame.isSpare
    ).length;

    totalStrikes += strikes;
    totalSpares += spares;
    openFrames += openFrameCount;
    totalScore += score;
    totalFrames += frames.length;

    if (score > stats.highScore) {
      stats.highScore = score;
    }

    playerStats[player.id] = {
      playerId: player.id,
      score,
      strikes,
      spares,
      openFrames: openFrameCount,
      averagePinsPerRoll: calculateAveragePinsPerRoll(frames),
    };
  });

  stats.playerStats = playerStats;
  stats.totalStrikes = totalStrikes;
  stats.totalSpares = totalSpares;
  stats.openFrames = openFrames;

  // Calculate averages and percentages safely
  stats.averageScore =
    game.players.length > 0 ? totalScore / game.players.length : 0;
  stats.strikePercentage =
    totalFrames > 0 ? (totalStrikes / totalFrames) * 100 : 0;
  stats.sparePercentage =
    totalFrames > 0 ? (totalSpares / totalFrames) * 100 : 0;

  return stats;
};

/**
 * Calculate the average pins per roll in a game
 * @param frames The player's frames
 * @returns Average pins per roll
 */
export const calculateAveragePinsPerRoll = (
  frames: Game['frames'][0]
): number => {
  const totalRolls = frames.reduce((sum, frame) => sum + frame.rolls.length, 0);
  const totalPins = frames.reduce(
    (sum, frame) =>
      sum + frame.rolls.reduce((s, roll) => s + roll.pinsKnocked, 0),
    0
  );

  return totalRolls > 0 ? totalPins / totalRolls : 0;
};

/**
 * Calculate statistics for a given player across all games
 * @param games Array of games
 * @param player Player to analyze
 * @returns Complete player statistics
 */
export function calculatePlayerStatistics(
  games: Game[],
  player: Player
): PlayerStatistics {
  // Filter games where the player participated
  const playerGames = games.filter((game) =>
    game.players.some((p) => p.id === player.id)
  );

  if (playerGames.length === 0) {
    // Return default stats if player hasn't played any games
    return createDefaultPlayerStatistics(player.id, player.name);
  }

  // Sort games by date for trend analysis
  const sortedGames = [...playerGames].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate statistics for each category
  const basic = calculateBasicStatistics(sortedGames, player.id);
  const frames = calculateFrameStatistics(sortedGames, player.id);
  const trends = calculateTrendStatistics(sortedGames, player.id);
  const rolls = calculateRollStatistics(sortedGames, player.id);

  // Timestamp for when these statistics were calculated
  const lastUpdated = new Date().toISOString();

  return {
    playerId: player.id,
    playerName: player.name,
    basic,
    frames,
    trends,
    rolls,
    lastUpdated,
  };
}

/**
 * Create default player statistics
 * @param playerId Player ID
 * @param playerName Optional player name
 * @returns Default statistics object
 */
function createDefaultPlayerStatistics(
  playerId: string,
  playerName: string = 'Unknown Player'
): PlayerStatistics {
  const frameNumbers: FrameNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const defaultFramePerformance: Record<FrameNumber, FramePerformance> =
    {} as Record<FrameNumber, FramePerformance>;

  frameNumbers.forEach((frameNumber) => {
    defaultFramePerformance[frameNumber] = {
      averageScore: 0,
      strikePercentage: 0,
      sparePercentage: 0,
    };
  });

  return {
    playerId,
    playerName,
    basic: {
      gamesPlayed: 0,
      highScore: 0,
      lowScore: 0,
      averageScore: 0,
      strikeCount: 0,
      spareCount: 0,
      openFrameCount: 0,
      perfectGameCount: 0,
    },
    frames: {
      strikePercentage: 0,
      sparePercentage: 0,
      openFramePercentage: 0,
      averagePinsPerFrame: 0,
      averageFirstRoll: 0,
      averageSecondRoll: 0,
      averageFrameScore: 0,
      framePerformance: defaultFramePerformance,
    },
    trends: {
      frameByFrameAverage: Array(10).fill(0),
      scoreImprovement: 0,
      consistencyScore: 0,
      recentTrend: 0,
      last5GamesAverage: 0,
      last10GamesAverage: 0,
    },
    rolls: {
      firstRollAverage: 0,
      secondRollAverage: 0,
      pinsDistribution: Array(11).fill(0),
    },
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Calculate statistics for all players from a collection of games
 * @param games Collection of games to analyze
 * @param players Array of players to generate statistics for
 * @returns Map of player IDs to their complete statistics
 */
export const calculateAllPlayersStatistics = (
  games: Game[],
  players: Player[]
): Map<string, PlayerStatistics> => {
  const playerStats = new Map<string, PlayerStatistics>();

  players.forEach((player) => {
    playerStats.set(player.id, calculatePlayerStatistics(games, player));
  });

  return playerStats;
};
