/**
 * Trend statistics calculation utilities
 * Contains functions for tracking player improvement over time
 */

import { Game, TrendStatistics } from '../../types';

/**
 * Calculate the score improvement trend for a player
 * @param games Array of games sorted by date (oldest first)
 * @param playerId Player ID
 * @returns Score improvement metric (positive means improving)
 */
export const calculateScoreImprovement = (
  games: Game[],
  playerId: string
): number => {
  if (games.length < 2) return 0;

  // Get the player's scores from each game
  const scores: number[] = [];
  games.forEach((game) => {
    const playerIndex = game.players.findIndex((p) => p.id === playerId);
    if (playerIndex !== -1 && game.scores && game.scores[playerIndex]) {
      scores.push(game.scores[playerIndex]);
    }
  });

  if (scores.length < 2) return 0;

  // Simple trend calculation: compare average of last half vs first half
  const midpoint = Math.floor(scores.length / 2);
  const firstHalf = scores.slice(0, midpoint);
  const secondHalf = scores.slice(midpoint);

  const firstHalfAvg =
    firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
  const secondHalfAvg =
    secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;

  return secondHalfAvg - firstHalfAvg;
};

/**
 * Calculate the consistency score for a player
 * @param games Array of games
 * @param playerId Player ID
 * @returns Consistency score (lower is more consistent)
 */
export const calculateConsistencyScore = (
  games: Game[],
  playerId: string
): number => {
  if (games.length < 2) return 0;

  // Get the player's scores from each game
  const scores: number[] = [];
  games.forEach((game) => {
    const playerIndex = game.players.findIndex((p) => p.id === playerId);
    if (playerIndex !== -1 && game.scores && game.scores[playerIndex]) {
      scores.push(game.scores[playerIndex]);
    }
  });

  if (scores.length < 2) return 0;

  // Calculate standard deviation
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const squaredDiffs = scores.map((score) => Math.pow(score - mean, 2));
  const variance =
    squaredDiffs.reduce((sum, diff) => sum + diff, 0) / scores.length;

  return Math.sqrt(variance);
};

/**
 * Calculate average score for recent games
 * @param games Array of games sorted by date (oldest first)
 * @param playerId Player ID
 * @param count Number of recent games to consider
 * @returns Average score from recent games
 */
export const calculateRecentGamesAverage = (
  games: Game[],
  playerId: string,
  count: number
): number => {
  if (games.length === 0) return 0;

  // Get the most recent games (up to count)
  const recentGames = games.slice(-count);

  // Get the player's scores from these games
  let totalScore = 0;
  let scoreCount = 0;

  recentGames.forEach((game) => {
    const playerIndex = game.players.findIndex((p) => p.id === playerId);
    if (playerIndex !== -1 && game.scores && game.scores[playerIndex]) {
      totalScore += game.scores[playerIndex];
      scoreCount++;
    }
  });

  return scoreCount > 0 ? totalScore / scoreCount : 0;
};

/**
 * Calculate frame-by-frame average scores
 * @param games Array of games
 * @param playerId Player ID
 * @returns Array of average scores for each frame position
 */
export const calculateFrameByFrameAverage = (
  games: Game[],
  playerId: string
): number[] => {
  if (games.length === 0) return Array(10).fill(0);

  // Initialize arrays to track totals and counts
  const frameTotals = Array(10).fill(0);
  const frameCounts = Array(10).fill(0);

  // Collect frame scores from all games
  games.forEach((game) => {
    const playerIndex = game.players.findIndex((p) => p.id === playerId);
    if (playerIndex !== -1 && game.frames && game.frames[playerIndex]) {
      const frames = game.frames[playerIndex];
      frames.forEach((frame, index) => {
        if (index < 10 && frame.score !== undefined) {
          frameTotals[index] += frame.score;
          frameCounts[index]++;
        }
      });
    }
  });

  // Calculate averages
  return frameTotals.map((total, index) =>
    frameCounts[index] > 0 ? total / frameCounts[index] : 0
  );
};

/**
 * Calculate comprehensive trend statistics
 * @param games Array of games sorted by date (oldest first)
 * @param playerId Player ID
 * @returns Trend statistics object
 */
export const calculateTrendStatistics = (
  games: Game[],
  playerId: string
): TrendStatistics => {
  // Sort games by date (oldest first) to ensure correct trend analysis
  const sortedGames = [...games].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return {
    scoreImprovement: calculateScoreImprovement(sortedGames, playerId),
    consistencyScore: calculateConsistencyScore(sortedGames, playerId),
    frameByFrameAverage: calculateFrameByFrameAverage(sortedGames, playerId),
    last5GamesAverage: calculateRecentGamesAverage(sortedGames, playerId, 5),
    last10GamesAverage: calculateRecentGamesAverage(sortedGames, playerId, 10),
    recentTrend: calculateRecentTrend(sortedGames, playerId),
  };
};

/**
 * Calculate very recent score trend
 * @param games Array of games sorted by date (oldest first)
 * @param playerId Player ID
 * @returns Recent trend value (positive means improving)
 */
export const calculateRecentTrend = (
  games: Game[],
  playerId: string
): number => {
  if (games.length < 3) return 0;

  // Get last 3 games
  const recentGames = games.slice(-3);

  // Get the player's scores from these games
  const scores: number[] = [];
  recentGames.forEach((game) => {
    const playerIndex = game.players.findIndex((p) => p.id === playerId);
    if (playerIndex !== -1 && game.scores && game.scores[playerIndex]) {
      scores.push(game.scores[playerIndex]);
    }
  });

  if (scores.length < 2) return 0;

  // Calculate linear regression slope for recent scores
  // Simplified to just last game minus first game for clarity
  return scores[scores.length - 1] - scores[0];
};
