/**
 * History Storage Service
 * Provides functionality to save, retrieve, and manage game history
 */

import { Game, GameFilter } from '../../types';
import {
  getValue,
  setValue,
  removeValue,
  hasKey,
  STORAGE_KEYS,
} from './mmkvStorage';

// Game key prefix for individual game storage
const GAME_KEY_PREFIX = 'BowlingApp.Game.';

/**
 * Save a completed game to storage
 * @param game The completed game to save
 * @returns Promise resolving to true if successful
 */
export const saveGame = async (game: Game): Promise<boolean> => {
  try {
    // Ensure the game has an ID
    if (!game.id) {
      game.id = `game_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;
    }

    // Ensure the game has a date
    if (!game.date) {
      game.date = new Date().toISOString();
    }

    // Save the individual game
    const gameKey = `${GAME_KEY_PREFIX}${game.id}`;
    const savedGame = setValue(gameKey, game);

    if (!savedGame) {
      console.error('Failed to save game');
      return false;
    }

    // Update the game history index
    const historyIndex = getGameHistoryIndex();
    if (!historyIndex.includes(game.id)) {
      historyIndex.push(game.id);
      const savedIndex = setValue(
        STORAGE_KEYS.GAME_HISTORY_INDEX,
        historyIndex
      );

      if (!savedIndex) {
        console.error('Failed to update game history index');
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error saving game:', error);
    return false;
  }
};

/**
 * Get the list of game IDs from storage
 * @returns Array of game IDs
 */
export const getGameHistoryIndex = (): string[] => {
  try {
    const index = getValue<string[]>(STORAGE_KEYS.GAME_HISTORY_INDEX);
    return index || [];
  } catch (error) {
    console.error('Error retrieving game history index:', error);
    return [];
  }
};

/**
 * Retrieve a specific game by ID
 * @param gameId The ID of the game to retrieve
 * @returns The game or null if not found
 */
export const getGameById = async (gameId: string): Promise<Game | null> => {
  try {
    const gameKey = `${GAME_KEY_PREFIX}${gameId}`;
    return getValue<Game>(gameKey);
  } catch (error) {
    console.error('Error retrieving game:', error);
    return null;
  }
};

/**
 * Retrieve all saved games from storage
 * @returns Promise resolving to an array of games
 */
export const getAllGames = async (): Promise<Game[]> => {
  try {
    const gameIds = getGameHistoryIndex();
    const games: Game[] = [];

    for (const gameId of gameIds) {
      const game = await getGameById(gameId);
      if (game) {
        games.push(game);
      }
    }

    // Sort games by date (newest first)
    return games.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error retrieving all games:', error);
    return [];
  }
};

/**
 * Delete a game from storage
 * @param gameId The ID of the game to delete
 * @returns Promise resolving to true if successful
 */
export const deleteGame = async (gameId: string): Promise<boolean> => {
  try {
    // Remove from the index
    const historyIndex = getGameHistoryIndex();
    const updatedIndex = historyIndex.filter((id) => id !== gameId);
    const savedIndex = setValue(STORAGE_KEYS.GAME_HISTORY_INDEX, updatedIndex);

    if (!savedIndex) {
      console.error('Failed to update game history index while deleting');
      return false;
    }

    // Delete the game data
    const gameKey = `${GAME_KEY_PREFIX}${gameId}`;
    return removeValue(gameKey);
  } catch (error) {
    console.error('Error deleting game:', error);
    return false;
  }
};

/**
 * Filter games based on criteria
 * @param filter Filter criteria
 * @returns Promise resolving to filtered games
 */
export const filterGames = async (filter: GameFilter): Promise<Game[]> => {
  try {
    const allGames = await getAllGames();

    return allGames.filter((game) => {
      // Filter by date range
      if (
        filter.startDate &&
        new Date(game.date) < new Date(filter.startDate)
      ) {
        return false;
      }

      if (filter.endDate && new Date(game.date) > new Date(filter.endDate)) {
        return false;
      }

      // Filter by player
      if (filter.playerIds && filter.playerIds.length > 0) {
        const gameHasPlayer = game.players.some((player) =>
          filter.playerIds?.includes(player.id)
        );

        if (!gameHasPlayer) {
          return false;
        }
      }

      // Filter by score range
      if (filter.minScore !== undefined || filter.maxScore !== undefined) {
        const anyPlayerMatchesScore = game.players.some((player, index) => {
          const score = game.scores?.[index] ?? 0;

          if (filter.minScore !== undefined && score < filter.minScore) {
            return false;
          }

          if (filter.maxScore !== undefined && score > filter.maxScore) {
            return false;
          }

          return true;
        });

        if (!anyPlayerMatchesScore) {
          return false;
        }
      }

      return true;
    });
  } catch (error) {
    console.error('Error filtering games:', error);
    return [];
  }
};

/**
 * Clear all game history
 * @returns Promise resolving to true if successful
 */
export const clearGameHistory = async (): Promise<boolean> => {
  try {
    const gameIds = getGameHistoryIndex();

    // Delete all individual games
    for (const gameId of gameIds) {
      const gameKey = `${GAME_KEY_PREFIX}${gameId}`;
      removeValue(gameKey);
    }

    // Clear the index
    return setValue(STORAGE_KEYS.GAME_HISTORY_INDEX, []);
  } catch (error) {
    console.error('Error clearing game history:', error);
    return false;
  }
};
