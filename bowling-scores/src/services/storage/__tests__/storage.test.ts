import StorageService from '../index';
import { STORAGE_KEYS } from '../../../types';
import { Game, Player, GameHistory } from '../../../types';
import { MMKV } from 'react-native-mmkv';

// Access the mock functions directly through the mocked module
const mockMMKV = MMKV as jest.Mock;
const mockInstance = mockMMKV();

describe('Storage Service Tests', () => {
  beforeEach(() => {
    // Clear any previous mock state
    mockInstance.clearAll();

    // Reset mock function call history
    jest.clearAllMocks();
  });

  describe('saveCurrentGame', () => {
    it('should save the current game to storage', () => {
      const game: Game = {
        id: '1',
        date: '2025-05-29',
        players: [{ id: '1', name: 'Player 1' }],
        frames: [],
        currentPlayer: 0,
        currentFrame: 0,
        isComplete: false,
      };

      StorageService.saveCurrentGame(game);

      // Verify the set method was called
      expect(mockInstance.set).toHaveBeenCalledWith(
        STORAGE_KEYS.CURRENT_GAME,
        JSON.stringify(game)
      );
    });

    it('should handle errors when saving', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const game: Game = {
        id: '1',
        date: '2025-05-29',
        players: [{ id: '1', name: 'Player 1' }],
        frames: [],
        currentPlayer: 0,
        currentFrame: 0,
        isComplete: false,
      };

      // Force an error
      mockInstance.set.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      StorageService.saveCurrentGame(game);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('loadCurrentGame', () => {
    it('should load the current game from storage', () => {
      const game: Game = {
        id: '1',
        date: '2025-05-29',
        players: [{ id: '1', name: 'Player 1' }],
        frames: [],
        currentPlayer: 0,
        currentFrame: 0,
        isComplete: false,
      };

      // Store a game first
      mockInstance.set(STORAGE_KEYS.CURRENT_GAME, JSON.stringify(game));

      // Reset mock call history
      mockInstance.getString.mockClear();

      const result = StorageService.loadCurrentGame();

      expect(mockInstance.getString).toHaveBeenCalledWith(
        STORAGE_KEYS.CURRENT_GAME
      );
      expect(result).toEqual(game);
    });

    it('should return null when no game is found', () => {
      // Make sure no game exists
      mockInstance.delete(STORAGE_KEYS.CURRENT_GAME);
      mockInstance.getString.mockReturnValueOnce(null);

      const result = StorageService.loadCurrentGame();

      expect(result).toBeNull();
    });

    it('should handle errors when loading', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockInstance.getString.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const result = StorageService.loadCurrentGame();

      expect(consoleSpy).toHaveBeenCalled();
      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe('savePlayers', () => {
    it('should save players to storage', () => {
      const players: Player[] = [
        { id: '1', name: 'Player 1' },
        { id: '2', name: 'Player 2' },
      ];

      StorageService.savePlayers(players);

      expect(mockInstance.set).toHaveBeenCalledWith(
        STORAGE_KEYS.PLAYERS,
        JSON.stringify(players)
      );
    });
  });

  describe('loadPlayers', () => {
    it('should load players from storage', () => {
      const players: Player[] = [
        { id: '1', name: 'Player 1' },
        { id: '2', name: 'Player 2' },
      ];

      mockInstance.set(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
      mockInstance.getString.mockClear();

      const result = StorageService.loadPlayers();

      expect(mockInstance.getString).toHaveBeenCalledWith(STORAGE_KEYS.PLAYERS);
      expect(result).toEqual(players);
    });

    it('should return empty array when no players are found', () => {
      mockInstance.delete(STORAGE_KEYS.PLAYERS);
      mockInstance.getString.mockReturnValueOnce(null);

      const result = StorageService.loadPlayers();

      expect(result).toEqual([]);
    });
  });

  describe('saveGameToHistory', () => {
    it('should add a game to history', () => {
      const game: Game = {
        id: '1',
        date: '2025-05-29',
        players: [{ id: '1', name: 'Player 1' }],
        frames: [],
        currentPlayer: 0,
        currentFrame: 0,
        isComplete: true,
        scores: [300],
      };

      const existingHistory: GameHistory = {
        games: [
          {
            id: '0',
            date: '2025-05-28',
            players: [{ id: '1', name: 'Player 1' }],
            frames: [],
            currentPlayer: 0,
            currentFrame: 9,
            isComplete: true,
            scores: [250],
          },
        ],
      };

      mockInstance.getString.mockReturnValueOnce(
        JSON.stringify(existingHistory)
      );

      StorageService.saveGameToHistory(game);

      expect(mockInstance.getString).toHaveBeenCalledWith(
        STORAGE_KEYS.GAME_HISTORY
      );
      expect(mockInstance.set).toHaveBeenCalledWith(
        STORAGE_KEYS.GAME_HISTORY,
        JSON.stringify({
          games: [...existingHistory.games, game],
        })
      );
    });

    it('should create a new history if none exists', () => {
      const game: Game = {
        id: '1',
        date: '2025-05-29',
        players: [{ id: '1', name: 'Player 1' }],
        frames: [],
        currentPlayer: 0,
        currentFrame: 0,
        isComplete: true,
        scores: [300],
      };

      mockInstance.getString.mockReturnValueOnce(null);

      StorageService.saveGameToHistory(game);

      expect(mockInstance.getString).toHaveBeenCalledWith(
        STORAGE_KEYS.GAME_HISTORY
      );
      expect(mockInstance.set).toHaveBeenCalledWith(
        STORAGE_KEYS.GAME_HISTORY,
        JSON.stringify({
          games: [game],
        })
      );
    });
  });

  describe('loadGameHistory', () => {
    it('should load game history from storage', () => {
      const history: GameHistory = {
        games: [
          {
            id: '1',
            date: '2025-05-29',
            players: [{ id: '1', name: 'Player 1' }],
            frames: [],
            currentPlayer: 0,
            currentFrame: 9,
            isComplete: true,
            scores: [300],
          },
        ],
      };

      mockInstance.getString.mockReturnValueOnce(JSON.stringify(history));

      const result = StorageService.loadGameHistory();

      expect(mockInstance.getString).toHaveBeenCalledWith(
        STORAGE_KEYS.GAME_HISTORY
      );
      expect(result).toEqual(history);
    });

    it('should return empty history when none exists', () => {
      mockInstance.getString.mockReturnValueOnce(null);

      const result = StorageService.loadGameHistory();

      expect(result).toEqual({ games: [] });
    });
  });

  describe('clearCurrentGame', () => {
    it('should delete the current game from storage', () => {
      StorageService.clearCurrentGame();

      expect(mockInstance.delete).toHaveBeenCalledWith(
        STORAGE_KEYS.CURRENT_GAME
      );
    });

    it('should handle errors when clearing', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockInstance.delete.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      StorageService.clearCurrentGame();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('clearAllData', () => {
    it('should clear all data from storage', () => {
      StorageService.clearAllData();

      expect(mockInstance.clearAll).toHaveBeenCalled();
    });

    it('should handle errors when clearing all data', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockInstance.clearAll.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      StorageService.clearAllData();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
