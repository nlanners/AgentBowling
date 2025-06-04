/**
 * Statistics Storage Service
 * Provides functionality to save, retrieve, and manage player statistics
 */

import { Player, PlayerStatistics } from '../../types';
import { getValue, setValue, removeValue, hasKey } from './mmkvStorage';
import {
  calculatePlayerStatistics,
  calculateAllPlayersStatistics,
} from '../../utils/statistics';
import * as HistoryStorage from './history';

// Statistics key prefix for individual player statistics storage
const STATS_KEY_PREFIX = 'BowlingApp.Statistics.';

// Statistics cache TTL in milliseconds (24 hours)
const STATS_CACHE_TTL = 24 * 60 * 60 * 1000;

/**
 * Get player statistics from storage or calculate if not available
 * @param player The player to get statistics for
 * @returns Promise resolving to player statistics
 */
export const getPlayerStatistics = async (
  player: Player
): Promise<PlayerStatistics> => {
  try {
    const cacheKey = `${STATS_KEY_PREFIX}${player.id}`;

    // Check if cached statistics exist and are still valid
    const cachedStats = getValue<PlayerStatistics & { timestamp?: number }>(
      cacheKey
    );

    if (cachedStats && cachedStats.timestamp) {
      const now = Date.now();
      const cacheAge = now - cachedStats.timestamp;

      // Use cached stats if they're still fresh
      if (cacheAge < STATS_CACHE_TTL) {
        return cachedStats;
      }
    }

    // If no valid cache exists, calculate statistics
    const games = await HistoryStorage.getAllGames();
    const stats = calculatePlayerStatistics(games, player);

    // Add timestamp and save to cache
    const statsWithTimestamp = {
      ...stats,
      timestamp: Date.now(),
    };

    setValue(cacheKey, statsWithTimestamp);
    return stats;
  } catch (error) {
    console.error('Error getting player statistics:', error);
    throw error;
  }
};

/**
 * Get statistics for multiple players
 * @param players Array of players to get statistics for
 * @returns Promise resolving to a map of player IDs to statistics
 */
export const getMultiplePlayersStatistics = async (
  players: Player[]
): Promise<Map<string, PlayerStatistics>> => {
  try {
    const result = new Map<string, PlayerStatistics>();
    const playersToCalculate: Player[] = [];

    // First try to get statistics from cache
    for (const player of players) {
      const cacheKey = `${STATS_KEY_PREFIX}${player.id}`;
      const cachedStats = getValue<PlayerStatistics & { timestamp?: number }>(
        cacheKey
      );

      if (cachedStats && cachedStats.timestamp) {
        const now = Date.now();
        const cacheAge = now - cachedStats.timestamp;

        if (cacheAge < STATS_CACHE_TTL) {
          result.set(player.id, cachedStats);
          continue;
        }
      }

      // Add to list of players needing calculation
      playersToCalculate.push(player);
    }

    // Calculate statistics for remaining players
    if (playersToCalculate.length > 0) {
      const games = await HistoryStorage.getAllGames();
      const calculatedStats = calculateAllPlayersStatistics(
        games,
        playersToCalculate
      );

      // Save calculated statistics to cache
      calculatedStats.forEach((stats, playerId) => {
        const statsWithTimestamp = {
          ...stats,
          timestamp: Date.now(),
        };

        setValue(`${STATS_KEY_PREFIX}${playerId}`, statsWithTimestamp);
        result.set(playerId, stats);
      });
    }

    return result;
  } catch (error) {
    console.error('Error getting multiple player statistics:', error);
    throw error;
  }
};

/**
 * Invalidate cached statistics for a specific player
 * @param playerId Player ID to invalidate statistics for
 */
export const invalidatePlayerStatsCache = (playerId: string): void => {
  try {
    const cacheKey = `${STATS_KEY_PREFIX}${playerId}`;
    removeValue(cacheKey);
  } catch (error) {
    console.error('Error invalidating player statistics cache:', error);
  }
};

/**
 * Update statistics after a game change (add/update/delete)
 * @param game The game that was changed
 */
export const updateStatisticsAfterGameChange = async (
  game: any
): Promise<void> => {
  try {
    // Invalidate cache for all players in the game
    game.players.forEach((player: any) => {
      invalidatePlayerStatsCache(player.id);
    });
  } catch (error) {
    console.error('Error updating statistics after game change:', error);
  }
};

/**
 * Clear all statistics for all players
 */
export const clearAllStatistics = async (): Promise<void> => {
  try {
    const allGames = await HistoryStorage.getAllGames();
    const playerIds = new Set<string>();

    // Collect all player IDs
    allGames.forEach((game) => {
      game.players.forEach((player) => {
        playerIds.add(player.id);
      });
    });

    // Remove statistics for all players
    playerIds.forEach((playerId) => {
      invalidatePlayerStatsCache(playerId);
    });
  } catch (error) {
    console.error('Error clearing all statistics:', error);
  }
};
