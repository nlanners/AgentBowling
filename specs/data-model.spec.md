# Data Model Specification

## Overview

This document outlines the data structures and models needed for the bowling score application. These models form the foundation of the application's state management and persistence mechanisms.

## Core Models

### Player

The Player model represents an individual player in the bowling game.

**Properties:**

- `id`: Unique identifier for the player
- `name`: Player's name
- `isActive`: Boolean indicating if the player is currently active

### Roll

A Roll represents a single throw of the bowling ball.

**Properties:**

- `pinsKnocked`: Number of pins knocked down (0-10)

### Frame

A Frame represents a single frame in a bowling game. Standard bowling has 10 frames per game.

**Properties:**

- `rolls`: Array of Roll objects (maximum 2 rolls per frame, except for 10th frame which can have up to 3)
- `isSpare`: Boolean indicating if the frame is a spare
- `isStrike`: Boolean indicating if the frame is a strike
- `score`: Calculated score for this frame (including spares/strikes bonuses)
- `cumulativeScore`: Running total score up to this frame

### Game

The Game model represents a complete bowling game with all its frames and players.

**Properties:**

- `id`: Unique identifier for the game
- `date`: Date/time when the game was played
- `players`: Array of Player objects participating in the game
- `frames`: 2D array of Frame objects for each player (10 frames per player)
- `currentFrame`: Index of the current frame being played
- `currentPlayer`: Index of the current player whose turn it is
- `isComplete`: Boolean indicating if the game is complete
- `scores`: Final scores of each player (available when the game is complete)

### GameHistory

The GameHistory model represents the collection of past games for recording and statistics purposes.

**Properties:**

- `games`: Array of completed Game objects

## Data Relationships

- A GameHistory contains many Games
- A Game contains many Players
- A Game contains many Frames organized by Player
- A Frame contains Rolls

## Data Persistence

All data will be stored locally on the device using one of the following methods:

- AsyncStorage (React Native's local storage API)
- SQLite (for more complex querying needs)
- Realm or other mobile database

The persistence layer will store:

- Player profiles (name, history)
- Complete game records
- Game statistics for reporting

## Type Definitions

The implementation will use TypeScript interfaces or types to define these models, ensuring type safety throughout the application.

## Data Validation

The data model will enforce these validation rules:

- A roll cannot knock down more than 10 pins
- Two rolls in a single frame cannot exceed 10 pins (except after a strike/spare in 10th frame)
- A game cannot have more than 10 frames
- A frame cannot have more than 2 rolls (except 10th frame, which can have 3)

## Statistics Model

The application will calculate the following statistics based on the game history:

- Average score per game
- Number of strikes and spares
- High score
- Average score per frame
