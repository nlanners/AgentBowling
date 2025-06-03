import { Frame, Roll } from '../../types/frame';

/**
 * Calculates the score of a bowling frame taking into account strikes and spares
 * @param frames Array of frames in the game
 * @param frameIndex Index of the current frame being calculated
 * @returns The score for the specified frame including bonuses
 */
export function calculateFrameScore(
  frames: Frame[],
  frameIndex: number
): number {
  const frame = frames[frameIndex];

  // Base case: if no rolls have been made yet, score is 0
  if (frame.rolls.length === 0) {
    return 0;
  }

  // Special case for the 10th frame
  if (frameIndex === 9) {
    // In the 10th frame, we count all rolls directly
    return frame.rolls.reduce((sum, roll) => sum + roll.pinsKnocked, 0);
  }

  // For frames 1-9
  // Get pins knocked down in the current frame
  const pinsKnocked = frame.rolls.reduce(
    (total, roll) => total + roll.pinsKnocked,
    0
  );

  // Strike case
  if (frame.isStrike) {
    return 10 + calculateStrikeBonus(frames, frameIndex);
  }

  // Spare case
  if (frame.isSpare) {
    return 10 + calculateSpareBonus(frames, frameIndex);
  }

  // Regular frame case
  return pinsKnocked;
}

/**
 * Calculates the bonus score for a strike
 * @param frames Array of frames in the game
 * @param frameIndex Index of the frame with the strike
 * @returns The bonus score (next two rolls)
 */
function calculateStrikeBonus(frames: Frame[], frameIndex: number): number {
  let bonus = 0;
  let rollCount = 0;
  let currentFrameIndex = frameIndex;

  // 10th frame is handled separately in calculateFrameScore
  if (frameIndex === 9) {
    return 0;
  }

  // For 9th frame, if the 10th frame has strikes, we need to include those bonus rolls
  if (frameIndex === 8 && frames[9] && frames[9].isStrike) {
    // If 10th frame has at least two rolls and first is a strike
    if (frames[9].rolls.length >= 2) {
      bonus += frames[9].rolls[0].pinsKnocked; // First roll (strike)
      bonus += frames[9].rolls[1].pinsKnocked; // Second roll
      return bonus;
    }
  }

  // We need the next two rolls after a strike
  while (rollCount < 2 && currentFrameIndex < frames.length - 1) {
    currentFrameIndex++;
    const nextFrame = frames[currentFrameIndex];

    // Add first roll of next frame
    if (nextFrame.rolls.length > 0) {
      bonus += nextFrame.rolls[0].pinsKnocked;
      rollCount++;
    }

    // If the next frame is also a strike and we're not at the last frame,
    // we need to look at the frame after that for the second roll
    if (rollCount < 2) {
      if (nextFrame.isStrike && currentFrameIndex < 9) {
        // Continue to the next frame
        continue;
      } else if (nextFrame.rolls.length > 1) {
        // Otherwise, take the second roll of the next frame
        bonus += nextFrame.rolls[1].pinsKnocked;
        rollCount++;
      }
    }
  }

  return bonus;
}

/**
 * Calculates the bonus score for a spare
 * @param frames Array of frames in the game
 * @param frameIndex Index of the frame with the spare
 * @returns The bonus score (next one roll)
 */
function calculateSpareBonus(frames: Frame[], frameIndex: number): number {
  // 10th frame is handled separately in calculateFrameScore
  if (frameIndex === 9) {
    return 0;
  }

  // For a spare, the bonus is the value of the next roll
  if (frameIndex < frames.length - 1) {
    const nextFrame = frames[frameIndex + 1];
    if (nextFrame.rolls.length > 0) {
      return nextFrame.rolls[0].pinsKnocked;
    }
  }
  return 0;
}

/**
 * Calculates the cumulative score for each frame in a game
 * @param frames Array of frames in the game
 * @returns Array of frames with updated scores and cumulativeScores
 */
export function calculateGameScore(frames: Frame[]): Frame[] {
  const updatedFrames = [...frames];
  let runningTotal = 0;

  for (let i = 0; i < updatedFrames.length; i++) {
    const frameScore = calculateFrameScore(updatedFrames, i);
    updatedFrames[i].score = frameScore;
    runningTotal += frameScore;
    updatedFrames[i].cumulativeScore = runningTotal;
  }

  return updatedFrames;
}

/**
 * Determines if a frame is a strike
 * @param frame The frame to check
 * @returns True if the frame is a strike, false otherwise
 */
export function isStrike(frame: Frame | undefined): boolean {
  if (!frame || frame.rolls.length === 0) return false;
  return frame.rolls[0].pinsKnocked === 10;
}

/**
 * Determines if a frame is a spare
 * @param frame The frame to check
 * @returns True if the frame is a spare, false otherwise
 */
export function isSpare(frame: Frame | undefined): boolean {
  if (!frame || frame.rolls.length < 2) return false;
  // Not a strike, but total of first two rolls is 10
  return (
    !isStrike(frame) &&
    frame.rolls[0].pinsKnocked + frame.rolls[1].pinsKnocked === 10
  );
}

/**
 * Updates strike and spare flags on a frame
 * @param frame The frame to update
 * @returns The updated frame with correct flags
 */
export function updateFrameFlags(frame: Frame): Frame {
  const updatedFrame = { ...frame };
  updatedFrame.isStrike = isStrike(updatedFrame);
  updatedFrame.isSpare = isSpare(updatedFrame);
  return updatedFrame;
}
