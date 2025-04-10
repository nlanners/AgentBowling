# Persistence Specification

## Overview

This document outlines the data persistence strategy for the bowling score application. It defines how data will be stored, retrieved, and managed locally on the device to support offline functionality and data integrity.

## Local Storage Requirements

The application requires local storage for the following data:

1. **Active Game State** - Current game in progress
2. **Player Profiles** - List of known players and their details
3. **Game History** - Completed games and their details
4. **Application Settings** - User preferences and configuration

## Storage Technology

The application will utilize MMKV Storage (@react-native-mmkv/storage) as the primary persistence mechanism. MMKV is a key-value storage framework developed by WeChat that offers better performance and reliability compared to older solutions.

### Rationale for Using MMKV:

1. **Performance** - Up to 30x faster than AsyncStorage with efficient C++ implementation
2. **Reliability** - Data is persisted using memory mapping for better crash resistance
3. **Type Safety** - Supports TypeScript and various data types natively
4. **Cross-Platform** - Works consistently on both iOS and Android
5. **Active Maintenance** - Well-maintained library with regular updates
6. **Encryption** - Supports data encryption if needed in the future
7. **Offline Support** - Fully functional without network connectivity

## Alternative Options Considered

1. **@react-native-async-storage/async-storage** - The community-maintained version of the old AsyncStorage, but performance limitations make it less ideal
2. **WatermelonDB** - A more complex database solution, appropriate for large-scale data but potentially over-engineered for our needs
3. **Realm** - A full database solution that provides more capabilities than needed for this app
4. **SQLite (via expo-sqlite)** - Good option but requires more setup for simple key-value operations

## Data Structure

The application will store data in the following structure:

### Active Game

The active game object will contain:

- A unique identifier for the game
- Date and time when the game started
- Array of players participating in the game
- Frames data for each player, including:
  - Frame number
  - Rolls within each frame (pins knocked down)
  - Flags for strikes and spares
  - Individual frame scores
  - Running total scores
- Current player, frame, and roll indices to track game progress

### Player Profiles

The player profiles will store:

- Unique identifier for each player
- Player name
- Date created and last played
- Statistics including games played
- High score and average score

### Game History

The game history will maintain:

- Array of completed games
- Each game entry includes:
  - Game identifier and date
  - Players who participated
  - Complete frame-by-frame scoring data
  - Final scores for each player

### Application Settings

The settings will include:

- UI theme preference
- Sound settings
- Haptic feedback settings
- Auto-save configuration

## Storage Keys

The application will use the following keys for storing data:

1. **BowlingApp.ActiveGame** - Current game state
2. **BowlingApp.Players** - Player profiles
3. **BowlingApp.GameHistory** - Game history
4. **BowlingApp.Settings** - Application settings

## Persistence Service Implementation

A dedicated persistence service will be implemented to abstract the storage implementation details. This service will provide methods for:

### Game Operations

- Saving the active game state
- Retrieving the active game state
- Clearing the active game

### Player Operations

- Saving player profiles
- Retrieving player profiles

### History Operations

- Saving completed games to history
- Retrieving game history
- Deleting specific games from history
- Clearing all game history

### Settings Operations

- Saving application settings
- Retrieving application settings

### Utility Operations

- Clearing all application data

All methods will be synchronous, taking advantage of MMKV's efficient performance characteristics.

## MMKV Setup

The MMKV storage will be initialized with a specific ID for the application and an optional encryption key for data security. The storage instance will be configured at application startup and made available throughout the application via the persistence service.

The persistence service will handle serialization and deserialization of data to and from the storage system, converting between application objects and storable formats.

## Data Migration Strategy

If the data structure needs to change in future versions, the app will include a migration strategy:

1. **Version Tracking** - Each data structure will include a version field
2. **Migration Functions** - Version-specific migration functions
3. **Automatic Migration** - Run migrations when needed during app startup

## Storage Optimization

Benefits of MMKV:

1. **Efficient Binary Storage** - MMKV uses efficient binary format rather than string-based storage
2. **Partial Updates** - Supports partial updates to avoid rewriting entire objects
3. **Fast Loading** - Memory mapping provides faster initial load times compared to other solutions

Additional optimizations:

1. **Lazy Loading** - Load history data only when needed
2. **Pagination** - Implement pagination for large history lists
3. **Cleanup Options** - Provide user options to clear old history data

## Offline First Approach

The application is designed to work completely offline:

1. **No Network Dependency** - All features work without internet
2. **Local-Only Storage** - All data stays on device
3. **Immediate Availability** - No loading delays due to network

## Error Handling

The persistence layer will handle errors in the following ways:

1. **Read Failures** - Return defaults or empty structures with appropriate user notification
2. **Write Failures** - Implement retry mechanisms and fallbacks
3. **Corruption Detection** - Validate data structure on load
4. **Recovery Options** - Provide mechanisms to reset corrupted data

## Testing Strategy

The persistence layer will be tested with:

1. **Unit Tests** - Test service methods in isolation
2. **Mock Storage** - Test with mock MMKV instance
3. **Integration Tests** - Test persistence with state management
4. **Edge Cases** - Test behavior with corrupted or missing data
5. **Performance Tests** - Verify performance with large datasets

## Integration with App Lifecycle

The persistence service will integrate with the app lifecycle to:

1. **Auto-save** on app background
2. **Load state** on app foreground
3. **Handle interruptions** gracefully
4. **Implement periodic saving** during active use
