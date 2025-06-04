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
      averagePinsPerFrame: 0,
      averageFirstRoll: 0,
      averageSecondRoll: 0,
      averageFrameScore: 0,
      framePerformance: createDefaultFramePerformance(),
    };
  }

  // Calculate average pins per frame
  const totalPins = allFrames.reduce(
    (total, frame) =>
      total + frame.rolls.reduce((sum, roll) => sum + roll.pinsKnocked, 0),
    0
  );
  const averagePinsPerFrame = totalPins / allFrames.length;

  // Calculate average first and second roll
  let totalFirstRoll = 0;
  let firstRollCount = 0;
  let totalSecondRoll = 0;
  let secondRollCount = 0;

  allFrames.forEach((frame) => {
    if (frame.rolls.length > 0) {
      totalFirstRoll += frame.rolls[0].pinsKnocked;
      firstRollCount++;
    }
    if (frame.rolls.length > 1) {
      totalSecondRoll += frame.rolls[1].pinsKnocked;
      secondRollCount++;
    }
  });

  const averageFirstRoll =
    firstRollCount > 0 ? totalFirstRoll / firstRollCount : 0;
  const averageSecondRoll =
    secondRollCount > 0 ? totalSecondRoll / secondRollCount : 0;

  // Calculate frame-by-frame performance
  const framePerformance = calculateFrameByFramePerformance(games, playerId);

  return {
    strikePercentage: calculateStrikePercentage(allFrames),
    sparePercentage: calculateSparePercentage(allFrames),
    openFramePercentage: calculateOpenFramePercentage(allFrames),
    averagePinsPerFrame,
    averageFirstRoll,
    averageSecondRoll,
    averageFrameScore: calculateAverageFrameScore(allFrames),
    framePerformance,
  };
};

/**
 * Calculate performance metrics for each frame position (1-10)
 * @param games Array of games
 * @param playerId Player ID
 * @returns Record of frame number to performance metrics
 */
export const calculateFrameByFramePerformance = (
  games: Game[],
  playerId: string
): Record<FrameNumber, FramePerformance> => {
  // Initialize with default values
  const framePerformance: Record<FrameNumber, FramePerformance> =
    createDefaultFramePerformance();

  // Frame numbers (1-10)
  const frameNumbers: FrameNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Calculate performance for each frame position
  frameNumbers.forEach((frameNumber) => {
    const framesForPosition = extractFramesByNumber(
      games,
      playerId,
      frameNumber
    );
    if (framesForPosition.length > 0) {
      framePerformance[frameNumber] =
        calculateFramePerformance(framesForPosition);
    }
  });

  return framePerformance;
};

/**
 * Create default frame performance record
 * @returns Default frame performance for all 10 frames
 */
export const createDefaultFramePerformance = (): Record<
  FrameNumber,
  FramePerformance
> => {
  const frameNumbers: FrameNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const defaultPerformance: Record<FrameNumber, FramePerformance> =
    {} as Record<FrameNumber, FramePerformance>;

  frameNumbers.forEach((frameNumber) => {
    defaultPerformance[frameNumber] = {
      averageScore: 0,
      strikePercentage: 0,
      sparePercentage: 0,
    };
  });

  return defaultPerformance;
};
