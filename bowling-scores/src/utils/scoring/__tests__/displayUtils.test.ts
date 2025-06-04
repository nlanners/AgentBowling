import {
  formatRoll,
  getFrameRollDisplay,
  canDisplayScore,
  getFrameColorCode,
  getGameStatusDisplay,
  getCurrentRollDisplay,
  formatScore,
  getRollResultMessage,
  getRemainingPins,
  canKnockDownPins,
} from '../displayUtils';
import { Frame, Roll } from '../../../types/frame';
import { Game } from '../../../types/game';
import { Player } from '../../../types/player';

// Helper functions to create test objects
const createRoll = (pinsKnocked: number): Roll => ({ pinsKnocked });

const createFrame = (
  rolls: number[],
  isStrike = false,
  isSpare = false
): Frame => ({
  rolls: rolls.map((pins) => createRoll(pins)),
  score: 0,
  cumulativeScore: 0,
  isStrike,
  isSpare,
});

const createPlayer = (id: string, name: string): Player => ({
  id,
  name,
});

const createGame = (players: Player[], frames: Frame[][]): Game => ({
  id: '1',
  date: '2023-05-01',
  players,
  frames,
  currentPlayer: 0,
  currentFrame: 0,
  isComplete: false,
  completed: false,
});

describe('Display Utils Tests', () => {
  describe('formatRoll', () => {
    it('should format a strike as X', () => {
      const roll = createRoll(10);
      const frame = createFrame([10], true);

      expect(formatRoll(roll, 0, 0, frame)).toBe('X');
    });

    it('should format a spare as /', () => {
      const roll = createRoll(5);
      const frame = createFrame([5, 5], false, true);

      expect(formatRoll(roll, 0, 1, frame)).toBe('/');
    });

    it('should format a gutter ball as -', () => {
      const roll = createRoll(0);
      const frame = createFrame([0, 5]);

      expect(formatRoll(roll, 0, 0, frame)).toBe('-');
    });

    it('should format regular roll as number', () => {
      const roll = createRoll(7);
      const frame = createFrame([7, 2]);

      expect(formatRoll(roll, 0, 0, frame)).toBe('7');
    });

    it('should handle 10th frame strike on second roll', () => {
      const roll = createRoll(10);
      const frame = createFrame([5, 10]);

      expect(formatRoll(roll, 9, 1, frame)).toBe('X');
    });

    it('should handle undefined roll', () => {
      const frame = createFrame([5]);

      expect(formatRoll(undefined, 0, 0, frame)).toBe('');
    });

    it('should handle 10th frame third roll after spare', () => {
      const roll = createRoll(7);
      const frame = createFrame([5, 5, 7], false, true);

      expect(formatRoll(roll, 9, 2, frame)).toBe('7');
    });
  });

  describe('getFrameRollDisplay', () => {
    it('should return display values for regular frame', () => {
      const frame = createFrame([7, 2]);

      expect(getFrameRollDisplay(frame, 0)).toEqual(['7', '2']);
    });

    it('should return display values for strike frame', () => {
      const frame = createFrame([10], true);

      expect(getFrameRollDisplay(frame, 0)).toEqual(['X', '']);
    });

    it('should return display values for spare frame', () => {
      const frame = createFrame([5, 5], false, true);

      expect(getFrameRollDisplay(frame, 0)).toEqual(['5', '/']);
    });

    it('should handle 10th frame with three rolls', () => {
      const frame = createFrame([10, 10, 10], true);

      expect(getFrameRollDisplay(frame, 9)).toEqual(['X', 'X', 'X']);
    });
  });

  describe('canDisplayScore', () => {
    it('should return false for frame with no rolls', () => {
      const frames = [createFrame([])];

      expect(canDisplayScore(frames, 0)).toBe(false);
    });

    it('should return true for complete open frame', () => {
      const frames = [createFrame([5, 3])];

      expect(canDisplayScore(frames, 0)).toBe(true);
    });

    it('should return false for strike without bonus rolls', () => {
      const frames = [createFrame([10], true)];

      expect(canDisplayScore(frames, 0)).toBe(false);
    });

    it('should return true for strike with sufficient bonus rolls', () => {
      const frames = [createFrame([10], true), createFrame([5, 3])];

      expect(canDisplayScore(frames, 0)).toBe(true);
    });

    it('should return false for spare without bonus roll', () => {
      const frames = [createFrame([5, 5], false, true)];

      // The function returns undefined when there's no next frame,
      // which is falsy, so we check for that
      expect(canDisplayScore(frames, 0)).toBeFalsy();
    });

    it('should return true for spare with bonus roll', () => {
      const frames = [createFrame([5, 5], false, true), createFrame([7, 2])];

      expect(canDisplayScore(frames, 0)).toBe(true);
    });
  });

  describe('getFrameColorCode', () => {
    it('should return strike color for strike frame', () => {
      const frame = createFrame([10], true);

      expect(getFrameColorCode(frame)).toBe('strike');
    });

    it('should return spare color for spare frame', () => {
      const frame = createFrame([5, 5], false, true);

      expect(getFrameColorCode(frame)).toBe('spare');
    });

    it('should return open color for open frame', () => {
      const frame = createFrame([5, 3]);

      expect(getFrameColorCode(frame)).toBe('open');
    });

    it('should return default color for empty frame', () => {
      const frame = createFrame([]);

      expect(getFrameColorCode(frame)).toBe('default');
    });
  });

  describe('getGameStatusDisplay', () => {
    it('should return Game Complete for completed game', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [[createFrame([10], true)]];
      const game = { ...createGame(players, frames), isComplete: true };

      expect(getGameStatusDisplay(game)).toBe('Game Complete');
    });

    it('should return current player and frame for active game', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [[createFrame([5])]];
      const game = createGame(players, frames);

      expect(getGameStatusDisplay(game)).toBe("John's turn - Frame 1");
    });
  });

  describe('getCurrentRollDisplay', () => {
    it('should return Roll 1 for new frame', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [[createFrame([])]];
      const game = createGame(players, frames);

      expect(getCurrentRollDisplay(game)).toBe('Roll 1');
    });

    it('should return Strike! for strike frame', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [[createFrame([10], true)]];
      const game = createGame(players, frames);

      expect(getCurrentRollDisplay(game)).toBe('Strike!');
    });

    it('should return Roll 2 for frame with one roll', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [[createFrame([5])]];
      const game = createGame(players, frames);

      expect(getCurrentRollDisplay(game)).toBe('Roll 2');
    });

    it('should handle 10th frame correctly', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [
        [...Array(9).fill(createFrame([])), createFrame([10], true)],
      ];
      const game = { ...createGame(players, frames), currentFrame: 9 };

      expect(getCurrentRollDisplay(game)).toBe('Roll 2');
    });
  });

  describe('formatScore', () => {
    it('should format number score', () => {
      expect(formatScore(120)).toBe('120');
    });

    it('should return empty string for undefined score', () => {
      expect(formatScore(undefined)).toBe('');
    });

    it('should return empty string for null score', () => {
      expect(formatScore(null as any)).toBe('');
    });
  });

  describe('getRollResultMessage', () => {
    it('should return Strike! for strike', () => {
      expect(getRollResultMessage(10, true, false)).toBe('Strike!');
    });

    it('should return Spare! for spare', () => {
      expect(getRollResultMessage(5, false, true)).toBe('Spare!');
    });

    it('should return gutter ball message for 0 pins', () => {
      expect(getRollResultMessage(0, false, false)).toBe('Gutter ball!');
    });

    it('should return singular message for 1 pin', () => {
      expect(getRollResultMessage(1, false, false)).toBe(
        'You knocked down 1 pin'
      );
    });

    it('should return plural message for multiple pins', () => {
      expect(getRollResultMessage(7, false, false)).toBe(
        'You knocked down 7 pins'
      );
    });
  });

  describe('getRemainingPins', () => {
    it('should return empty array for strike', () => {
      expect(getRemainingPins(10)).toEqual([]);
    });

    it('should return correct number of pins remaining', () => {
      const remaining = getRemainingPins(7);
      expect(remaining.length).toBe(3);
      expect(remaining).toEqual([1, 2, 3]);
    });

    it('should handle 0 pins knocked', () => {
      const remaining = getRemainingPins(0);
      expect(remaining.length).toBe(10);
    });
  });

  describe('canKnockDownPins', () => {
    it('should allow valid first roll', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [[createFrame([])]];
      const game = createGame(players, frames);

      expect(canKnockDownPins(game, 7)).toBe(true);
    });

    it('should allow valid second roll', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [[createFrame([5])]];
      const game = createGame(players, frames);

      expect(canKnockDownPins(game, 3)).toBe(true);
    });

    it('should reject invalid second roll sum', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [[createFrame([5])]];
      const game = createGame(players, frames);

      expect(canKnockDownPins(game, 6)).toBe(false);
    });

    it('should handle 10th frame with strike correctly', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [[...Array(9).fill(createFrame([])), createFrame([10])]];
      const game = { ...createGame(players, frames), currentFrame: 9 };

      expect(canKnockDownPins(game, 10)).toBe(true);
    });

    it('should handle missing frame data', () => {
      const players = [createPlayer('1', 'John')];
      const frames = [[]];
      const game = createGame(players, frames);

      expect(canKnockDownPins(game, 7)).toBe(true);
    });
  });
});
