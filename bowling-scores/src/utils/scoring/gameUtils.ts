import { Frame, Roll, FrameNumber } from '../../types/frame';
import { Game } from '../../types/game';
import {
  isStrike,
  isSpare,
  updateFrameFlags,
  calculateGameScore,
} from './calculateScore';
import { GameValidationHelper } from '../validation/gameValidationHelper';

/**
 * Creates a new empty frame
 * @returns An initialized empty Frame object
 */
export function createEmptyFrame(): Frame {
  return {
    rolls: [],
    isSpare: false,
    isStrike: false,
    score: 0,
    cumulativeScore: 0,
  };
}

/**
 * Initializes a game with empty frames for all players
 * @param game The game to initialize frames for
 * @returns A copy of the game with initialized frames
 */
export function initializeGameFrames(game: Game): Game {
  const updatedGame = { ...game };
  const frames: Frame[][] = [];

  // Create 10 empty frames for each player
  for (let playerIndex = 0; playerIndex < game.players.length; playerIndex++) {
    const playerFrames: Frame[] = [];
    for (let i = 0; i < 10; i++) {
      playerFrames.push(createEmptyFrame());
    }
    frames.push(playerFrames);
  }

  updatedGame.frames = frames;
  return updatedGame;
}

/**
 * Adds a roll to the current frame for the current player
 * @param game Current game state
 * @param pinsKnocked Number of pins knocked down in this roll
 * @returns Updated game with the new roll added
 */
export function addRoll(game: Game, pinsKnocked: number): Game {
  const updatedGame = { ...game };
  const { currentPlayer, currentFrame } = updatedGame;

  // Create a deep copy of the frames
  const frames = JSON.parse(JSON.stringify(updatedGame.frames)) as Frame[][];
  const currentPlayerFrames = frames[currentPlayer];
  const frame = currentPlayerFrames[currentFrame];

  // Create a new roll
  const roll: Roll = { pinsKnocked };

  // Add the roll to the current frame
  frame.rolls.push(roll);

  // Update strike/spare flags
  const updatedFrame = updateFrameFlags(frame);
  currentPlayerFrames[currentFrame] = updatedFrame;

  // Calculate new scores after adding the roll
  const updatedPlayerFrames = calculateGameScore(currentPlayerFrames);
  frames[currentPlayer] = updatedPlayerFrames;

  // Update the game frames
  updatedGame.frames = frames;

  // Determine if we need to advance to the next frame or player
  const { nextFrame, nextPlayer } = determineNextFrameAndPlayer(updatedGame);
  updatedGame.currentFrame = nextFrame;
  updatedGame.currentPlayer = nextPlayer;

  // Check if the game is complete
  updatedGame.isComplete = isGameComplete(updatedGame);

  // Update final scores if the game is complete
  if (updatedGame.isComplete) {
    updatedGame.scores = updatedGame.frames.map((playerFrames) => {
      const lastFrame = playerFrames[playerFrames.length - 1];
      return lastFrame.cumulativeScore;
    });
  }

  return updatedGame;
}

/**
 * Determines the next frame and player after a roll
 * @param game Current game state
 * @returns Object containing the index of the next frame and next player
 */
function determineNextFrameAndPlayer(game: Game): {
  nextFrame: number;
  nextPlayer: number;
} {
  const { currentPlayer, currentFrame, players, frames } = game;
  const playerFrames = frames[currentPlayer];
  const frame = playerFrames[currentFrame];

  // If we're in the 10th frame
  if (currentFrame === 9) {
    // If it's a strike or spare, the player gets extra rolls in the 10th frame
    if (frame.isStrike || frame.isSpare) {
      // If we don't have all the rolls yet, stay on the same frame/player
      if (
        (frame.isStrike && frame.rolls.length < 3) ||
        (frame.isSpare && frame.rolls.length < 3)
      ) {
        return { nextFrame: currentFrame, nextPlayer: currentPlayer };
      }
    } else {
      // Regular frame - player gets 2 rolls
      if (frame.rolls.length < 2) {
        return { nextFrame: currentFrame, nextPlayer: currentPlayer };
      }
    }

    // If we've completed rolls for this player in the 10th frame, move to the next player
    const nextPlayer = (currentPlayer + 1) % players.length;

    // If we're back to the first player, we've completed a round
    if (nextPlayer === 0) {
      // Game is over
      return { nextFrame: 9, nextPlayer: currentPlayer };
    }

    return { nextFrame: currentFrame, nextPlayer };
  }

  // For frames 1-9
  if (frame.isStrike) {
    // If it's a strike, move to the next frame for this player
    const nextFrame = currentFrame + 1;
    return { nextFrame, nextPlayer: currentPlayer };
  } else if (frame.rolls.length < 2) {
    // If we haven't made 2 rolls yet, stay on the same frame
    return { nextFrame: currentFrame, nextPlayer: currentPlayer };
  } else {
    // Move to the next frame after 2 rolls
    const nextFrame = currentFrame + 1;
    return { nextFrame, nextPlayer: currentPlayer };
  }
}

/**
 * Checks if the game is complete
 * @param game Current game state
 * @returns True if the game is complete, false otherwise
 */
export function isGameComplete(game: Game): boolean {
  return GameValidationHelper.isGameComplete(game);
}

/**
 * Creates a new game with the specified players
 * @param players Array of players for the game
 * @returns A new Game object
 */
export function createNewGame(players: Game['players']): Game {
  const game: Game = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    players,
    frames: [],
    currentFrame: 0,
    currentPlayer: 0,
    isComplete: false,
  };

  return initializeGameFrames(game);
}
