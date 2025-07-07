/**
 * MMKV Storage Service
 * Provides a centralized interface for data persistence using MMKV
 */

import { MMKV } from 'react-native-mmkv';
import { errorHandler, ErrorType, ErrorSeverity } from '../errorHandling';

// Initialize the storage with a specific ID for the application
export const storage = new MMKV({
  id: 'bowling-app-storage',
  // Encryption could be added here in the future if needed
});

// Storage keys as specified in the persistence spec
export const STORAGE_KEYS = {
  ACTIVE_GAME: 'BowlingApp.ActiveGame',
  PLAYERS: 'BowlingApp.Players',
  GAME_HISTORY: 'BowlingApp.GameHistory',
  GAME_HISTORY_INDEX: 'BowlingApp.GameHistory.Index',
  SETTINGS: 'BowlingApp.Settings',
};

/**
 * Get a value from storage by key
 * @param key Storage key
 * @returns The stored value or null if not found
 */
export function getValue<T>(key: string): T | null {
  try {
    const value = storage.getString(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch (parseError) {
      errorHandler.handleStorageError(
        parseError as Error,
        'getValue - JSON parse',
        { key, valueLength: value.length }
      );
      return null;
    }
  } catch (error) {
    errorHandler.handleStorageError(error as Error, 'getValue', { key });
    return null;
  }
}

/**
 * Set a value in storage
 * @param key Storage key
 * @param value Value to store
 * @returns True if successful
 */
export function setValue<T>(key: string, value: T): boolean {
  try {
    const serializedValue = JSON.stringify(value);
    storage.set(key, serializedValue);
    return true;
  } catch (error) {
    errorHandler.handleStorageError(error as Error, 'setValue', {
      key,
      valueType: typeof value,
    });
    return false;
  }
}

/**
 * Remove a value from storage
 * @param key Storage key
 * @returns True if successful
 */
export function removeValue(key: string): boolean {
  try {
    storage.delete(key);
    return true;
  } catch (error) {
    errorHandler.handleStorageError(error as Error, 'removeValue', { key });
    return false;
  }
}

/**
 * Check if a key exists in storage
 * @param key Storage key
 * @returns True if the key exists
 */
export function hasKey(key: string): boolean {
  try {
    return storage.contains(key);
  } catch (error) {
    errorHandler.handleStorageError(error as Error, 'hasKey', { key });
    return false;
  }
}

/**
 * Clear all stored data
 * Warning: This will delete all data
 */
export function clearAllData(): void {
  try {
    storage.clearAll();
  } catch (error) {
    errorHandler.handleStorageError(error as Error, 'clearAllData', {});
  }
}

/**
 * Get storage size information
 * @returns Object with storage statistics
 */
export function getStorageInfo(): { size: number; keys: string[] } | null {
  try {
    const keys = storage.getAllKeys();
    let totalSize = 0;

    keys.forEach((key) => {
      const value = storage.getString(key);
      if (value) {
        totalSize += value.length;
      }
    });

    return {
      size: totalSize,
      keys: keys,
    };
  } catch (error) {
    errorHandler.handleStorageError(error as Error, 'getStorageInfo', {});
    return null;
  }
}
