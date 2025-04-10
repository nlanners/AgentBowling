# Bowling Score Tracker

A React Native mobile app for tracking bowling scores, built with Expo and TypeScript.

## Features

- Track scores for a standard 10-frame bowling game
- Real-time score calculation with proper bowling rules
- Visual display of frames, rolls, and running scores
- Support for strikes, spares, and the special 10th frame rules
- Simple and intuitive UI for entering pin counts

## Getting Started

### Prerequisites

- Node.js (14.x or higher)
- npm or yarn
- Expo CLI

### Installation

1. Clone this repository
2. Navigate to the project directory
3. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

### Running the App

Start the development server:

```
npx expo start
```

This will open a new browser window with the Expo development tools. You can then:

- Run on an iOS simulator
- Run on an Android emulator
- Scan the QR code with the Expo Go app on your physical device

## How to Use

1. Start a new game
2. For each roll, tap the button corresponding to the number of pins knocked down
3. The app will automatically:
   - Calculate running scores
   - Handle strikes and spares
   - Apply the special rules for the 10th frame
4. When the game is complete, you'll see your final score

## Technical Implementation

- Built with React Native and Expo
- Written in TypeScript for type safety
- Uses React hooks for state management
- Implements standard bowling scoring rules
