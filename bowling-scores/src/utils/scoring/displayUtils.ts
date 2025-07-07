/**
 * Display utilities for rendering frames, rolls, and scores in the UI
 */

import { Frame, Roll } from '../../types/frame';
import { Game } from '../../types/game';
import { isStrike, isSpare } from './calculateScore';
import { memoize } from '../performance';

/**
 * Converts a roll value to its display representation
 * @param roll The roll to format
 * @param frameIndex The index of the frame
 * @param rollIndex The index of the roll in the frame
 * @param frame The frame containing the roll
 * @returns A string representation of the roll
 */
export function formatRoll(
  roll: Roll | undefined,
  frameIndex: number,
  rollIndex: number,
  frame: Frame
): string {
  if (!roll) return '';

  // Strike on first roll
  if (rollIndex === 0 && roll.pinsKnocked === 10) {
    return 'X';
  }

  // Strike on second roll in 10th frame
  if (frameIndex === 9 && rollIndex === 1 && roll.pinsKnocked === 10) {
    return 'X';
  }

  // Spare
  if (
    rollIndex === 1 &&
    frame.rolls[0] &&
    frame.rolls[0].pinsKnocked + roll.pinsKnocked === 10
  ) {
    return '/';
  }

  // Tenth frame special case for third roll
  if (frameIndex === 9 && rollIndex === 2) {
    if (roll.pinsKnocked === 10) {
      return 'X';
    }

    // Check if the previous roll was a spare
    const isFollowingSpare =
      frame.rolls[0] &&
      frame.rolls[1] &&
      frame.rolls[0].pinsKnocked + frame.rolls[1].pinsKnocked === 10;

    if (isFollowingSpare) {
      // Show the raw value for the roll after a spare in the 10th frame
      return roll.pinsKnocked === 0 ? '-' : roll.pinsKnocked.toString();
    }

    // Check if the previous roll was a strike, and this is the bonus roll
    const isFollowingStrike =
      frame.rolls[1] && frame.rolls[1].pinsKnocked === 10;

    if (isFollowingStrike) {
      return roll.pinsKnocked === 10
        ? 'X'
        : roll.pinsKnocked === 0
        ? '-'
        : roll.pinsKnocked.toString();
    }
  }

  // Show gutter ball as a dash
  if (roll.pinsKnocked === 0) {
    return '-';
  }

  // Normal roll
  return roll.pinsKnocked.toString();
}

/**
 * Gets display values for all rolls in a frame
 * @param frame The frame to format
 * @param frameIndex The index of the frame
 * @returns An array of formatted roll values
 */
export function getFrameRollDisplay(
  frame: Frame,
  frameIndex: number
): string[] {
  const result: string[] = [];

  // Handle up to three rolls (for the 10th frame)
  for (let i = 0; i < (frameIndex === 9 ? 3 : 2); i++) {
    result.push(formatRoll(frame.rolls[i], frameIndex, i, frame));
  }

  return result;
}

/**
 * Determines if a score can be displayed for a frame
 * @param frames Array of frames
 * @param frameIndex Index of the frame to check
 * @returns Boolean indicating if the frame has a displayable score
 */
export function canDisplayScore(frames: Frame[], frameIndex: number): boolean {
  const frame = frames[frameIndex];

  // No score available yet if no rolls have been made
  if (!frame || frame.rolls.length === 0) {
    return false;
  }

  // For a strike, we need two more rolls (unless it's the 10th frame)
  if (frame.isStrike && frameIndex < 9) {
    // Count available rolls after this frame
    let availableRolls = 0;
    let nextFrameIndex = frameIndex + 1;

    while (nextFrameIndex < frames.length && availableRolls < 2) {
      const nextFrame = frames[nextFrameIndex];
      availableRolls += nextFrame.rolls.length;

      // If this frame is also a strike and we only have one roll so far,
      // we need to look at the next frame too (unless we're at the last frame)
      if (nextFrame.isStrike && availableRolls === 1 && nextFrameIndex < 9) {
        nextFrameIndex++;
      } else {
        break;
      }
    }

    return availableRolls >= 2;
  }

  // For a spare, we need one more roll (unless it's the 10th frame)
  if (frame.isSpare && frameIndex < 9) {
    // Check if there's at least one roll in the next frame
    const nextFrame = frames[frameIndex + 1];
    return nextFrame && nextFrame.rolls.length > 0;
  }

  // For normal frames (or the 10th frame), we can display as soon as the frame is complete
  const rollsNeeded =
    frame.isStrike || frame.isSpare ? (frameIndex === 9 ? 3 : 1) : 2;

  return frame.rolls.length >= rollsNeeded;
}

/**
 * Generates a color coding for a frame based on its result
 * @param frame The frame to color code
 * @returns A string with the color code (can be used with theme colors)
 */
export function getFrameColorCode(
  frame: Frame
): 'strike' | 'spare' | 'open' | 'default' {
  if (!frame || frame.rolls.length === 0) {
    return 'default';
  }

  if (frame.isStrike) {
    return 'strike';
  }

  if (frame.isSpare) {
    return 'spare';
  }

  return 'open';
}

/**
 * Gets the current status of a game for display
 * @param game The game to check
 * @returns A string indicating the game status
 */
export function getGameStatusDisplay(game: Game): string {
  if (game.isComplete) {
    return 'Game Complete';
  }

  const currentPlayer = game.players[game.currentPlayer];
  const frameNumber = game.currentFrame + 1;

  return `${currentPlayer.name}'s turn - Frame ${frameNumber}`;
}

/**
 * Gets the current roll number for display
 * @param game The game to check
 * @returns A string indicating the current roll number
 */
export function getCurrentRollDisplay(game: Game): string {
  const { currentPlayer, currentFrame } = game;
  const frame = game.frames[currentPlayer][currentFrame];

  if (!frame) return 'Roll 1';

  // In the 10th frame
  if (currentFrame === 9) {
    if (frame.isStrike || frame.isSpare) {
      return `Roll ${Math.min(frame.rolls.length + 1, 3)}`;
    }
    return `Roll ${Math.min(frame.rolls.length + 1, 2)}`;
  }

  // In regular frames
  if (frame.isStrike) {
    return 'Strike!';
  }

  return `Roll ${frame.rolls.length + 1}`;
}

/**
 * Formats a numeric score for display
 * @param score The score to format
 * @returns A formatted score string
 */
export function formatScore(score: number | undefined): string {
  if (score === undefined || score === null) {
    return '';
  }

  return score.toString();
}

/**
 * Get the message to display after a roll
 * @param pinsKnocked Number of pins knocked down
 * @param isStrike Whether this was a strike
 * @param isSpare Whether this was a spare
 * @returns Message string
 */
export function getRollResultMessage(
  pinsKnocked: number,
  isStrike: boolean,
  isSpare: boolean
): string {
  if (isStrike) {
    return 'Strike!';
  }

  if (isSpare) {
    return 'Spare!';
  }

  if (pinsKnocked === 0) {
    return 'Gutter ball!';
  }

  if (pinsKnocked === 1) {
    return 'You knocked down 1 pin';
  }

  return `You knocked down ${pinsKnocked} pins`;
}

/**
 * Get the array of remaining pins after a roll
 * @param pinsKnocked Number of pins knocked down
 * @returns Array of remaining pin numbers (1-10)
 */
export function getRemainingPins(pinsKnocked: number): number[] {
  const totalPins = 10;
  const remaining = totalPins - pinsKnocked;
  const pins = [];

  for (let i = 1; i <= remaining; i++) {
    pins.push(i);
  }

  return pins;
}

/**
 * Determines if a player can knock down a specific number of pins
 * @param game Current game state
 * @param pinsToKnock Number of pins to attempt to knock down
 * @returns Boolean indicating if the move is valid
 */
export function canKnockDownPins(game: Game, pinsToKnock: number): boolean {
  // Basic validation
  if (pinsToKnock < 0 || pinsToKnock > 10) {
    return false;
  }

  const { currentPlayer, currentFrame } = game;
  const frames = game.frames[currentPlayer];

  // Make sure we have frames array
  if (!frames || !frames[currentFrame]) {
    return pinsToKnock <= 10;
  }

  const frame = frames[currentFrame];

  // If no rolls yet, any valid number is allowed
  if (frame.rolls.length === 0) {
    return pinsToKnock <= 10;
  }

  // If this is the second roll of a normal frame (not 10th)
  if (frame.rolls.length === 1 && currentFrame < 9) {
    const firstRollPins = frame.rolls[0].pinsKnocked;
    return pinsToKnock <= 10 - firstRollPins;
  }

  // If this is the 10th frame, special rules apply
  if (currentFrame === 9) {
    if (frame.rolls.length === 1) {
      // Second roll of 10th frame
      const firstRollPins = frame.rolls[0].pinsKnocked;

      // If first roll was a strike, any number is allowed
      if (firstRollPins === 10) {
        return pinsToKnock <= 10;
      }

      // Otherwise, normal spare rules apply
      return pinsToKnock <= 10 - firstRollPins;
    }

    if (frame.rolls.length === 2) {
      // Third roll of 10th frame
      const firstRollPins = frame.rolls[0].pinsKnocked;
      const secondRollPins = frame.rolls[1].pinsKnocked;

      // If first roll was a strike
      if (firstRollPins === 10) {
        // If second roll was also a strike, any number is allowed
        if (secondRollPins === 10) {
          return pinsToKnock <= 10;
        }
        // Otherwise, spare rules apply for second and third rolls
        return pinsToKnock <= 10 - secondRollPins;
      }

      // If first roll wasn't a strike but first two made a spare
      if (firstRollPins + secondRollPins === 10) {
        return pinsToKnock <= 10;
      }

      // This shouldn't happen in a valid game state
      return false;
    }
  }

  return true;
}

// Additional helper functions with memoization for performance

/**
 * Format percentage for display
 */
const formatPercentageUncached = (
  value: number,
  decimals: number = 1
): string => {
  return `${value.toFixed(decimals)}%`;
};

// Memoized version of percentage formatting
export const formatPercentage = memoize(
  formatPercentageUncached,
  (value, decimals) => `${value}-${decimals}`
);

/**
 * Format average for display
 */
const formatAverageUncached = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals);
};

// Memoized version of average formatting
export const formatAverage = memoize(
  formatAverageUncached,
  (value, decimals) => `${value}-${decimals}`
);

/**
 * Get ordinal suffix for numbers (1st, 2nd, 3rd, etc.)
 */
const getOrdinalSuffixUncached = (num: number): string => {
  const j = num % 10;
  const k = num % 100;

  if (j === 1 && k !== 11) {
    return `${num}st`;
  }
  if (j === 2 && k !== 12) {
    return `${num}nd`;
  }
  if (j === 3 && k !== 13) {
    return `${num}rd`;
  }
  return `${num}th`;
};

// Memoized version of ordinal suffix
export const getOrdinalSuffix = memoize(getOrdinalSuffixUncached, (num) =>
  num.toString()
);

/**
 * Format date for display
 */
const formatDateUncached = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Memoized version of date formatting
export const formatDate = memoize(formatDateUncached);

/**
 * Format time for display
 */
const formatTimeUncached = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString();
};

// Memoized version of time formatting
export const formatTime = memoize(formatTimeUncached);
