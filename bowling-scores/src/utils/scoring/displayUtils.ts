/**
 * Display utilities for rendering frames, rolls, and scores in the UI
 */

import { Frame, Roll } from '../../types/frame';
import { Game } from '../../types/game';
import { isStrike, isSpare } from './calculateScore';

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

  // Strike
  if (rollIndex === 0 && roll.pinsKnocked === 10) {
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
 * Formats a score for display
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
 * Gets a user-friendly message based on a roll result
 * @param pinsKnocked The number of pins knocked down
 * @param isStrike Whether the roll was a strike
 * @param isSpare Whether the roll completed a spare
 * @returns A message appropriate for the roll
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
 * Calculates which pins are still standing after a roll
 * @param pinsKnocked The number of pins knocked down
 * @returns An array of pin numbers that are still standing (1-10)
 */
export function getRemainingPins(pinsKnocked: number): number[] {
  if (pinsKnocked === 10) {
    return []; // All pins down
  }

  // This is a simplification - in a real game, we'd track exactly which pins are down
  // For this app, we'll just return the correct number of pins
  const pinCount = 10 - pinsKnocked;
  return Array.from({ length: pinCount }, (_, i) => i + 1);
}

/**
 * Determines if a specific number of pins can be knocked down in the current frame
 * @param game The current game
 * @param pinsToKnock The number of pins to knock down
 * @returns Boolean indicating if the roll is valid
 */
export function canKnockDownPins(game: Game, pinsToKnock: number): boolean {
  const { currentPlayer, currentFrame } = game;
  const frame = game.frames[currentPlayer][currentFrame];

  // No frame data yet
  if (!frame) return pinsToKnock <= 10;

  // First roll in any frame
  if (frame.rolls.length === 0) {
    return pinsToKnock <= 10;
  }

  // Special case for 10th frame
  if (currentFrame === 9) {
    // First roll already happened
    if (frame.rolls.length === 1) {
      // If the first roll was a strike, any valid roll is allowed
      if (frame.rolls[0].pinsKnocked === 10) {
        return pinsToKnock <= 10;
      }

      // Otherwise, ensure the sum doesn't exceed 10
      return frame.rolls[0].pinsKnocked + pinsToKnock <= 10;
    }

    // Second roll already happened
    if (frame.rolls.length === 2) {
      // Only allowed a third roll if first was strike or frame is spare
      if (frame.isStrike || frame.isSpare) {
        // If previous roll was a strike, any valid roll is allowed
        if (frame.rolls[1].pinsKnocked === 10) {
          return pinsToKnock <= 10;
        }

        // If first roll was a strike but second wasn't,
        // ensure the sum of second and third doesn't exceed 10
        if (frame.isStrike && frame.rolls[1].pinsKnocked !== 10) {
          return frame.rolls[1].pinsKnocked + pinsToKnock <= 10;
        }

        // If it's a spare, any valid roll is allowed
        if (frame.isSpare) {
          return pinsToKnock <= 10;
        }
      }

      // No third roll allowed otherwise
      return false;
    }
  } else {
    // Second roll in a regular frame
    if (frame.rolls.length === 1) {
      // Ensure the sum doesn't exceed 10
      return frame.rolls[0].pinsKnocked + pinsToKnock <= 10;
    }
  }

  return false;
}
