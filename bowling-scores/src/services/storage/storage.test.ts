/**
 * Tests for the storage service
 *
 * These are basic tests that would be expanded in a real testing environment.
 * The actual implementation would use Jest or a similar testing framework.
 */

// Mock implementation of MMKV - this would be properly set up in a real test
jest.mock('react-native-mmkv', () => {
  const mockStorage = {
    set: jest.fn(),
    getString: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
  };

  return {
    MMKV: jest.fn(() => mockStorage),
  };
});

import StorageService from './index';
import { STORAGE_KEYS } from '../../types';

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

    // First save the game
    StorageService.saveCurrentGame(mockGame);

    // Then check it was saved correctly
    expect(storage.set).toHaveBeenCalledWith(
      STORAGE_KEYS.CURRENT_GAME,
      JSON.stringify(mockGame)
    );

    // Mock the return of getString to simulate loading
    storage.getString.mockReturnValueOnce(JSON.stringify(mockGame));

    // Now load the game
    const loadedGame = StorageService.loadCurrentGame();

    // Verify the correct key was used
    expect(storage.getString).toHaveBeenCalledWith(STORAGE_KEYS.CURRENT_GAME);

    // Check the loaded game matches what we saved
    expect(loadedGame).toEqual(mockGame);
  });

  // Additional tests would be added for:
  // - Player storage
  // - Game history
  // - Error handling
  // - Edge cases (null values, etc.)
});
