import { Frame } from '../../types/frame';
import { Game } from '../../types/game';
import { Player } from '../../types/player';

/**
 * Validates the entire game state for integrity and compliance with bowling rules
 * @param game The game to validate
 * @returns An object with validation status and errors if any are found
 */
export function validateGameState(game: Game): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check if the game structure is valid
  if (!game.players || game.players.length === 0) {
    errors.push('Game must have at least one player');
  }

  if (!game.frames || game.frames.length === 0) {
    errors.push('Game must have frames');
  } else {
    // Check if the number of frame arrays matches the number of players
    if (game.frames.length !== game.players.length) {
      errors.push('Number of frame arrays must match the number of players');
    }

    // Check each player's frames
    for (let i = 0; i < game.frames.length; i++) {
      const playerFrames = game.frames[i];

      // Check if there are 10 frames
      if (playerFrames.length !== 10) {
        errors.push(`Player ${i + 1} must have exactly 10 frames`);
      }

      // Validate each frame
      for (let j = 0; j < playerFrames.length; j++) {
        const frame = playerFrames[j];
        const frameValidation = validateFrame(frame, j === 9);

        if (!frameValidation.valid) {
          frameValidation.errors.forEach((error) => {
            errors.push(`Player ${i + 1}, Frame ${j + 1}: ${error}`);
          });
        }
      }

      // Validate the score calculation
      validateScoreCalculation(playerFrames).errors.forEach((error) => {
        errors.push(`Player ${i + 1}: ${error}`);
      });
    }
  }

  // Validate current player and frame indices
  if (
    game.currentPlayer < 0 ||
    (game.players && game.currentPlayer >= game.players.length)
  ) {
    errors.push('Current player index is out of bounds');
  }

  if (game.currentFrame < 0 || game.currentFrame > 9) {
    errors.push('Current frame index is out of bounds');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a single frame for compliance with bowling rules
 * @param frame The frame to validate
 * @param isTenthFrame Whether this is the 10th frame (which has special rules)
 * @returns An object with validation status and errors if any are found
 */
export function validateFrame(
  frame: Frame,
  isTenthFrame: boolean
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if rolls array exists
  if (!frame.rolls) {
    errors.push('Frame must have rolls array');
    return { valid: false, errors };
  }

  // Check the number of rolls
  if (!isTenthFrame) {
    // Regular frames can have at most 2 rolls
    if (frame.rolls.length > 2) {
      errors.push('Regular frame cannot have more than 2 rolls');
    }

    // If it's a strike, it should only have 1 roll
    if (frame.isStrike && frame.rolls.length > 1) {
      errors.push('A strike frame should only have 1 roll');
    }
  } else {
    // 10th frame can have at most 3 rolls
    if (frame.rolls.length > 3) {
      errors.push('10th frame cannot have more than 3 rolls');
    }

    // If it's not a strike or spare, it should have at most 2 rolls
    if (!frame.isStrike && !frame.isSpare && frame.rolls.length > 2) {
      errors.push(
        '10th frame can only have 3 rolls if there is a strike or spare'
      );
    }
  }

  // Check pin count for each roll
  for (let i = 0; i < frame.rolls.length; i++) {
    const roll = frame.rolls[i];

    // Check if pins knocked is valid
    if (roll.pinsKnocked < 0 || roll.pinsKnocked > 10) {
      errors.push(`Roll ${i + 1} has invalid pin count: ${roll.pinsKnocked}`);
    }

    // For non-10th frames, check that the sum of first and second roll doesn't exceed 10
    if (
      !isTenthFrame &&
      i === 1 &&
      frame.rolls[0].pinsKnocked + roll.pinsKnocked > 10
    ) {
      errors.push(
        `Sum of pins in frame exceeds 10: ${frame.rolls[0].pinsKnocked} + ${roll.pinsKnocked}`
      );
    }

    // For 10th frame, special checks for the second and third rolls
    if (isTenthFrame) {
      if (
        i === 1 &&
        !frame.isStrike &&
        frame.rolls[0].pinsKnocked + roll.pinsKnocked > 10
      ) {
        errors.push(
          `Sum of first two rolls in 10th frame exceeds 10: ${frame.rolls[0].pinsKnocked} + ${roll.pinsKnocked}`
        );
      }

      if (i === 2) {
        // If first roll was a strike, second roll can be anything
        if (frame.rolls[0].pinsKnocked === 10) {
          // If second roll was also a strike, third roll can be anything
          if (frame.rolls[1].pinsKnocked === 10) {
            // All good
          } else {
            // If second roll wasn't a strike, the sum of second and third shouldn't exceed 10
            if (frame.rolls[1].pinsKnocked + roll.pinsKnocked > 10) {
              errors.push(
                `After strike in 10th frame, sum of second and third rolls exceeds 10: ${frame.rolls[1].pinsKnocked} + ${roll.pinsKnocked}`
              );
            }
          }
        }
        // If first two rolls were a spare, third roll can be anything
        else if (
          frame.rolls[0].pinsKnocked + frame.rolls[1].pinsKnocked ===
          10
        ) {
          // All good
        }
        // Otherwise, there shouldn't be a third roll
        else {
          errors.push(
            'Third roll in 10th frame is only allowed after a strike or spare'
          );
        }
      }
    }
  }

  // Validate strike and spare flags
  if (frame.rolls.length > 0) {
    const isActualStrike = frame.rolls[0].pinsKnocked === 10;
    if (frame.isStrike !== isActualStrike) {
      errors.push(
        `Strike flag is inconsistent with roll values. Flag: ${frame.isStrike}, First roll: ${frame.rolls[0].pinsKnocked}`
      );
    }

    if (frame.rolls.length > 1) {
      const isActualSpare =
        !isActualStrike &&
        frame.rolls[0].pinsKnocked + frame.rolls[1].pinsKnocked === 10;
      if (frame.isSpare !== isActualSpare) {
        errors.push(
          `Spare flag is inconsistent with roll values. Flag: ${frame.isSpare}, First roll: ${frame.rolls[0].pinsKnocked}, Second roll: ${frame.rolls[1].pinsKnocked}`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates score calculation for a player's frames
 * @param frames Array of frames to validate
 * @returns An object with validation status and errors if any are found
 */
export function validateScoreCalculation(frames: Frame[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  let runningTotal = 0;

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];

    // Skip frames with no rolls
    if (frame.rolls.length === 0) continue;

    // Calculate the expected score for this frame
    const expectedScore = calculateExpectedScore(frames, i);

    // Check if the frame score is calculated correctly
    if (frame.score !== expectedScore) {
      errors.push(
        `Frame ${
          i + 1
        } score is incorrect. Expected: ${expectedScore}, Actual: ${
          frame.score
        }`
      );
    }

    // Update running total
    runningTotal += expectedScore;

    // Check if the cumulative score is calculated correctly
    if (frame.cumulativeScore !== runningTotal) {
      errors.push(
        `Frame ${
          i + 1
        } cumulative score is incorrect. Expected: ${runningTotal}, Actual: ${
          frame.cumulativeScore
        }`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculates the expected score for a frame based on rolls
 * @param frames Array of all frames
 * @param frameIndex Index of the frame to calculate
 * @returns The expected score for the frame
 */
function calculateExpectedScore(frames: Frame[], frameIndex: number): number {
  const frame = frames[frameIndex];

  if (frame.rolls.length === 0) return 0;

  // Sum of pins knocked down in this frame
  const pinsKnocked = frame.rolls.reduce(
    (sum, roll) => sum + roll.pinsKnocked,
    0
  );

  // Strike case
  if (frame.isStrike) {
    let bonus = 0;
    let nextRollCount = 0;
    let nextFrameIndex = frameIndex + 1;

    // Look for the next two rolls (may be in next frame or two)
    while (nextRollCount < 2 && nextFrameIndex < frames.length) {
      const nextFrame = frames[nextFrameIndex];

      for (let i = 0; i < nextFrame.rolls.length && nextRollCount < 2; i++) {
        bonus += nextFrame.rolls[i].pinsKnocked;
        nextRollCount++;
      }

      nextFrameIndex++;
    }

    return 10 + bonus;
  }

  // Spare case
  if (frame.isSpare) {
    let bonus = 0;

    // Look for the next roll (may be in next frame)
    if (frameIndex < frames.length - 1) {
      const nextFrame = frames[frameIndex + 1];
      if (nextFrame.rolls.length > 0) {
        bonus = nextFrame.rolls[0].pinsKnocked;
      }
      // Special case for 10th frame spare
    } else if (frameIndex === 9 && frame.rolls.length > 2) {
      bonus = frame.rolls[2].pinsKnocked;
    }

    return 10 + bonus;
  }

  // Regular frame
  return pinsKnocked;
}

/**
 * Validates a player's name when creating or updating a player
 * @param name The player name to validate
 * @returns An object with validation status and error message if invalid
 */
export function validatePlayerName(name: string): {
  valid: boolean;
  error?: string;
} {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return {
      valid: false,
      error: 'Player name cannot be empty',
    };
  }

  if (trimmedName.length < 2) {
    return {
      valid: false,
      error: 'Player name must be at least 2 characters',
    };
  }

  if (trimmedName.length > 20) {
    return {
      valid: false,
      error: 'Player name cannot exceed 20 characters',
    };
  }

  // Check for invalid characters (only alphanumeric and spaces allowed)
  if (!/^[a-zA-Z0-9 ]+$/.test(trimmedName)) {
    return {
      valid: false,
      error: 'Player name can only contain letters, numbers, and spaces',
    };
  }

  return { valid: true };
}

/**
 * Validates if a game can be created with the given players
 * @param players Array of players to validate
 * @returns An object with validation status and errors if any are found
 */
export function validateGameCreation(players: Player[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!players || players.length === 0) {
    errors.push('At least one player is required to start a game');
    return { valid: false, errors };
  }

  if (players.length > 6) {
    errors.push('Maximum of 6 players allowed per game');
  }

  // Check for duplicate player names
  const playerNames = new Set<string>();
  players.forEach((player) => {
    const playerNameValidation = validatePlayerName(player.name);
    if (!playerNameValidation.valid) {
      errors.push(
        `Invalid player name "${player.name}": ${playerNameValidation.error}`
      );
    }

    if (playerNames.has(player.name.toLowerCase())) {
      errors.push(`Duplicate player name: ${player.name}`);
    } else {
      playerNames.add(player.name.toLowerCase());
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a roll attempt in the current game state
 * @param game Current game state
 * @param pinsKnocked Number of pins to be knocked down
 * @returns An object with validation status and error message if invalid
 */
export function validateRollAttempt(
  game: Game,
  pinsKnocked: number
): {
  valid: boolean;
  error?: string;
} {
  // Check if the game is already complete
  if (game.isComplete) {
    return {
      valid: false,
      error: 'Cannot add rolls to a completed game',
    };
  }

  // Basic validation for the number of pins
  if (pinsKnocked < 0 || pinsKnocked > 10) {
    return {
      valid: false,
      error: 'Invalid number of pins (must be between 0 and 10)',
    };
  }

  const { currentPlayer, currentFrame } = game;
  const playerFrames = game.frames[currentPlayer];
  const frame = playerFrames[currentFrame];

  // For frames 1-9
  if (currentFrame < 9) {
    // First roll is always valid if between 0-10
    if (frame.rolls.length === 0) {
      return { valid: true };
    }
    // Second roll - check that the sum doesn't exceed 10
    else if (frame.rolls.length === 1) {
      const firstRoll = frame.rolls[0].pinsKnocked;
      if (firstRoll + pinsKnocked > 10) {
        return {
          valid: false,
          error: `Cannot knock down ${pinsKnocked} pins after knocking down ${firstRoll} in the first roll (total must be ≤ 10)`,
        };
      }
    }
    // No more than 2 rolls allowed in regular frames
    else {
      return {
        valid: false,
        error: 'Cannot add more than 2 rolls to a regular frame',
      };
    }
  }
  // For the 10th frame
  else {
    // First roll is always valid if between 0-10
    if (frame.rolls.length === 0) {
      return { valid: true };
    }
    // Second roll - depends on the first roll
    else if (frame.rolls.length === 1) {
      const firstRoll = frame.rolls[0].pinsKnocked;
      // If first roll was a strike, any valid roll is allowed
      if (firstRoll === 10) {
        return { valid: true };
      }
      // Otherwise, ensure the sum doesn't exceed 10
      else if (firstRoll + pinsKnocked > 10) {
        return {
          valid: false,
          error: `Cannot knock down ${pinsKnocked} pins after knocking down ${firstRoll} in the first roll (total must be ≤ 10)`,
        };
      }
    }
    // Third roll - only allowed after a strike or spare
    else if (frame.rolls.length === 2) {
      const firstRoll = frame.rolls[0].pinsKnocked;
      const secondRoll = frame.rolls[1].pinsKnocked;

      // Strike in first roll
      if (firstRoll === 10) {
        // Strike in second roll - any valid roll allowed
        if (secondRoll === 10) {
          return { valid: true };
        }
        // Non-strike in second roll - ensure sum doesn't exceed 10
        else if (secondRoll + pinsKnocked > 10) {
          return {
            valid: false,
            error: `Cannot knock down ${pinsKnocked} pins after knocking down ${secondRoll} in the second roll (total must be ≤ 10)`,
          };
        }
      }
      // Spare in first two rolls - any valid roll allowed
      else if (firstRoll + secondRoll === 10) {
        return { valid: true };
      }
      // Otherwise, no third roll allowed
      else {
        return {
          valid: false,
          error:
            'Third roll in the 10th frame is only allowed after a strike or spare',
        };
      }
    }
    // No more than 3 rolls allowed in the 10th frame
    else {
      return {
        valid: false,
        error: 'Cannot add more than 3 rolls to the 10th frame',
      };
    }
  }

  return { valid: true };
}

/**
 * Validates a sequence of rolls for adherence to bowling rules
 * @param rolls Array of pin counts representing a sequence of rolls
 * @returns An object with validation status and errors if any are found
 */
export function validateRollSequence(rolls: number[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  let frameIndex = 0;
  let rollInFrame = 0;

  // Process all rolls
  for (let i = 0; i < rolls.length; i++) {
    const pins = rolls[i];

    // Basic validation for pin count
    if (pins < 0 || pins > 10) {
      errors.push(`Invalid pin count at roll ${i + 1}: ${pins}`);
      continue;
    }

    // For frames 1-9
    if (frameIndex < 9) {
      // First roll in frame
      if (rollInFrame === 0) {
        if (pins === 10) {
          // Strike - move to next frame
          frameIndex++;
          rollInFrame = 0;
        } else {
          // Non-strike - move to second roll of frame
          rollInFrame = 1;
        }
      }
      // Second roll in frame
      else {
        // Validate sum of pins in frame
        const previousPins = rolls[i - 1];
        if (previousPins + pins > 10) {
          errors.push(
            `Invalid frame at roll ${i}: sum of pins (${previousPins} + ${pins}) exceeds 10`
          );
        }

        // Move to next frame
        frameIndex++;
        rollInFrame = 0;
      }
    }
    // 10th frame
    else if (frameIndex === 9) {
      // First roll in 10th frame
      if (rollInFrame === 0) {
        rollInFrame = 1;
      }
      // Second roll in 10th frame
      else if (rollInFrame === 1) {
        const firstRoll = rolls[i - 1];

        // If first roll wasn't a strike, validate sum
        if (firstRoll < 10 && firstRoll + pins > 10) {
          errors.push(
            `Invalid 10th frame: sum of first two rolls (${firstRoll} + ${pins}) exceeds 10`
          );
        }

        // Determine if a third roll is allowed
        if (firstRoll === 10 || firstRoll + pins === 10) {
          // Strike or spare - third roll allowed
          rollInFrame = 2;
        } else {
          // Neither strike nor spare - game over
          if (i < rolls.length - 1) {
            errors.push(
              `Extra roll(s) after 10th frame without strike or spare`
            );
          }
          break;
        }
      }
      // Third roll in 10th frame
      else if (rollInFrame === 2) {
        const firstRoll = rolls[i - 2];
        const secondRoll = rolls[i - 1];

        // If second roll was a strike after a strike, any roll is valid
        if (firstRoll === 10 && secondRoll === 10) {
          // Valid
        }
        // If first roll was strike but second wasn't, validate sum
        else if (
          firstRoll === 10 &&
          secondRoll < 10 &&
          secondRoll + pins > 10
        ) {
          errors.push(
            `Invalid 10th frame: sum of second and third rolls (${secondRoll} + ${pins}) exceeds 10`
          );
        }

        // Game over after third roll in 10th frame
        if (i < rolls.length - 1) {
          errors.push(`Extra roll(s) after completing the 10th frame`);
        }
        break;
      }
    }
    // Beyond 10th frame
    else {
      errors.push(`Extra roll(s) beyond the 10th frame`);
      break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a roll attempt for a frame
 * @param pinsKnocked Number of pins knocked down
 * @param rollNumber Roll number (1, 2, or 3)
 * @param isTenthFrame Whether this is the 10th frame
 * @param previousRoll1 Pins knocked down in the first roll (for 2nd and 3rd rolls)
 * @param previousRoll2 Pins knocked down in the second roll (for 3rd roll)
 * @returns Validation result with status and any errors
 */
export function validateRoll(
  pinsKnocked: number,
  rollNumber: number,
  isTenthFrame: boolean,
  previousRoll1?: number,
  previousRoll2?: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Basic pin count validation
  if (pinsKnocked < 0 || pinsKnocked > 10) {
    errors.push('Pins knocked down must be between 0 and 10');
  }

  // Validate second roll
  if (rollNumber === 2 && previousRoll1 !== undefined && !isTenthFrame) {
    // In a regular frame, total pins cannot exceed 10
    if (previousRoll1 + pinsKnocked > 10) {
      errors.push('Total pins knocked down in a frame cannot exceed 10');
    }
  }

  // Validate third roll
  if (rollNumber === 3) {
    if (!isTenthFrame) {
      errors.push('Cannot have a third roll in a regular frame');
    } else if (previousRoll1 !== undefined && previousRoll2 !== undefined) {
      // In 10th frame, need a strike or spare to get a third roll
      const isStrike = previousRoll1 === 10;
      const isSpare = !isStrike && previousRoll1 + previousRoll2 === 10;

      if (!isStrike && !isSpare) {
        errors.push(
          'Third roll in 10th frame only allowed after a strike or spare'
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
