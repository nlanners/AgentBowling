import { Frame } from '../../../types/frame';
import { validateRoll, validateScoreCalculation } from '../bowlingValidation';

// Helper function to create a test frame
const createFrame = (
  rolls: number[],
  score: number = 0,
  cumulativeScore: number = 0
): Frame => {
  const frame: Frame = {
    rolls: rolls.map((pins) => ({ pinsKnocked: pins })),
    isSpare: false,
    isStrike: false,
    score,
    cumulativeScore,
  };

  // Set frame flags
  if (rolls.length > 0 && rolls[0] === 10) {
    frame.isStrike = true;
  } else if (
    rolls.length >= 2 &&
    !frame.isStrike &&
    rolls[0] + rolls[1] === 10
  ) {
    frame.isSpare = true;
  }

  return frame;
};

describe('validateRoll', () => {
  it('should validate a valid first roll in a frame', () => {
    const validation = validateRoll(5, 1, false);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should reject negative pins', () => {
    const validation = validateRoll(-1, 1, false);
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain(
      'Pins knocked down must be between 0 and 10'
    );
  });

  it('should reject pins > 10', () => {
    const validation = validateRoll(11, 1, false);
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain(
      'Pins knocked down must be between 0 and 10'
    );
  });

  it('should validate a valid second roll that does not exceed 10 pins total', () => {
    const validation = validateRoll(3, 2, false, 6); // 6 + 3 = 9, valid
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should reject a second roll that exceeds 10 pins total', () => {
    const validation = validateRoll(5, 2, false, 7); // 7 + 5 = 12, invalid
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain(
      'Total pins knocked down in a frame cannot exceed 10'
    );
  });

  it('should allow any valid roll in the 10th frame after a strike', () => {
    const validation = validateRoll(7, 2, true, 10); // After a strike in 10th frame
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should allow a third roll in the 10th frame after a spare', () => {
    const validation = validateRoll(8, 3, true, 9, 1); // 9+1=10 (spare), third roll = 8
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should reject a third roll in a regular frame', () => {
    const validation = validateRoll(5, 3, false, 3, 4); // 3+4=7 (not spare/strike), third roll not allowed
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain(
      'Cannot have a third roll in a regular frame'
    );
  });

  it('should reject a third roll in the 10th frame if first two rolls are not a strike or spare', () => {
    const validation = validateRoll(5, 3, true, 3, 4); // 3+4=7 (not spare/strike in 10th frame)
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain(
      'Third roll in 10th frame only allowed after a strike or spare'
    );
  });
});

describe('validateScoreCalculation', () => {
  it('should validate correct score calculations', () => {
    const frames = [
      createFrame([7, 2], 9, 9),
      createFrame([10], 16, 25), // Strike + next frame's 3+3
      createFrame([3, 3], 6, 31),
    ];

    const validation = validateScoreCalculation(frames);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should detect incorrect frame scores', () => {
    const frames = [
      createFrame([7, 2], 10, 10), // Score should be 9, not 10
      createFrame([5, 5], 12, 22), // Score is correct (spare + next roll = 5)
    ];

    const validation = validateScoreCalculation(frames);
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain(
      'Frame 1 score is incorrect. Expected: 9, Actual: 10'
    );
  });

  it('should detect incorrect cumulative scores', () => {
    const frames = [
      createFrame([7, 2], 9, 9), // Correct
      createFrame([5, 5], 15, 25), // Correct frame score (10+5), but cumulative should be 24
      createFrame([5, 3], 8, 32), // Frame score correct, but cumulative depends on previous frame
    ];

    const validation = validateScoreCalculation(frames);
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain(
      'Frame 2 cumulative score is incorrect. Expected: 24, Actual: 25'
    );
  });

  it('should skip validation for frames with no rolls', () => {
    const frames = [
      createFrame([7, 2], 9, 9), // Correct
      createFrame([], 0, 0), // Empty frame, should be skipped
    ];

    const validation = validateScoreCalculation(frames);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });
});
