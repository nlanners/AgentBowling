/**
 * Frame utilities for advanced frame operations
 */

import { Frame, Roll } from '../../types/frame';
import { Game } from '../../types/game';
import { Player } from '../../types/player';
import { isStrike, isSpare, updateFrameFlags } from './calculateScore';

/**
 * Gets a specific frame for a player
 * @param game The game to get the frame from
 * @param playerId The ID of the player
 * @param frameIndex The index of the frame to get
 * @returns The requested frame or undefined if not found
 */
export function getPlayerFrame(
  game: Game,
  playerId: string,
  frameIndex: number
): Frame | undefined {
  const playerIndex = game.players.findIndex(
    (player) => player.id === playerId
  );
  if (playerIndex === -1 || frameIndex < 0 || frameIndex > 9) {
    return undefined;
  }

  return game.frames[playerIndex][frameIndex];
}

/**
 * Gets all frames for a specific player
 * @param game The game to get frames from
 * @param playerId The ID of the player
 * @returns Array of the player's frames
 */
export function getPlayerFrames(game: Game, playerId: string): Frame[] {
  const playerIndex = game.players.findIndex(
    (player) => player.id === playerId
  );
  if (playerIndex === -1) {
    return [];
  }

  return game.frames[playerIndex];
}

/**
 * Gets the total score for a player in a game
 * @param game The game to calculate score from
 * @param playerId The ID of the player
 * @returns The player's total score
 */
export function getPlayerScore(game: Game, playerId: string): number {
  const frames = getPlayerFrames(game, playerId);
  if (frames.length === 0) {
    return 0;
  }

  // Get the last frame's cumulative score
  const lastFrameWithScore = [...frames]
    .reverse()
    .find((frame) => frame.cumulativeScore !== undefined);

  return lastFrameWithScore ? lastFrameWithScore.cumulativeScore : 0;
}

/**
 * Gets the rolls for a specific frame
 * @param frame The frame to get rolls from
 * @returns Array of Roll objects in the frame
 */
export function getFrameRolls(frame: Frame): Roll[] {
  return frame.rolls || [];
}

/**
 * Checks if a frame is complete (has all required rolls)
 * @param frame The frame to check
 * @param isTenthFrame Whether this is the 10th frame
 * @returns Boolean indicating if the frame is complete
 */
export function isFrameComplete(frame: Frame, isTenthFrame: boolean): boolean {
  if (!frame) return false;

  if (isTenthFrame) {
    if (frame.isStrike || frame.isSpare) {
      return frame.rolls.length === 3;
    } else {
      return frame.rolls.length === 2;
    }
  } else {
    if (frame.isStrike) {
      return true; // A strike completes a normal frame
    } else {
      return frame.rolls.length === 2;
    }
  }
}

/**
 * Finds the highest-scoring player in a game
 * @param game The game to check
 * @returns The highest-scoring player or undefined if no scores
 */
export function getHighestScoringPlayer(game: Game): Player | undefined {
  if (!game.scores || game.scores.length === 0) {
    return undefined;
  }

  const highestScore = Math.max(...game.scores);
  const highestScorerIndex = game.scores.findIndex(
    (score) => score === highestScore
  );

  return game.players[highestScorerIndex];
}

/**
 * Gets the total number of strikes in a frame array
 * @param frames The frames to check
 * @returns Count of strikes
 */
export function getTotalStrikes(frames: Frame[]): number {
  return frames.filter((frame) => frame.isStrike).length;
}

/**
 * Gets the total number of spares in a frame array
 * @param frames The frames to check
 * @returns Count of spares
 */
export function getTotalSpares(frames: Frame[]): number {
  return frames.filter((frame) => frame.isSpare).length;
}

/**
 * Gets the total number of open frames
 * @param frames The frames to check
 * @returns Count of open frames (frames with no strike or spare)
 */
export function getTotalOpenFrames(frames: Frame[]): number {
  return frames.filter(
    (frame) => frame.rolls.length > 0 && !frame.isStrike && !frame.isSpare
  ).length;
}

/**
 * Gets the running average for a set of frames
 * @param frames The frames to calculate average for
 * @returns The average score per frame
 */
export function getAverageFrameScore(frames: Frame[]): number {
  const completedFrames = frames.filter(
    (frame) => frame.rolls.length > 0 && frame.score !== undefined
  );

  if (completedFrames.length === 0) {
    return 0;
  }

  const totalScore = completedFrames.reduce(
    (sum, frame) => sum + (frame.score || 0),
    0
  );

  return Math.round(totalScore / completedFrames.length);
}

/**
 * Gets information about frame scoring patterns
 * @param frames The frames to analyze
 * @returns Object with scoring pattern information
 */
export function getFrameScoringPatterns(frames: Frame[]): {
  consecutiveStrikes: number;
  maxConsecutiveStrikes: number;
  consecutiveSpares: number;
  maxConsecutiveSpares: number;
} {
  let consecutiveStrikes = 0;
  let maxConsecutiveStrikes = 0;
  let consecutiveSpares = 0;
  let maxConsecutiveSpares = 0;

  frames.forEach((frame) => {
    if (frame.isStrike) {
      consecutiveStrikes++;
      consecutiveSpares = 0;
      maxConsecutiveStrikes = Math.max(
        maxConsecutiveStrikes,
        consecutiveStrikes
      );
    } else if (frame.isSpare) {
      consecutiveSpares++;
      consecutiveStrikes = 0;
      maxConsecutiveSpares = Math.max(maxConsecutiveSpares, consecutiveSpares);
    } else if (frame.rolls.length > 0) {
      consecutiveStrikes = 0;
      consecutiveSpares = 0;
    }
  });

  return {
    consecutiveStrikes,
    maxConsecutiveStrikes,
    consecutiveSpares,
    maxConsecutiveSpares,
  };
}

/**
 * Calculates various statistics for a player's frames
 * @param frames The frames to analyze
 * @returns Object with frame statistics
 */
export function getFrameStatistics(frames: Frame[]): {
  strikeCount: number;
  spareCount: number;
  openCount: number;
  strikePercentage: number;
  sparePercentage: number;
  averageScore: number;
  perfectFrames: number;
} {
  const completedFrames = frames.filter((frame) => frame.rolls.length > 0);

  if (completedFrames.length === 0) {
    return {
      strikeCount: 0,
      spareCount: 0,
      openCount: 0,
      strikePercentage: 0,
      sparePercentage: 0,
      averageScore: 0,
      perfectFrames: 0,
    };
  }

  const strikeCount = getTotalStrikes(completedFrames);
  const spareCount = getTotalSpares(completedFrames);
  const openCount = getTotalOpenFrames(completedFrames);

  // Perfect frames are strikes or frames where all pins were knocked down
  const perfectFrames = completedFrames.filter(
    (frame) =>
      frame.isStrike ||
      (frame.rolls.length === 2 &&
        frame.rolls[0].pinsKnocked + frame.rolls[1].pinsKnocked === 10)
  ).length;

  return {
    strikeCount,
    spareCount,
    openCount,
    strikePercentage: Math.round((strikeCount / completedFrames.length) * 100),
    sparePercentage: Math.round((spareCount / completedFrames.length) * 100),
    averageScore: getAverageFrameScore(completedFrames),
    perfectFrames,
  };
}

/**
 * Gets the current pinfall for a frame (without bonus points)
 * @param frame The frame to calculate pinfall for
 * @returns Total pins knocked down in the frame
 */
export function getFramePinfall(frame: Frame): number {
  if (!frame || !frame.rolls) {
    return 0;
  }

  return frame.rolls.reduce((sum, roll) => sum + roll.pinsKnocked, 0);
}

/**
 * Identifies potential splits in a frame
 * @param frame The frame to check
 * @returns Boolean indicating if the frame has a potential split
 */
export function hasPotentialSplit(frame: Frame): boolean {
  // In bowling, a split typically occurs when the first roll leaves pins on both sides
  // This is a simplified check - in a real game, we'd track specific pin configurations
  if (!frame || frame.rolls.length < 1) {
    return false;
  }

  // Simplified logic: consider it a potential split if the first roll knocked down
  // between 3 and 9 pins (not 0, 1, 2, or 10)
  const firstRoll = frame.rolls[0].pinsKnocked;
  return firstRoll >= 3 && firstRoll <= 9;
}

/**
 * Gets progress percentage through a game
 * @param game The game to check progress for
 * @returns Number from 0-100 indicating game completion percentage
 */
export function getGameProgressPercentage(game: Game): number {
  if (game.isComplete) {
    return 100;
  }

  // Calculate based on frames completed
  const framesTotalForAllPlayers = game.players.length * 10;

  let completedFrames = 0;

  game.frames.forEach((playerFrames) => {
    playerFrames.forEach((frame, index) => {
      if (isFrameComplete(frame, index === 9)) {
        completedFrames++;
      }
    });
  });

  return Math.round((completedFrames / framesTotalForAllPlayers) * 100);
}
