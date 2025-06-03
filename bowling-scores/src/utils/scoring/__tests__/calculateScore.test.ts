import {
  calculateFrameScore,
  calculateGameScore,
  isStrike,
  isSpare,
  updateFrameFlags,
} from '../calculateScore';
import { Frame } from '../../../types/frame';

// Create test data helpers
const createRoll = (pinsKnocked: number) => ({ pinsKnocked });

const createFrame = (rolls: number[]): Frame => ({
  rolls: rolls.map((pins) => createRoll(pins)),
  score: 0,
  cumulativeScore: 0,
  isSpare: false,
  isStrike: false,
});

describe('Bowling Score Calculation', () => {
  describe('isStrike', () => {
    it('should correctly identify a strike', () => {
      const strikeFrame = createFrame([10]);
      const nonStrikeFrame = createFrame([9, 1]);

      expect(isStrike(strikeFrame)).toBe(true);
      expect(isStrike(nonStrikeFrame)).toBe(false);
    });

    it('should handle undefined or empty frames', () => {
      const emptyFrame = createFrame([]);

      expect(isStrike(undefined)).toBe(false);
      expect(isStrike(emptyFrame)).toBe(false);
    });
  });

  describe('isSpare', () => {
    it('should correctly identify a spare', () => {
      const spareFrame = createFrame([9, 1]);
      const nonSpareFrame = createFrame([9, 0]);
      const strikeFrame = createFrame([10]);

      expect(isSpare(spareFrame)).toBe(true);
      expect(isSpare(nonSpareFrame)).toBe(false);
      expect(isSpare(strikeFrame)).toBe(false);
    });

    it('should handle undefined or incomplete frames', () => {
      const incompleteFrame = createFrame([5]);

      expect(isSpare(undefined)).toBe(false);
      expect(isSpare(incompleteFrame)).toBe(false);
    });
  });

  describe('updateFrameFlags', () => {
    it('should set strike flag correctly', () => {
      const frame = createFrame([10]);
      const updatedFrame = updateFrameFlags(frame);

      expect(updatedFrame.isStrike).toBe(true);
      expect(updatedFrame.isSpare).toBe(false);
    });

    it('should set spare flag correctly', () => {
      const frame = createFrame([5, 5]);
      const updatedFrame = updateFrameFlags(frame);

      expect(updatedFrame.isStrike).toBe(false);
      expect(updatedFrame.isSpare).toBe(true);
    });

    it('should not set any flags for open frames', () => {
      const frame = createFrame([5, 3]);
      const updatedFrame = updateFrameFlags(frame);

      expect(updatedFrame.isStrike).toBe(false);
      expect(updatedFrame.isSpare).toBe(false);
    });
  });

  describe('calculateFrameScore', () => {
    it('should calculate an open frame score correctly', () => {
      const frames = [createFrame([3, 4])];
      const score = calculateFrameScore(frames, 0);

      expect(score).toBe(7);
    });

    it('should calculate a spare frame score with bonus', () => {
      const frames = [
        createFrame([5, 5]), // Spare
        createFrame([3, 4]), // Next frame
      ];
      // Update flags to make the first frame a spare
      frames[0].isSpare = true;

      const score = calculateFrameScore(frames, 0);

      expect(score).toBe(13); // 10 + 3 (bonus)
    });

    it('should calculate a strike frame score with bonus', () => {
      const frames = [
        createFrame([10]), // Strike
        createFrame([3, 4]), // Next frame
      ];
      // Update flags to make the first frame a strike
      frames[0].isStrike = true;

      const score = calculateFrameScore(frames, 0);

      expect(score).toBe(17); // 10 + 3 + 4 (bonus)
    });

    it('should handle consecutive strikes correctly', () => {
      const frames = [
        createFrame([10]), // Strike
        createFrame([10]), // Strike
        createFrame([3, 4]), // Next frame
      ];
      // Update flags to make the frames strikes
      frames[0].isStrike = true;
      frames[1].isStrike = true;

      const score = calculateFrameScore(frames, 0);

      expect(score).toBe(23); // 10 + 10 + 3 (bonus)
    });

    it('should calculate 10th frame with three strikes correctly', () => {
      const frames = Array(10)
        .fill(null)
        .map(() => createFrame([]));
      frames[9] = createFrame([10, 10, 10]); // 10th frame with three strikes
      frames[9].isStrike = true;

      const score = calculateFrameScore(frames, 9);
      expect(score).toBe(30); // 10 + 10 + 10
    });

    it('should calculate 10th frame with spare and bonus correctly', () => {
      const frames = Array(10)
        .fill(null)
        .map(() => createFrame([]));
      frames[9] = createFrame([9, 1, 8]); // 10th frame with spare and bonus
      frames[9].isSpare = true;

      const score = calculateFrameScore(frames, 9);
      expect(score).toBe(18); // 9 + 1 + 8
    });
  });

  describe('calculateGameScore', () => {
    it('should calculate the cumulative score for a simple game', () => {
      const frames = [
        createFrame([1, 2]),
        createFrame([3, 4]),
        createFrame([5, 4]),
      ];

      const updatedFrames = calculateGameScore(frames);

      expect(updatedFrames[0].score).toBe(3);
      expect(updatedFrames[0].cumulativeScore).toBe(3);

      expect(updatedFrames[1].score).toBe(7);
      expect(updatedFrames[1].cumulativeScore).toBe(10);

      expect(updatedFrames[2].score).toBe(9);
      expect(updatedFrames[2].cumulativeScore).toBe(19);
    });

    it('should calculate the cumulative score with spares and strikes', () => {
      const frames = [
        createFrame([10]), // Strike
        createFrame([9, 1]), // Spare
        createFrame([5, 4]), // Open
      ];

      // Update flags
      frames[0].isStrike = true;
      frames[1].isSpare = true;

      const updatedFrames = calculateGameScore(frames);

      expect(updatedFrames[0].score).toBe(20); // 10 + 9 + 1
      expect(updatedFrames[0].cumulativeScore).toBe(20);

      expect(updatedFrames[1].score).toBe(15); // 10 + 5
      expect(updatedFrames[1].cumulativeScore).toBe(35);

      expect(updatedFrames[2].score).toBe(9);
      expect(updatedFrames[2].cumulativeScore).toBe(44);
    });

    it('should calculate a perfect game (300 score)', () => {
      // Create 10 frames with all strikes
      const frames = Array(9)
        .fill(null)
        .map(() => {
          const frame = createFrame([10]);
          frame.isStrike = true;
          return frame;
        });

      // 10th frame with 3 strikes
      const tenthFrame = createFrame([10, 10, 10]);
      tenthFrame.isStrike = true;
      frames.push(tenthFrame);

      const updatedFrames = calculateGameScore(frames);

      // Each frame should have a score of 30 (strike + 2 bonus strikes)
      // The 10th frame should be 30 points (all three strikes count directly)
      for (let i = 0; i < 9; i++) {
        expect(updatedFrames[i].score).toBe(30);
      }
      expect(updatedFrames[9].score).toBe(30);

      // The final cumulative score should be 300
      expect(updatedFrames[9].cumulativeScore).toBe(300);
    });

    it('should calculate the 9th frame score correctly with a strike in the 10th frame', () => {
      const frames = Array(10)
        .fill(null)
        .map(() => createFrame([]));

      // Set up a strike in the 9th frame
      frames[8] = createFrame([10]);
      frames[8].isStrike = true;

      // Set up the 10th frame with a strike and 9
      frames[9] = createFrame([10, 9, 0]);
      frames[9].isStrike = true;

      const updatedFrames = calculateGameScore(frames);

      // 9th frame score should be 10 (strike) + 10 (first 10th frame roll) + 9 (second 10th frame roll) = 29
      expect(updatedFrames[8].score).toBe(29);

      // 10th frame score should be 10 + 9 + 0 = 19
      expect(updatedFrames[9].score).toBe(19);
    });
  });
});
