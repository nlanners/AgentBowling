/**
 * Bowling game constants
 */

/** Number of frames in a standard bowling game */
export const FRAMES_PER_GAME = 10 as const;

/** Maximum number of pins in a standard bowling frame */
export const MAX_PINS = 10 as const;

/** Maximum number of rolls in a standard frame */
export const MAX_ROLLS_PER_FRAME = 2 as const;

/** Maximum number of rolls in the 10th frame */
export const MAX_ROLLS_TENTH_FRAME = 3 as const;

/** Storage keys for persistence */
export const STORAGE_KEYS = {
  CURRENT_GAME: 'BowlingApp:CurrentGame',
  PLAYERS: 'BowlingApp:Players',
  GAME_HISTORY: 'BowlingApp:GameHistory',
  THEME: 'BowlingApp:Theme',
} as const;
