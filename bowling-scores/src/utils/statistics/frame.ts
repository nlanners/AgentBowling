/**
 * Frame statistics calculation utilities
 * Contains functions for calculating frame-specific statistics
 */

import {
  Game,
  Frame,
  FrameStatistics,
  FramePerformance,
  FrameNumber,
} from '../../types';
import {
  calculateStrikes,
  calculateSpares,
  calculateOpenFrames,
} from './basic';

/**
 * Calculate strike percentage for frames
 * @param frames Array of frames
 * @returns Strike percentage (0-100)
 */
export const calculateStrikePercentage = (frames: Frame[]): number => {
  if (frames.length === 0) return 0;
  return (calculateStrikes(frames) / frames.length) * 100;
};

/**
 * Calculate spare percentage for frames
 * @param frames Array of frames
 * @returns Spare percentage (0-100)
 */
export const calculateSparePercentage = (frames: Frame[]): number => {
  if (frames.length === 0) return 0;
  return (calculateSpares(frames) / frames.length) * 100;
};

/**
 * Calculate open frame percentage for frames
 * @param frames Array of frames
 * @returns Open frame percentage (0-100)
 */
export const calculateOpenFramePercentage = (frames: Frame[]): number => {
  if (frames.length === 0) return 0;
  return (calculateOpenFrames(frames) / frames.length) * 100;
};

/**
 * Calculate average score per frame
 * @param frames Array of frames
 * @returns Average score per frame
 */
export const calculateAverageFrameScore = (frames: Frame[]): number => {
  if (frames.length === 0) return 0;

  const totalScore = frames.reduce((sum, frame) => sum + frame.score, 0);
  return totalScore / frames.length;
};

/**
 * Extract all frames at a specific position from multiple games
 * @param games Array of games
 * @param playerId Player ID
 * @param frameNumber Frame number (1-10)
 * @returns Array of frames at the specified position
 */
export const extractFramesByNumber = (
  games: Game[],
  playerId: string,
  frameNumber: FrameNumber
): Frame[] => {
  const frameIndex = frameNumber - 1; // Convert to 0-based index

  return games
    .map((game) => {
      const playerIndex = game.players.findIndex((p) => p.id === playerId);
      if (playerIndex === -1) return null;

      const playerFrames = game.frames[playerIndex];
      if (!playerFrames || frameIndex >= playerFrames.length) return null;

      return playerFrames[frameIndex];
    })
    .filter(Boolean) as Frame[];
};

/**
 * Calculate performance metrics for a specific frame number
 * @param frames Array of frames at the same position
 * @returns Performance metrics for the frame
 */
export const calculateFramePerformance = (
  frames: Frame[]
): FramePerformance => {
  return {
    averageScore: calculateAverageFrameScore(frames),
    strikePercentage: calculateStrikePercentage(frames),
    sparePercentage: calculateSparePercentage(frames),
  };
};

/**
 * Calculate frame statistics for a player across multiple games
 * @param games Array of games
 * @param playerId Player ID
 * @returns Frame statistics
 */
export const calculateFrameStatistics = (
  games: Game[],
  playerId: string
): FrameStatistics => {
  // Extract all frames for the player
  const allFrames: Frame[] = [];
  games.forEach((game) => {
    const playerIndex = game.players.findIndex((p) => p.id === playerId);
    if (playerIndex !== -1) {
      const playerFrames = game.frames[playerIndex] || [];
      allFrames.push(...playerFrames);
    }
  });

  // If no frames found, return default statistics
  if (allFrames.length === 0) {
    return {
      strikePercentage: 0,
      sparePercentage: 0,
      openFramePercentage: 0,
      averageFrameScore: 0,
      framePerformance: {} as Record<FrameNumber, FramePerformance>,
    };
  }

  // Calculate performance for each frame number
  const framePerformance: Partial<Record<FrameNumber, FramePerformance>> = {};

  // For each frame number (1-10)
  for (let i = 1; i <= 10; i++) {
    const frameNumber = i as FrameNumber;
    const framesAtPosition = extractFramesByNumber(
      games,
      playerId,
      frameNumber
    );

    if (framesAtPosition.length > 0) {
      framePerformance[frameNumber] =
        calculateFramePerformance(framesAtPosition);
    }
  }

  return {
    strikePercentage: calculateStrikePercentage(allFrames),
    sparePercentage: calculateSparePercentage(allFrames),
    openFramePercentage: calculateOpenFramePercentage(allFrames),
    averageFrameScore: calculateAverageFrameScore(allFrames),
    framePerformance: framePerformance as Record<FrameNumber, FramePerformance>,
  };
};
