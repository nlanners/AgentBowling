# UI/UX Specification

## Overview

This document outlines the user interface and experience design for the bowling score application. It defines the visual design, interaction patterns, and screen flow to deliver an intuitive and effective user experience.

## Design Principles

The application will follow these core design principles:

1. **Simplicity** - Keep the interface clean and focused on scoring
2. **Efficiency** - Minimize the number of taps required to record scores
3. **Clarity** - Display bowling information in an easily understandable format
4. **Responsiveness** - Ensure the app works well on various screen sizes
5. **Accessibility** - Support users with different abilities

## Color Scheme

- **Primary Color**: A bowling-themed blue (#007AFF)
- **Secondary Color**: Light gray (#F5F5F5) for backgrounds
- **Accent Colors**:
  - Green (#4CD964) for strikes
  - Orange (#FF9500) for spares
  - Red (#FF3B30) for important actions

## Typography

- **Font Family**: System default (San Francisco on iOS, Roboto on Android)
- **Headings**: 24sp, bold
- **Body Text**: 16sp, regular
- **Labels**: 14sp, medium

## Styling System

The application will use React Native's StyleSheet system with a centralized theming approach to ensure consistency and maintainability.

### Theme Structure

The theme will be organized as follows:

```typescript
/src
  /theme
    index.ts          // Main theme exports
    colors.ts         // Color definitions
    spacing.ts        // Spacing scale
    typography.ts     // Text styles
    styles.ts         // Common component styles
```

### Core Theme Variables

The theme will define these core design tokens:

1. **Colors**

   - Primary and secondary colors
   - Text colors (primary, secondary)
   - Background colors
   - Semantic colors (success, warning, error)
   - State colors (active, disabled)

2. **Spacing**

   - Consistent spacing scale (xs, sm, md, lg, xl)
   - Margins and padding values
   - Layout grid values

3. **Typography**

   - Font sizes
   - Font weights
   - Line heights
   - Letter spacing

4. **Border Radius**
   - Consistent rounding values

### Common Component Styles

The theme will provide reusable style functions for common components:

- Container layouts
- Cards
- Buttons (primary, secondary, text-only)
- Form elements
- Typography variants

### Implementation Approach

1. **Centralized theme definition**:

   ```typescript
   // src/theme/index.ts
   export const COLORS = { ... };
   export const SPACING = { ... };
   export const FONT_SIZE = { ... };
   export const BORDER_RADIUS = { ... };
   ```

2. **Component-specific styles using StyleSheet.create()**:

   ```typescript
   // Component file
   import { StyleSheet } from 'react-native';
   import { COLORS, SPACING } from '../theme';

   const styles = StyleSheet.create({
     container: {
       backgroundColor: COLORS.background.primary,
       padding: SPACING.md,
     },
   });
   ```

3. **Reusable style composition**:

   ```typescript
   // Component usage
   import { createCommonStyles } from '../theme/styles';

   const MyComponent = () => {
     const commonStyles = createCommonStyles();
     return (
       <View style={[commonStyles.container, styles.customContainer]}>
         <Text style={commonStyles.heading}>Title</Text>
       </View>
     );
   };
   ```

### Best Practices

1. Always import theme variables directly from the theme folder
2. Use StyleSheet.create() for better performance
3. Compose styles using arrays when extending common styles
4. Keep component-specific styles in component files
5. Use consistent naming conventions for style properties

## Screen Flow

The application will consist of the following primary screens:

1. **Home Screen**

   - New Game button
   - View History button
   - Settings button

2. **Player Setup Screen**

   - Add/remove/edit players
   - Start game button

3. **Game Screen**

   - Scoreboard display
   - Frame-by-frame scoring area
   - Pin input controls
   - Player switching controls

4. **Game Summary Screen**

   - Final scores
   - Game statistics
   - Save game option
   - New game option

5. **History Screen**
   - List of past games
   - Filter/sort options
   - Game detail view on selection

## Component Design

### Scoreboard Component

- Clear visual separation between frames
- Current frame highlighted
- Special indicators for strikes (X) and spares (/)
- Running score displayed below each frame
- Current player's name highlighted

### Pin Input Component

- Large, touch-friendly buttons for numbers 0-9
- Special case for 10 (strike)
- Contextually aware (disable impossible pin counts)
- Quick input controls (e.g., strike button when appropriate)

### Player Management Component

- Simple list with add/edit/remove controls
- Visual indicator for current player
- Easy reordering of players

## Interaction Design

### Scoring Workflow

1. App displays current player and frame
2. Player enters pins knocked down in roll 1
3. If strike, automatically move to next player/frame
4. If not strike, prompt for roll 2
5. After roll 2, move to next player/frame
6. Special handling for 10th frame with strikes/spares

### Error Prevention

- Disable impossible pin counts based on previous roll
- Confirmation for destructive actions (reset game, delete player)
- Ability to edit previous frames with confirmation

## Responsive Design

- Support for both portrait and landscape orientations
- Adaptive layout for different screen sizes
- Optimized for one-handed operation on phones

## Micro-interactions

- Subtle animations for frame transitions
- Haptic feedback for input confirmation
- Visual feedback for strikes and spares

## Accessibility

- Support for VoiceOver and TalkBack screen readers
- Sufficient color contrast for all text
- Touch targets at least 44x44 points
- Support for dynamic type (text size adjustment)

## Offline Usage

- All UI components will function without requiring network connectivity
- Appropriate caching and local storage for uninterrupted usage
