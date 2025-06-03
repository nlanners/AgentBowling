/**
 * Statistics storage service
 * Manages caching and retrieval of player statistics
 */

import { MMKV } from 'react-native-mmkv';
import { Player, PlayerStatistics, Game } from '../../types';
import { calculatePlayerStatistics } from '../../utils/statistics';
import * as HistoryStorage from './history';

// Initialize MMKV storage for statistics
const statisticsStorage = new MMKV({
  id: 'bowling-statistics',
  encryptionKey: 'statistics-key',
});

// Keys for storage
const STATS_PREFIX = 'player_stats_';
const STATS_TIMESTAMP_PREFIX = 'player_stats_timestamp_';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Get the storage key for a player's statistics
 */
const getPlayerStatsKey = (playerId: string): string =>
  `${STATS_PREFIX}${playerId}`;

/**
 * Get the storage key for a player's statistics timestamp
 */
const getPlayerStatsTimestampKey = (playerId: string): string =>
  `${STATS_TIMESTAMP_PREFIX}${playerId}`;

/**
 * Save player statistics to cache
 */
export const savePlayerStatistics = (playerStats: PlayerStatistics): void => {
  const playerStatsKey = getPlayerStatsKey(playerStats.playerId);
  const timestampKey = getPlayerStatsTimestampKey(playerStats.playerId);

  // Save stats and timestamp
  statisticsStorage.set(playerStatsKey, JSON.stringify(playerStats));
  statisticsStorage.set(timestampKey, Date.now().toString());
};

/**
 * Check if cached statistics are still valid
 */
export const isStatsCacheValid = (playerId: string): boolean => {
  const timestampKey = getPlayerStatsTimestampKey(playerId);
  const timestamp = statisticsStorage.getString(timestampKey);

  if (!timestamp) return false;

  const cachedTime = parseInt(timestamp, 10);
  const currentTime = Date.now();

  // Check if cache is within the valid duration
  return currentTime - cachedTime < CACHE_DURATION;
};

/**
 * Get cached player statistics if available
 */
const getCachedPlayerStatistics = (
  playerId: string
): PlayerStatistics | null => {
  // Check if valid cache exists
  if (!isStatsCacheValid(playerId)) return null;

  const playerStatsKey = getPlayerStatsKey(playerId);
  const statsString = statisticsStorage.getString(playerStatsKey);

  if (!statsString) return null;

  try {
    return JSON.parse(statsString) as PlayerStatistics;
  } catch (error) {
    console.error('Error parsing cached player statistics:', error);
    return null;
  }
};

/**
 * Calculate and cache player statistics
 */
const calculateAndCachePlayerStatistics = async (
  player: Player
): Promise<PlayerStatistics> => {
  // Get all games
  const games = await HistoryStorage.getAllGames();

  // Calculate statistics
  const stats = calculatePlayerStatistics(games, player);

  // Cache the statistics
  savePlayerStatistics(stats);

  return stats;
};

/**
 * Get player statistics, using cache when available
 */
export const getPlayerStatistics = async (
  player: Player
): Promise<PlayerStatistics> => {
  // Try to get from cache first
  const cachedStats = getCachedPlayerStatistics(player.id);

  // If valid cache exists, return it
  if (cachedStats) {
    return cachedStats;
  }

  // Otherwise calculate and cache new stats
  return calculateAndCachePlayerStatistics(player);
};

/**
 * Get statistics for multiple players
 */
export const getMultiplePlayersStatistics = async (
  players: Player[]
): Promise<Map<string, PlayerStatistics>> => {
  const statsMap = new Map<string, PlayerStatistics>();

  // Process each player
  await Promise.all(
    players.map(async (player) => {
      const stats = await getPlayerStatistics(player);
      statsMap.set(player.id, stats);
    })
  );

  return statsMap;
};

/**
 * Invalidate statistics cache for a player
 */
export const invalidatePlayerStatsCache = (playerId: string): void => {
  const playerStatsKey = getPlayerStatsKey(playerId);
  const timestampKey = getPlayerStatsTimestampKey(playerId);

  statisticsStorage.delete(playerStatsKey);
  statisticsStorage.delete(timestampKey);
};

/**
 * Invalidate statistics cache for all players
 */
export const invalidateAllStatsCache = (): void => {
  const allKeys = statisticsStorage.getAllKeys();

  allKeys.forEach((key) => {
    if (
      key.startsWith(STATS_PREFIX) ||
      key.startsWith(STATS_TIMESTAMP_PREFIX)
    ) {
      statisticsStorage.delete(key);
    }
  });
};

/**
 * Update statistics after a game is added or updated
 */
export const updateStatisticsAfterGameChange = async (
  game: Game
): Promise<void> => {
  // Invalidate cache for all players in the game
  game.players.forEach((player) => {
    invalidatePlayerStatsCache(player.id);
  });
};

/**
 * Clear all statistics data
 */
export const clearAllStatistics = (): void => {
  invalidateAllStatsCache();
};

// Export for testing
export const _statisticsStorage = statisticsStorage;
