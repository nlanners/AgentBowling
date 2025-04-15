# State Management Specification

## Overview

This document outlines the state management strategy for the bowling score application. It defines how application state will be organized, updated, and persisted, ensuring a predictable and maintainable architecture.

## State Management Approach

The application will use a combination of React's Context API and hooks for state management. This provides a lightweight yet powerful solution appropriate for the application's complexity level without introducing external dependencies.

## Core State Structure

The application state will be divided into several domains:

### Game State

Contains all information about the active bowling game:

- Current players
- Frame data for each player
- Current player turn
- Current frame
- Current roll
- Game status (in progress, completed)

### Player State

Manages the list of players, including:

- Player profiles (names, IDs)
- Active/inactive status

### History State

Manages the saved games history:

- Completed games
- Statistics derived from game history

### UI State

Manages UI-specific state:

- Current screen/view
- Modal dialogs
- Form inputs
- Error messages

## State Providers

The application will implement the following context providers:

### GameProvider

```
GameContext
  - game: Game
  - currentPlayerIndex: number
  - currentFrameIndex: number
  - currentRollIndex: number
  - isGameComplete: boolean
  - actions:
    - startGame(players: Player[])
    - recordRoll(pins: number)
    - undoLastRoll()
    - resetGame()
    - completeGame()
```

### PlayerProvider

```
PlayerContext
  - players: Player[]
  - actions:
    - addPlayer(name: string)
    - removePlayer(id: string)
    - updatePlayer(id: string, data: Partial<Player>)
    - reorderPlayers(orderedIds: string[])
```

### HistoryProvider

```
HistoryContext
  - gameHistory: Game[]
  - statistics: Statistics
  - actions:
    - saveGame(game: Game)
    - deleteGame(id: string)
    - clearHistory()
```

### UIProvider

```
UIContext
  - currentScreen: Screen
  - isModalOpen: boolean
  - modalContent: React.ReactNode
  - actions:
    - navigateTo(screen: Screen)
    - openModal(content: React.ReactNode)
    - closeModal()
```

## State Updates

State updates will follow these principles:

1. **Immutability** - State objects will never be mutated directly
2. **Single Source of Truth** - Each piece of state has one definitive source
3. **Unidirectional Data Flow** - Data flows down from parent to child components
4. **Action-Based Updates** - State changes occur through defined action functions

## Local Storage Integration

The state management system will integrate with the device's local storage:

1. **Game State** - Saved when game is completed or paused
2. **Player Profiles** - Persisted across app sessions
3. **Game History** - Stored permanently until explicitly deleted

The application will use AsyncStorage for persisting state:

```
Storage Keys:
  - @BowlingApp:CurrentGame
  - @BowlingApp:Players
  - @BowlingApp:GameHistory
```

## Optimizations

1. **Memoization** - Use React.memo and useMemo to prevent unnecessary re-renders
2. **Context Splitting** - Separate contexts to avoid unnecessary re-renders
3. **Reducer Pattern** - Use useReducer for complex state logic
4. **Batch Updates** - Group related state changes where possible

## TypeScript Integration

All state objects and actions will be strongly typed using TypeScript:

1. **Interfaces** for state objects
2. **Type unions** for actions
3. **Generic types** for reusable patterns
4. **Discriminated unions** for handling different state shapes

## Error Handling

The state management system will include error handling:

1. **Action validation** - Validate inputs before state changes
2. **Error state** - Track and expose errors in context
3. **Recovery mechanisms** - Provide ways to recover from invalid states

## Testing Strategy

The state management will be designed for testability:

1. **Pure reducer functions** - Easy to test with different inputs
2. **Mock providers** - Allow components to be tested in isolation
3. **State snapshots** - Verify correct state transitions
