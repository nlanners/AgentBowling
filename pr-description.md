# Bowling Score App - Initial Setup and Design System

## Overview

This pull request establishes the foundation for a bowling score tracking application built with React Native and Expo. The work includes both the initial project setup with comprehensive specifications and the implementation of a complete design system.

## Changes

### Initial Project Setup

- Created project scaffolding with TypeScript, React Native, and Expo
- Established development workflow with custom rules in `.cursor/rules`
- Defined comprehensive app specifications:
  - User stories and requirements
  - Data model design
  - UI/UX guidelines
  - State management strategy
  - Component architecture
  - Feature implementation details
  - Data persistence approach using MMKV Storage
  - Technical implementation plan with phased approach

### Design System Implementation

- Created a comprehensive theme system with:
  - Typography: Font families, sizes, weights, and text styles
  - Colors: Primary, secondary, accent colors with light/dark mode support
  - Spacing: Consistent spacing scale for margins, padding, and layout
  - Border Radius: Standardized corner radius values for UI elements
  - Shadows: Consistent elevation and shadow styles for components
- Implemented ThemeContext for app-wide theme management

## Technical Notes

- Project is configured for TypeScript with strict type checking
- Initial component structure set up with Scoreboard, GameScreen components
- Core data model (BowlingGame) established for game logic

## Next Steps

- Implement the core game logic
- Create frame-by-frame scoring UI
- Build player management functionality
- Add game persistence using MMKV Storage
