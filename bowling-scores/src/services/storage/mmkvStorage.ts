/**
 * MMKV Storage Service
 * Provides a centralized interface for data persistence using MMKV
 */

import { MMKV } from 'react-native-mmkv';

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
  const value = storage.getString(key);
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Error parsing stored value for key ${key}:`, error);
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
    storage.set(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error storing value for key ${key}:`, error);
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
    console.error(`Error removing value for key ${key}:`, error);
    return false;
  }
}

/**
 * Check if a key exists in storage
 * @param key Storage key
 * @returns True if the key exists
 */
export function hasKey(key: string): boolean {
  return storage.contains(key);
}

/**
 * Clear all stored data
 * Warning: This will delete all data
 */
export function clearAllData(): void {
  try {
    storage.clearAll();
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
}
