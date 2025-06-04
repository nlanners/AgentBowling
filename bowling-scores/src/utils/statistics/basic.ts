/**
 * Basic statistics calculation utilities
 * Contains functions for calculating common game and player statistics
 */

import {
  Game,
  Frame,
  BasicStatistics,
  GamePlayerStatistics,
} from '../../types';

/**
 * Calculate the total number of strikes in a game for a player
 * @param frames The player's frames in the game
 * @returns The total number of strikes
 */
export const calculateStrikes = (frames: Frame[]): number => {
  return frames.reduce((count, frame) => count + (frame.isStrike ? 1 : 0), 0);
};

/**
 * Calculate the total number of spares in a game for a player
 * @param frames The player's frames in the game
 * @returns The total number of spares
 */
export const calculateSpares = (frames: Frame[]): number => {
  return frames.reduce((count, frame) => count + (frame.isSpare ? 1 : 0), 0);
};

/**
 * Calculate the total number of open frames in a game for a player
 * @param frames The player's frames in the game
 * @returns The total number of open frames
 */
export const calculateOpenFrames = (frames: Frame[]): number => {
  return frames.reduce(
    (count, frame) => count + (!frame.isStrike && !frame.isSpare ? 1 : 0),
    0
  );
};

/**
 * Calculate the average pins per roll for a player in a game
 * @param frames The player's frames in the game
 * @returns The average pins per roll
 */
export const calculateAveragePinsPerRoll = (frames: Frame[]): number => {
  const totalRolls = frames.reduce(
    (count, frame) => count + frame.rolls.length,
    0
  );

  const totalPins = frames.reduce(
    (total, frame) =>
      total + frame.rolls.reduce((sum, roll) => sum + roll.pinsKnocked, 0),
    0
  );

  return totalRolls > 0 ? totalPins / totalRolls : 0;
};

/**
 * Calculate player statistics for a specific game
 * @param playerId The player's ID
 * @param frames The player's frames in the game
 * @param score The player's final score
 * @returns Game-specific player statistics
 */
export const calculateGamePlayerStatistics = (
  playerId: string,
  frames: Frame[],
  score: number
): GamePlayerStatistics => {
  return {
    playerId,
    score,
    strikes: calculateStrikes(frames),
    spares: calculateSpares(frames),
    openFrames: calculateOpenFrames(frames),
    averagePinsPerRoll: calculateAveragePinsPerRoll(frames),
  };
};

/**
 * Calculate basic statistics from a collection of games for a player
 * @param playerGames Games the player has participated in
 * @param playerId The player's ID
 * @returns Basic statistics for the player
 */
export const calculateBasicStatistics = (
  playerGames: Game[],
  playerId: string
): BasicStatistics => {
  // Find the player's index in each game
  const gameStats = playerGames
    .map((game) => {
      const playerIndex = game.players.findIndex((p) => p.id === playerId);
      if (playerIndex === -1) return null;

      return {
        frames: game.frames[playerIndex] || [],
        score: game.scores?.[playerIndex] ?? 0,
      };
    })
    .filter(Boolean) as { frames: Frame[]; score: number }[];

  // If no valid games found, return default stats
  if (gameStats.length === 0) {
    return {
      averageScore: 0,
      strikeCount: 0,
      spareCount: 0,
      highScore: 0,
      lowScore: 0,
      gamesPlayed: 0,
      openFrameCount: 0,
      perfectGameCount: 0,
    };
  }

  // Calculate statistics
  const scores = gameStats.map((g) => g.score);
  const totalStrikes = gameStats.reduce(
    (total, game) => total + calculateStrikes(game.frames),
    0
  );
  const totalSpares = gameStats.reduce(
    (total, game) => total + calculateSpares(game.frames),
    0
  );
  const totalOpenFrames = gameStats.reduce(
    (total, game) => total + calculateOpenFrames(game.frames),
    0
  );
  const perfectGames = gameStats.filter((game) => game.score === 300).length;

  return {
    averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
    strikeCount: totalStrikes,
    spareCount: totalSpares,
    highScore: Math.max(...scores),
    lowScore: Math.min(...scores),
    gamesPlayed: gameStats.length,
    openFrameCount: totalOpenFrames,
    perfectGameCount: perfectGames,
  };
};

/**
 * Calculate statistics for all players from a collection of games
 * @param games Collection of games to analyze
 * @returns Map of player IDs to their basic statistics
 */
export const calculateAllPlayersBasicStatistics = (
  games: Game[]
): Map<string, BasicStatistics> => {
  // Extract unique player IDs from all games
  const playerIds = new Set<string>();
  games.forEach((game) => {
    game.players.forEach((player) => {
      playerIds.add(player.id);
    });
  });

  // Calculate statistics for each player
  const playerStats = new Map<string, BasicStatistics>();
  playerIds.forEach((playerId) => {
    playerStats.set(playerId, calculateBasicStatistics(games, playerId));
  });

  return playerStats;
};
