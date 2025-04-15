/**
 * Roll interface representing a single throw of the bowling ball
 */
export interface Roll {
  /** Number of pins knocked down (0-10) */
  pinsKnocked: number;
}

/**
 * Frame interface representing a single frame in a bowling game
 */
export interface Frame {
  /** Array of Roll objects (max 2 rolls per frame, except 10th which can have 3) */
  rolls: Roll[];

  /** Boolean indicating if the frame is a spare */
  isSpare: boolean;

  /** Boolean indicating if the frame is a strike */
  isStrike: boolean;

  /** Calculated score for this frame (including spares/strikes bonuses) */
  score: number;

  /** Running total score up to this frame */
  cumulativeScore: number;
}

/**
 * Type representing the possible frame numbers in a standard bowling game
 */
export type FrameNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * Type representing the possible roll numbers in a frame
 */
export type RollNumber = 1 | 2 | 3; // 3 is only valid for the 10th frame after a strike or spare
