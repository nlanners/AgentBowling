/**
 * Statistical utilities for analyzing bowling game data
 */

import { Frame } from '../../types/frame';
import { Game } from '../../types/game';
import { Player } from '../../types/player';
import {
  getTotalStrikes,
  getTotalSpares,
  getPlayerFrames,
  getPlayerScore,
} from './frameUtils';

/**
 * Player performance statistics interface
 */
export interface PlayerPerformance {
  playerId: string;
  playerName: string;
  gamesPlayed: number;
  averageScore: number;
  highScore: number;
  lowScore: number;
  strikePercentage: number;
  sparePercentage: number;
  perfectGameCount: number;
  totalStrikes: number;
  totalSpares: number;
  scoreHistory: number[];
}

/**
 * Calculates whether a game is a perfect game (300 points)
 * @param game The game to check
 * @param playerId The ID of the player to check
 * @returns Boolean indicating if the game is a perfect game
 */
export function isPerfectGame(game: Game, playerId: string): boolean {
  if (!game.isComplete) return false;

  const playerIndex = game.players.findIndex(
    (player) => player.id === playerId
  );
  if (playerIndex === -1) return false;

  if (!game.scores || !game.scores[playerIndex]) return false;

  return game.scores[playerIndex] === 300;
}

/**
 * Calculates a player's performance statistics across multiple games
 * @param games Array of games to analyze
 * @param playerId The ID of the player to analyze
 * @returns PlayerPerformance object with statistics
 */
export function calculatePlayerPerformance(
  games: Game[],
  playerId: string
): PlayerPerformance {
  // Filter games that include this player and are complete
  const playerGames = games.filter(
    (game) =>
      game.isComplete && game.players.some((player) => player.id === playerId)
  );

  if (playerGames.length === 0) {
    return {
      playerId,
      playerName: 'Unknown Player',
      gamesPlayed: 0,
      averageScore: 0,
      highScore: 0,
      lowScore: 0,
      strikePercentage: 0,
      sparePercentage: 0,
      perfectGameCount: 0,
      totalStrikes: 0,
      totalSpares: 0,
      scoreHistory: [],
    };
  }

  // Get player name from the most recent game
  const playerName =
    playerGames[0].players.find((player) => player.id === playerId)?.name ||
    'Unknown Player';

  // Calculate scores
  const scores = playerGames.map((game) => getPlayerScore(game, playerId));
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const averageScore = Math.round(totalScore / scores.length);
  const highScore = Math.max(...scores);
  const lowScore = Math.min(...scores);

  // Calculate strike and spare statistics
  let totalStrikes = 0;
  let totalSpares = 0;
  let totalFrames = 0;

  playerGames.forEach((game) => {
    const frames = getPlayerFrames(game, playerId);
    totalFrames += frames.length;
    totalStrikes += getTotalStrikes(frames);
    totalSpares += getTotalSpares(frames);
  });

  const strikePercentage =
    totalFrames > 0 ? Math.round((totalStrikes / totalFrames) * 100) : 0;
  const sparePercentage =
    totalFrames > 0 ? Math.round((totalSpares / totalFrames) * 100) : 0;

  // Count perfect games
  const perfectGameCount = playerGames.filter((game) =>
    isPerfectGame(game, playerId)
  ).length;

  return {
    playerId,
    playerName,
    gamesPlayed: playerGames.length,
    averageScore,
    highScore,
    lowScore,
    strikePercentage,
    sparePercentage,
    perfectGameCount,
    totalStrikes,
    totalSpares,
    scoreHistory: scores,
  };
}

/**
 * Calculates performance statistics for all players across multiple games
 * @param games Array of games to analyze
 * @returns Array of PlayerPerformance objects
 */
export function calculateAllPlayerPerformance(
  games: Game[]
): PlayerPerformance[] {
  // Get unique player IDs from all games
  const playerIds = new Set<string>();

  games.forEach((game) => {
    game.players.forEach((player) => {
      playerIds.add(player.id);
    });
  });

  // Calculate performance for each player
  return Array.from(playerIds).map((playerId) =>
    calculatePlayerPerformance(games, playerId)
  );
}

/**
 * Game statistics interface
 */
export interface GameStatistics {
  gameCount: number;
  averageScore: number;
  highestScore: {
    score: number;
    playerId: string;
    playerName: string;
    gameId: string;
  };
  strikePercentage: number;
  sparePercentage: number;
  perfectGameCount: number;
  playerCount: number;
}

/**
 * Calculates statistics across all games
 * @param games Array of games to analyze
 * @returns GameStatistics object
 */
export function calculateGameStatistics(games: Game[]): GameStatistics {
  if (games.length === 0) {
    return {
      gameCount: 0,
      averageScore: 0,
      highestScore: {
        score: 0,
        playerId: '',
        playerName: '',
        gameId: '',
      },
      strikePercentage: 0,
      sparePercentage: 0,
      perfectGameCount: 0,
      playerCount: 0,
    };
  }

  // Count unique players
  const playerIds = new Set<string>();
  games.forEach((game) => {
    game.players.forEach((player) => {
      playerIds.add(player.id);
    });
  });

  // Calculate highest score
  let highestScore = 0;
  let highestScorePlayerId = '';
  let highestScorePlayerName = '';
  let highestScoreGameId = '';

  games.forEach((game) => {
    game.players.forEach((player, index) => {
      if (
        game.scores &&
        game.scores[index] &&
        game.scores[index] > highestScore
      ) {
        highestScore = game.scores[index];
        highestScorePlayerId = player.id;
        highestScorePlayerName = player.name;
        highestScoreGameId = game.id;
      }
    });
  });

  // Calculate average score
  let totalScore = 0;
  let scoreCount = 0;

  games.forEach((game) => {
    if (game.scores) {
      game.scores.forEach((score) => {
        if (score !== undefined) {
          totalScore += score;
          scoreCount++;
        }
      });
    }
  });

  const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

  // Calculate strike and spare statistics
  let totalStrikes = 0;
  let totalSpares = 0;
  let totalFrames = 0;

  games.forEach((game) => {
    game.frames.forEach((playerFrames) => {
      totalFrames += playerFrames.length;
      playerFrames.forEach((frame) => {
        if (frame.isStrike) totalStrikes++;
        else if (frame.isSpare) totalSpares++;
      });
    });
  });

  const strikePercentage =
    totalFrames > 0 ? Math.round((totalStrikes / totalFrames) * 100) : 0;
  const sparePercentage =
    totalFrames > 0 ? Math.round((totalSpares / totalFrames) * 100) : 0;

  // Count perfect games
  const perfectGameCount = games.reduce((count, game) => {
    let gamePerfect = false;
    game.players.forEach((player, index) => {
      if (game.scores && game.scores[index] === 300) {
        gamePerfect = true;
      }
    });
    return count + (gamePerfect ? 1 : 0);
  }, 0);

  return {
    gameCount: games.length,
    averageScore,
    highestScore: {
      score: highestScore,
      playerId: highestScorePlayerId,
      playerName: highestScorePlayerName,
      gameId: highestScoreGameId,
    },
    strikePercentage,
    sparePercentage,
    perfectGameCount,
    playerCount: playerIds.size,
  };
}

/**
 * Frame statistics by position interface
 */
export interface FramePositionStatistics {
  frameNumber: number;
  averageScore: number;
  strikePercentage: number;
  sparePercentage: number;
  openPercentage: number;
}

/**
 * Calculates statistics for each frame position across all games
 * @param games Array of games to analyze
 * @returns Array of FramePositionStatistics objects
 */
export function calculateFramePositionStatistics(
  games: Game[]
): FramePositionStatistics[] {
  const result: FramePositionStatistics[] = [];

  // Initialize statistics for each frame
  for (let i = 0; i < 10; i++) {
    result.push({
      frameNumber: i + 1,
      averageScore: 0,
      strikePercentage: 0,
      sparePercentage: 0,
      openPercentage: 0,
    });
  }

  if (games.length === 0) {
    return result;
  }

  // Collect data for each frame position
  const frameCounts = new Array(10).fill(0);
  const frameScores = new Array(10).fill(0);
  const strikeFrames = new Array(10).fill(0);
  const spareFrames = new Array(10).fill(0);
  const openFrames = new Array(10).fill(0);

  games.forEach((game) => {
    game.frames.forEach((playerFrames) => {
      playerFrames.forEach((frame, index) => {
        if (frame.rolls.length > 0) {
          frameCounts[index]++;
          frameScores[index] += frame.score || 0;

          if (frame.isStrike) {
            strikeFrames[index]++;
          } else if (frame.isSpare) {
            spareFrames[index]++;
          } else {
            openFrames[index]++;
          }
        }
      });
    });
  });

  // Calculate statistics for each frame
  for (let i = 0; i < 10; i++) {
    if (frameCounts[i] > 0) {
      result[i].averageScore = Math.round(frameScores[i] / frameCounts[i]);
      result[i].strikePercentage = Math.round(
        (strikeFrames[i] / frameCounts[i]) * 100
      );
      result[i].sparePercentage = Math.round(
        (spareFrames[i] / frameCounts[i]) * 100
      );
      result[i].openPercentage = Math.round(
        (openFrames[i] / frameCounts[i]) * 100
      );
    }
  }

  return result;
}

/**
 * Score distribution interface
 */
export interface ScoreDistribution {
  range: string;
  count: number;
  percentage: number;
}

/**
 * Calculates the distribution of scores across all games
 * @param games Array of games to analyze
 * @returns Array of ScoreDistribution objects
 */
export function calculateScoreDistribution(games: Game[]): ScoreDistribution[] {
  const ranges = [
    { min: 0, max: 50, label: '0-50' },
    { min: 51, max: 100, label: '51-100' },
    { min: 101, max: 150, label: '101-150' },
    { min: 151, max: 200, label: '151-200' },
    { min: 201, max: 250, label: '201-250' },
    { min: 251, max: 300, label: '251-300' },
  ];

  // Initialize distribution
  const distribution: ScoreDistribution[] = ranges.map((range) => ({
    range: range.label,
    count: 0,
    percentage: 0,
  }));

  // Collect all scores
  const scores: number[] = [];
  games.forEach((game) => {
    if (game.scores) {
      game.scores.forEach((score) => {
        if (score !== undefined) {
          scores.push(score);
        }
      });
    }
  });

  // Count scores in each range
  scores.forEach((score) => {
    for (let i = 0; i < ranges.length; i++) {
      if (score >= ranges[i].min && score <= ranges[i].max) {
        distribution[i].count++;
        break;
      }
    }
  });

  // Calculate percentages
  if (scores.length > 0) {
    distribution.forEach((item) => {
      item.percentage = Math.round((item.count / scores.length) * 100);
    });
  }

  return distribution;
}
