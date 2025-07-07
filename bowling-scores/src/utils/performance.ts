/**
 * Performance utilities
 * Provides memoization and caching helpers for expensive operations
 */

import { Game, Player, PlayerStatistics } from '../types';

// Simple cache implementation for expensive calculations
class SimpleCache<T> {
  private cache = new Map<string, { value: T; timestamp: number }>();
  private ttl: number;

  constructor(ttlMs: number = 5 * 60 * 1000) {
    // Default 5 minutes
    this.ttl = ttlMs;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key: string, value: T): void {
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Cache for game-related calculations
export const gameCalculationCache = new SimpleCache<any>(5 * 60 * 1000); // 5 minutes

// Cache for player statistics
export const playerStatsCache = new SimpleCache<PlayerStatistics>(
  10 * 60 * 1000
); // 10 minutes

/**
 * Memoization decorator for expensive functions
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Debounce function to prevent excessive calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle function to limit execution frequency
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Async operation wrapper with caching
 */
export async function cachedAsyncOperation<T>(
  key: string,
  operation: () => Promise<T>,
  cache: SimpleCache<T> = gameCalculationCache
): Promise<T> {
  // Try to get from cache first
  const cached = cache.get(key);
  if (cached !== null) {
    return cached;
  }

  // Execute operation and cache result
  const result = await operation();
  cache.set(key, result);
  return result;
}

/**
 * Generate cache key for game-related operations
 */
export function generateGameCacheKey(
  operation: string,
  gameId?: string,
  playerId?: string,
  ...additional: string[]
): string {
  const parts = [operation];
  if (gameId) parts.push(`game:${gameId}`);
  if (playerId) parts.push(`player:${playerId}`);
  parts.push(...additional);
  return parts.join('|');
}

/**
 * Generate cache key for player statistics
 */
export function generatePlayerStatsCacheKey(
  playerId: string,
  gamesCount: number,
  lastGameDate?: string
): string {
  const parts = [`player:${playerId}`, `count:${gamesCount}`];
  if (lastGameDate) parts.push(`lastGame:${lastGameDate}`);
  return parts.join('|');
}

/**
 * Clear game-related caches when game data changes
 */
export function invalidateGameCaches(gameId?: string, playerId?: string): void {
  if (gameId && playerId) {
    // Clear specific caches
    const patterns = [
      generateGameCacheKey('score', gameId, playerId),
      generateGameCacheKey('stats', gameId, playerId),
      generatePlayerStatsCacheKey(playerId, 0), // Clear player stats
    ];

    patterns.forEach((pattern) => {
      gameCalculationCache.delete(pattern);
      playerStatsCache.delete(pattern);
    });
  } else {
    // Clear all caches
    gameCalculationCache.clear();
    playerStatsCache.clear();
  }
}

/**
 * Batch operations helper to reduce renders
 */
export function batchOperations<T>(operations: (() => T)[]): T[] {
  return operations.map((op) => op());
}

/**
 * Check if arrays are equal (shallow comparison)
 */
export function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
}

/**
 * Check if objects have the same keys and values (shallow comparison)
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Performance monitoring helper
 */
export class PerformanceMonitor {
  private static measurements = new Map<string, number[]>();

  static startMeasurement(operation: string): () => void {
    const start = performance.now();

    return () => {
      const end = performance.now();
      const duration = end - start;

      if (!this.measurements.has(operation)) {
        this.measurements.set(operation, []);
      }

      this.measurements.get(operation)!.push(duration);

      // Keep only last 100 measurements
      const measurements = this.measurements.get(operation)!;
      if (measurements.length > 100) {
        measurements.shift();
      }

      if (__DEV__) {
        console.log(
          `⚡ Performance: ${operation} took ${duration.toFixed(2)}ms`
        );
      }
    };
  }

  static getAverageTime(operation: string): number {
    const measurements = this.measurements.get(operation);
    if (!measurements || measurements.length === 0) return 0;

    return (
      measurements.reduce((sum, time) => sum + time, 0) / measurements.length
    );
  }

  static getAllMeasurements(): Record<
    string,
    { average: number; count: number }
  > {
    const result: Record<string, { average: number; count: number }> = {};

    this.measurements.forEach((times, operation) => {
      result[operation] = {
        average: this.getAverageTime(operation),
        count: times.length,
      };
    });

    return result;
  }

  static clear(): void {
    this.measurements.clear();
  }
}

export default {
  memoize,
  debounce,
  throttle,
  cachedAsyncOperation,
  generateGameCacheKey,
  generatePlayerStatsCacheKey,
  invalidateGameCaches,
  batchOperations,
  arraysEqual,
  shallowEqual,
  PerformanceMonitor,
  gameCalculationCache,
  playerStatsCache,
};
