/**
 * Storage service for persisting app data
 * Uses MMKV as the underlying storage mechanism
 */
import { MMKV } from 'react-native-mmkv';
import { STORAGE_KEYS } from '../../types';
import { Player, Game, GameHistory } from '../../types';

// Create storage instance with app namespace
let storage: MMKV | null = null;

try {
  storage = new MMKV({
    id: 'bowling-app-storage',
  });
} catch (error) {
  console.error('Failed to initialize MMKV storage:', error);
  // Provide a fallback if MMKV fails to initialize
  storage = null;
}

/**
 * StorageService handles all data persistence operations
 */
class StorageService {
  /**
   * Save the current game state
   * @param game - The current game object to persist
   */
  saveCurrentGame(game: Game): void {
    if (!storage) return;

    try {
      storage.set(STORAGE_KEYS.CURRENT_GAME, JSON.stringify(game));
    } catch (error) {
      console.error('Error saving current game:', error);
    }
  }

  /**
   * Load the current game state
   * @returns The current game object or null if none exists
   */
  loadCurrentGame(): Game | null {
    if (!storage) return null;

    try {
      const gameJson = storage.getString(STORAGE_KEYS.CURRENT_GAME);
      return gameJson ? JSON.parse(gameJson) : null;
    } catch (error) {
      console.error('Error loading current game:', error);
      return null;
    }
  }

  /**
   * Save the list of players
   * @param players - List of player objects to persist
   */
  savePlayers(players: Player[]): void {
    if (!storage) return;

    try {
      storage.set(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
    } catch (error) {
      console.error('Error saving players:', error);
    }
  }

  /**
   * Load the list of players
   * @returns List of players or empty array if none exist
   */
  loadPlayers(): Player[] {
    if (!storage) return [];

    try {
      const playersJson = storage.getString(STORAGE_KEYS.PLAYERS);
      return playersJson ? JSON.parse(playersJson) : [];
    } catch (error) {
      console.error('Error loading players:', error);
      return [];
    }
  }

  /**
   * Save a completed game to history
   * @param game - The completed game to add to history
   */
  saveGameToHistory(game: Game): void {
    if (!storage) return;

    try {
      const history = this.loadGameHistory();
      history.games.push(game);
      storage.set(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving game to history:', error);
    }
  }

  /**
   * Load the game history
   * @returns GameHistory object or default empty history
   */
  loadGameHistory(): GameHistory {
    if (!storage) return { games: [] };

    try {
      const historyJson = storage.getString(STORAGE_KEYS.GAME_HISTORY);
      return historyJson ? JSON.parse(historyJson) : { games: [] };
    } catch (error) {
      console.error('Error loading game history:', error);
      return { games: [] };
    }
  }

  /**
   * Clear the current game state
   */
  clearCurrentGame(): void {
    if (!storage) return;

    try {
      storage.delete(STORAGE_KEYS.CURRENT_GAME);
    } catch (error) {
      console.error('Error clearing current game:', error);
    }
  }

  /**
   * Clear all app data - use with caution
   */
  clearAllData(): void {
    if (!storage) return;

    try {
      storage.clearAll();
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }
}

// Export a singleton instance
export default new StorageService();
