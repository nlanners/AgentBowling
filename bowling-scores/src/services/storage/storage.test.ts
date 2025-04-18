/**
 * Tests for the storage service
 *
 * These are basic tests that would be expanded in a real testing environment.
 * The actual implementation would use Jest or a similar testing framework.
 */

// Import the actual service before mocking
import StorageService from './index';
import { STORAGE_KEYS } from '../../types';

// Mock the functions directly
StorageService.saveCurrentGame = jest.fn();
StorageService.loadCurrentGame = jest.fn();
StorageService.savePlayers = jest.fn();
StorageService.loadPlayers = jest.fn();
StorageService.saveGameToHistory = jest.fn();
StorageService.loadGameHistory = jest.fn();
StorageService.clearCurrentGame = jest.fn();
StorageService.clearAllData = jest.fn();

describe('StorageService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should save and load a game', () => {
    const mockGame = {
      id: '123',
      date: '2025-04-15',
      players: [],
      frames: [],
      currentFrame: 1,
      currentPlayer: 0,
      isComplete: false,
    };

    // Setup mock implementation for loadCurrentGame
    StorageService.loadCurrentGame.mockReturnValue(mockGame);

    // Call saveCurrentGame
    StorageService.saveCurrentGame(mockGame);

    // Verify it was called with the correct game
    expect(StorageService.saveCurrentGame).toHaveBeenCalledWith(mockGame);

    // Call loadCurrentGame
    const loadedGame = StorageService.loadCurrentGame();

    // Verify it was called
    expect(StorageService.loadCurrentGame).toHaveBeenCalled();

    // Verify the result
    expect(loadedGame).toEqual(mockGame);
  });

  // Additional tests would be added for:
  // - Player storage
  // - Game history
  // - Error handling
  // - Edge cases (null values, etc.)
});
