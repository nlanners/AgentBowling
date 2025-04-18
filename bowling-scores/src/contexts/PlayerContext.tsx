/**
 * Player context for the bowling score app
 * Provides player management throughout the application
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
} from 'react';
import { Player } from '../types';
import { MMKV } from 'react-native-mmkv';

// Storage key for players
const PLAYERS_STORAGE_KEY = 'BowlingApp.Players';

// Storage instance for persisting players
const storage = new MMKV({
  id: 'bowling-app-storage',
});

// Player action types
export enum PlayerActionType {
  ADD_PLAYER = 'ADD_PLAYER',
  UPDATE_PLAYER = 'UPDATE_PLAYER',
  REMOVE_PLAYER = 'REMOVE_PLAYER',
  SET_PLAYERS = 'SET_PLAYERS',
  SET_ACTIVE_PLAYER = 'SET_ACTIVE_PLAYER',
}

// Player actions interface
type PlayerAction =
  | { type: PlayerActionType.ADD_PLAYER; payload: { name: string } }
  | {
      type: PlayerActionType.UPDATE_PLAYER;
      payload: { id: string; name: string };
    }
  | { type: PlayerActionType.REMOVE_PLAYER; payload: { id: string } }
  | { type: PlayerActionType.SET_PLAYERS; payload: { players: Player[] } }
  | { type: PlayerActionType.SET_ACTIVE_PLAYER; payload: { id: string } };

// Player context state interface
interface PlayerContextState {
  players: Player[];
  recentPlayers: Player[];
  activePlayerId: string | null;
  isLoading: boolean;
  error: string | null;
}

// Player context interface
interface PlayerContextType extends PlayerContextState {
  addPlayer: (name: string) => void;
  updatePlayer: (id: string, name: string) => void;
  removePlayer: (id: string) => void;
  setPlayers: (players: Player[]) => void;
  setActivePlayer: (id: string) => void;
  getPlayerById: (id: string) => Player | undefined;
  getActivePlayers: () => Player[];
}

// Load players from storage
function loadPlayersFromStorage(): Player[] {
  const storedPlayers = storage.getString(PLAYERS_STORAGE_KEY);
  if (storedPlayers) {
    try {
      return JSON.parse(storedPlayers);
    } catch (e) {
      console.error('Failed to parse stored players', e);
    }
  }
  return [];
}

// Save players to storage
function savePlayersToStorage(players: Player[]): void {
  try {
    storage.set(PLAYERS_STORAGE_KEY, JSON.stringify(players));
  } catch (e) {
    console.error('Failed to save players to storage', e);
  }
}

// Initial state
const initialState: PlayerContextState = {
  players: loadPlayersFromStorage(),
  recentPlayers: loadPlayersFromStorage().slice(0, 5), // Keep last 5 players as recent
  activePlayerId: null,
  isLoading: false,
  error: null,
};

// Create context with default undefined value
const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Generate a unique ID for a player
function generatePlayerId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Player reducer
function playerReducer(
  state: PlayerContextState,
  action: PlayerAction
): PlayerContextState {
  switch (action.type) {
    case PlayerActionType.ADD_PLAYER: {
      const { name } = action.payload;

      if (!name.trim()) {
        return {
          ...state,
          error: 'Player name cannot be empty',
        };
      }

      // Create new player with unique ID
      const newPlayer: Player = {
        id: generatePlayerId(),
        name: name.trim(),
        isActive: true,
      };

      // Add to players list
      const updatedPlayers = [...state.players, newPlayer];

      // Save to storage
      savePlayersToStorage(updatedPlayers);

      // Update recent players
      const updatedRecentPlayers = [
        newPlayer,
        ...state.recentPlayers.filter((p) => p.id !== newPlayer.id),
      ].slice(0, 5);

      return {
        ...state,
        players: updatedPlayers,
        recentPlayers: updatedRecentPlayers,
        error: null,
      };
    }

    case PlayerActionType.UPDATE_PLAYER: {
      const { id, name } = action.payload;

      if (!name.trim()) {
        return {
          ...state,
          error: 'Player name cannot be empty',
        };
      }

      // Find and update player
      const updatedPlayers = state.players.map((player) =>
        player.id === id ? { ...player, name: name.trim() } : player
      );

      // Save to storage
      savePlayersToStorage(updatedPlayers);

      // Update recent players
      const updatedRecentPlayers = state.recentPlayers.map((player) =>
        player.id === id ? { ...player, name: name.trim() } : player
      );

      return {
        ...state,
        players: updatedPlayers,
        recentPlayers: updatedRecentPlayers,
        error: null,
      };
    }

    case PlayerActionType.REMOVE_PLAYER: {
      const { id } = action.payload;

      // Remove player
      const updatedPlayers = state.players.filter((player) => player.id !== id);

      // Save to storage
      savePlayersToStorage(updatedPlayers);

      // Update recent players
      const updatedRecentPlayers = state.recentPlayers.filter(
        (player) => player.id !== id
      );

      // Reset active player if removed
      const updatedActivePlayerId =
        state.activePlayerId === id ? null : state.activePlayerId;

      return {
        ...state,
        players: updatedPlayers,
        recentPlayers: updatedRecentPlayers,
        activePlayerId: updatedActivePlayerId,
        error: null,
      };
    }

    case PlayerActionType.SET_PLAYERS: {
      const { players } = action.payload;

      // Save to storage
      savePlayersToStorage(players);

      // Update recent players (keep existing if possible)
      const updatedRecentPlayers = state.recentPlayers
        .filter((recent) => players.some((p) => p.id === recent.id))
        .concat(
          players.filter(
            (p) => !state.recentPlayers.some((recent) => recent.id === p.id)
          )
        )
        .slice(0, 5);

      return {
        ...state,
        players,
        recentPlayers: updatedRecentPlayers,
        error: null,
      };
    }

    case PlayerActionType.SET_ACTIVE_PLAYER: {
      const { id } = action.payload;

      // Verify player exists
      if (!state.players.some((player) => player.id === id)) {
        return {
          ...state,
          error: 'Player not found',
        };
      }

      // Update player active states
      const updatedPlayers = state.players.map((player) => ({
        ...player,
        isActive: player.id === id,
      }));

      return {
        ...state,
        players: updatedPlayers,
        activePlayerId: id,
        error: null,
      };
    }

    default:
      return state;
  }
}

// Player provider component
export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(playerReducer, initialState);

  // Action to add a new player
  const addPlayer = useCallback((name: string) => {
    dispatch({
      type: PlayerActionType.ADD_PLAYER,
      payload: { name },
    });
  }, []);

  // Action to update an existing player
  const updatePlayer = useCallback((id: string, name: string) => {
    dispatch({
      type: PlayerActionType.UPDATE_PLAYER,
      payload: { id, name },
    });
  }, []);

  // Action to remove a player
  const removePlayer = useCallback((id: string) => {
    dispatch({
      type: PlayerActionType.REMOVE_PLAYER,
      payload: { id },
    });
  }, []);

  // Action to set all players
  const setPlayers = useCallback((players: Player[]) => {
    dispatch({
      type: PlayerActionType.SET_PLAYERS,
      payload: { players },
    });
  }, []);

  // Action to set the active player
  const setActivePlayer = useCallback((id: string) => {
    dispatch({
      type: PlayerActionType.SET_ACTIVE_PLAYER,
      payload: { id },
    });
  }, []);

  // Utility to get a player by ID
  const getPlayerById = useCallback(
    (id: string) => {
      return state.players.find((player) => player.id === id);
    },
    [state.players]
  );

  // Utility to get all active players
  const getActivePlayers = useCallback(() => {
    return state.players.filter((player) => player.isActive);
  }, [state.players]);

  // Build context value
  const contextValue = useMemo(
    () => ({
      ...state,
      addPlayer,
      updatePlayer,
      removePlayer,
      setPlayers,
      setActivePlayer,
      getPlayerById,
      getActivePlayers,
    }),
    [
      state,
      addPlayer,
      updatePlayer,
      removePlayer,
      setPlayers,
      setActivePlayer,
      getPlayerById,
      getActivePlayers,
    ]
  );

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

// Custom hook for accessing player state and actions
export const usePlayers = (): PlayerContextType => {
  const context = useContext(PlayerContext);

  if (context === undefined) {
    throw new Error('usePlayers must be used within a PlayerProvider');
  }

  return context;
};

export default PlayerProvider;
