/**
 * Custom hook for accessing the storage service
 */
import { useCallback } from 'react';
import StorageService from '../services/storage';
import { Game, Player, GameHistory } from '../types';

/**
 * Hook that provides access to storage operations
 * @returns Object containing storage methods
 */
export function useStorage() {
  /**
   * Save the current game
   */
  const saveGame = useCallback((game: Game) => {
    StorageService.saveCurrentGame(game);
  }, []);

  /**
   * Load the current game
   */
  const loadGame = useCallback(() => {
    return StorageService.loadCurrentGame();
  }, []);

  /**
   * Save players list
   */
  const savePlayers = useCallback((players: Player[]) => {
    StorageService.savePlayers(players);
  }, []);

  /**
   * Load players list
   */
  const loadPlayers = useCallback(() => {
    return StorageService.loadPlayers();
  }, []);

  /**
   * Save a game to history
   */
  const saveToHistory = useCallback((game: Game) => {
    StorageService.saveGameToHistory(game);
  }, []);

  /**
   * Load game history
   */
  const loadHistory = useCallback(() => {
    return StorageService.loadGameHistory();
  }, []);

  /**
   * Clear current game
   */
  const clearGame = useCallback(() => {
    StorageService.clearCurrentGame();
  }, []);

  /**
   * Clear all data
   */
  const clearAllData = useCallback(() => {
    StorageService.clearAllData();
  }, []);

  return {
    saveGame,
    loadGame,
    savePlayers,
    loadPlayers,
    saveToHistory,
    loadHistory,
    clearGame,
    clearAllData,
  };
}
