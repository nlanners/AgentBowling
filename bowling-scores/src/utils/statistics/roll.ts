/**
 * Roll statistics calculation utilities
 * Contains functions for analyzing individual roll patterns and performance
 */

import { Game, Frame, Roll, RollStatistics } from '../../types';

/**
 * Calculate average pins for first roll
 * @param games Array of games
 * @param playerId Player ID
 * @returns Average pins knocked down on first roll
 */
export const calculateFirstRollAverage = (
  games: Game[],
  playerId: string
): number => {
  let totalPins = 0;
  let rollCount = 0;

  games.forEach((game) => {
    const playerIndex = game.players.findIndex((p) => p.id === playerId);
    if (playerIndex !== -1 && game.frames && game.frames[playerIndex]) {
      const frames = game.frames[playerIndex];
      frames.forEach((frame) => {
        if (frame.rolls && frame.rolls.length > 0) {
          totalPins += frame.rolls[0].pinsKnocked;
          rollCount++;
        }
      });
    }
  });

  return rollCount > 0 ? totalPins / rollCount : 0;
};

/**
 * Calculate average pins for second roll
 * @param games Array of games
 * @param playerId Player ID
 * @returns Average pins knocked down on second roll
 */
export const calculateSecondRollAverage = (
  games: Game[],
  playerId: string
): number => {
  let totalPins = 0;
  let rollCount = 0;

  games.forEach((game) => {
    const playerIndex = game.players.findIndex((p) => p.id === playerId);
    if (playerIndex !== -1 && game.frames && game.frames[playerIndex]) {
      const frames = game.frames[playerIndex];
      frames.forEach((frame) => {
        // Skip frames with strikes (no second roll)
        if (frame.rolls && frame.rolls.length > 1 && !frame.isStrike) {
          totalPins += frame.rolls[1].pinsKnocked;
          rollCount++;
        }
      });
    }
  });

  return rollCount > 0 ? totalPins / rollCount : 0;
};

/**
 * Calculate pins distribution across all rolls
 * @param games Array of games
 * @param playerId Player ID
 * @returns Array of counts for each pin value (0-10)
 */
export const calculatePinsDistribution = (
  games: Game[],
  playerId: string
): number[] => {
  // Initialize distribution array (0-10 pins)
  const distribution = Array(11).fill(0);

  games.forEach((game) => {
    const playerIndex = game.players.findIndex((p) => p.id === playerId);
    if (playerIndex !== -1 && game.frames && game.frames[playerIndex]) {
      const frames = game.frames[playerIndex];
      frames.forEach((frame) => {
        if (frame.rolls) {
          frame.rolls.forEach((roll) => {
            if (roll.pinsKnocked >= 0 && roll.pinsKnocked <= 10) {
              distribution[roll.pinsKnocked]++;
            }
          });
        }
      });
    }
  });

  return distribution;
};

/**
 * Calculate roll statistics for a player
 * @param games Array of games
 * @param playerId Player ID
 * @returns Roll statistics object
 */
export const calculateRollStatistics = (
  games: Game[],
  playerId: string
): RollStatistics => {
  return {
    firstRollAverage: calculateFirstRollAverage(games, playerId),
    secondRollAverage: calculateSecondRollAverage(games, playerId),
    pinsDistribution: calculatePinsDistribution(games, playerId),
  };
};

/**
 * Calculate spare conversion rate for different pin counts
 * @param games Array of games
 * @param playerId Player ID
 * @returns Record of first roll pin count to spare conversion rate (0-100%)
 */
export const calculateSpareConversionRates = (
  games: Game[],
  playerId: string
): Record<number, number> => {
  // Track attempts and conversions for each pin count
  const attempts: Record<number, number> = {};
  const conversions: Record<number, number> = {};

  // Initialize with 0s
  for (let i = 0; i <= 9; i++) {
    attempts[i] = 0;
    conversions[i] = 0;
  }

  games.forEach((game) => {
    const playerIndex = game.players.findIndex((p) => p.id === playerId);
    if (playerIndex !== -1 && game.frames && game.frames[playerIndex]) {
      const frames = game.frames[playerIndex];
      frames.forEach((frame) => {
        // Only consider frames with two rolls where first roll wasn't a strike
        if (
          frame.rolls &&
          frame.rolls.length >= 2 &&
          frame.rolls[0].pinsKnocked < 10
        ) {
          const firstRoll = frame.rolls[0].pinsKnocked;

          // Count the attempt
          attempts[firstRoll] = (attempts[firstRoll] || 0) + 1;

          // Check if it was a spare
          if (frame.isSpare) {
            conversions[firstRoll] = (conversions[firstRoll] || 0) + 1;
          }
        }
      });
    }
  });

  // Calculate conversion rates
  const conversionRates: Record<number, number> = {};
  for (let i = 0; i <= 9; i++) {
    conversionRates[i] =
      attempts[i] > 0 ? (conversions[i] / attempts[i]) * 100 : 0;
  }

  return conversionRates;
};

/**
 * Calculate most frequent pin patterns
 * @param games Array of games
 * @param playerId Player ID
 * @returns Array of common pin patterns with their frequencies
 */
export const calculateCommonPinPatterns = (
  games: Game[],
  playerId: string
): Array<{ pattern: string; count: number }> => {
  // Track pin patterns and their frequencies
  const patternCounts: Record<string, number> = {};

  games.forEach((game) => {
    const playerIndex = game.players.findIndex((p) => p.id === playerId);
    if (playerIndex !== -1 && game.frames && game.frames[playerIndex]) {
      const frames = game.frames[playerIndex];
      frames.forEach((frame) => {
        if (frame.rolls && frame.rolls.length > 0) {
          // Create a pattern string from the rolls
          const pattern = frame.rolls.map((roll) => roll.pinsKnocked).join('-');

          patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
        }
      });
    }
  });

  // Convert to array and sort by frequency
  const patterns = Object.entries(patternCounts).map(([pattern, count]) => ({
    pattern,
    count,
  }));

  // Sort by count (descending)
  return patterns.sort((a, b) => b.count - a.count).slice(0, 5); // Top 5 patterns
};
