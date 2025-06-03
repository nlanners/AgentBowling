/**
 * Statistics utilities for the bowling score app
 * Centralized export of all statistics calculation functions
 */

// Basic statistics calculations
export * from './basic';

// Frame statistics calculations
export * from './frame';

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
} from '../../types';

import { calculateBasicStatistics } from './basic';
import { calculateFrameStatistics } from './frame';

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
    return createDefaultPlayerStatistics(player.id);
  }

  // Initialize statistics
  const stats: PlayerStatistics = {
    playerId: player.id,
    basic: {
      gamesPlayed: playerGames.length,
      highScore: 0,
      lowScore: Number.MAX_SAFE_INTEGER,
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
    },
    trends: {
      frameByFrameAverage: Array(10).fill(0),
      scoreImprovement: 0,
      consistencyScore: 0,
    },
  };

  // Collect all player frames from all games
  let totalScore = 0;
  let totalFrames = 0;
  let totalFirstRoll = 0;
  let totalSecondRoll = 0;
  let firstRollCount = 0;
  let secondRollCount = 0;
  let frameScores = Array(10).fill(0);
  let frameScoreCount = Array(10).fill(0);

  // Analyze each game
  playerGames.forEach((game) => {
    // Find player's data in this game
    const playerData = game.players.find((p) => p.id === player.id);
    if (!playerData || !playerData.frames) return;

    // Get the final score
    const finalScore = calculateFinalScore(playerData.frames);
    totalScore += finalScore;

    // Update high/low scores
    if (finalScore > stats.basic.highScore) {
      stats.basic.highScore = finalScore;
    }
    if (finalScore < stats.basic.lowScore) {
      stats.basic.lowScore = finalScore;
    }

    // Check for perfect game (300)
    if (finalScore === 300) {
      stats.basic.perfectGameCount++;
    }

    // Analyze each frame
    playerData.frames.forEach((frame, frameIndex) => {
      if (!frame) return;

      totalFrames++;

      // Count strikes, spares, open frames
      if (isStrike(frame)) {
        stats.basic.strikeCount++;
      } else if (isSpare(frame)) {
        stats.basic.spareCount++;
      } else {
        stats.basic.openFrameCount++;
      }

      // Collect first roll data
      if (frame.rolls[0] !== undefined) {
        totalFirstRoll += frame.rolls[0];
        firstRollCount++;
      }

      // Collect second roll data
      if (frame.rolls[1] !== undefined && !isStrike(frame)) {
        totalSecondRoll += frame.rolls[1];
        secondRollCount++;
      }

      // Collect frame-by-frame scores
      if (frameIndex < 10 && frame.score !== undefined) {
        frameScores[frameIndex] += frame.score;
        frameScoreCount[frameIndex]++;
      }
    });
  });

  // Calculate averages and percentages
  stats.basic.averageScore = totalScore / playerGames.length;

  if (totalFrames > 0) {
    stats.frames.strikePercentage =
      (stats.basic.strikeCount / totalFrames) * 100;
    stats.frames.sparePercentage = (stats.basic.spareCount / totalFrames) * 100;
    stats.frames.openFramePercentage =
      (stats.basic.openFrameCount / totalFrames) * 100;
  }

  if (firstRollCount > 0) {
    stats.frames.averageFirstRoll = totalFirstRoll / firstRollCount;
  }

  if (secondRollCount > 0) {
    stats.frames.averageSecondRoll = totalSecondRoll / secondRollCount;
  }

  // Calculate frame-by-frame averages
  for (let i = 0; i < 10; i++) {
    if (frameScoreCount[i] > 0) {
      stats.trends.frameByFrameAverage[i] = frameScores[i] / frameScoreCount[i];
    }
  }

  // Calculate score improvement (difference between first and last game)
  if (playerGames.length >= 2) {
    const firstGame = playerGames[0];
    const lastGame = playerGames[playerGames.length - 1];

    const firstGameScore = calculateFinalScore(
      firstGame.players.find((p) => p.id === player.id)?.frames || []
    );

    const lastGameScore = calculateFinalScore(
      lastGame.players.find((p) => p.id === player.id)?.frames || []
    );

    stats.trends.scoreImprovement = lastGameScore - firstGameScore;
  }

  // Handle low score edge case
  if (stats.basic.lowScore === Number.MAX_SAFE_INTEGER) {
    stats.basic.lowScore = 0;
  }

  return stats;
}

/**
 * Calculate the final score from frames
 */
function calculateFinalScore(frames: Frame[]): number {
  if (!frames || frames.length === 0) return 0;

  // Return the score of the last frame that has a score
  for (let i = frames.length - 1; i >= 0; i--) {
    if (frames[i] && frames[i].score !== undefined) {
      return frames[i].score;
    }
  }

  return 0;
}

/**
 * Check if a frame is a strike
 */
function isStrike(frame: Frame): boolean {
  return frame.rolls[0] === 10;
}

/**
 * Check if a frame is a spare
 */
function isSpare(frame: Frame): boolean {
  if (frame.rolls[0] === 10) return false; // Strike, not a spare
  return frame.rolls[0] + (frame.rolls[1] || 0) === 10;
}

/**
 * Create default player statistics
 */
function createDefaultPlayerStatistics(playerId: string): PlayerStatistics {
  return {
    playerId,
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
    },
    trends: {
      frameByFrameAverage: Array(10).fill(0),
      scoreImprovement: 0,
      consistencyScore: 0,
    },
  };
}
