/**
 * Integration test setup file
 * Extends React Native Testing Library with additional accessibility testing utilities
 */

import '@testing-library/jest-native/extend-expect';

// Mock React Native modules that don't work well in test environment
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock MMKV for testing
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    getBoolean: jest.fn(),
    getNumber: jest.fn(),
    contains: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
    getAllKeys: jest.fn(() => []),
  })),
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
  NavigationContainer: ({ children }) => children,
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock React Native Chart Kit
jest.mock('react-native-chart-kit', () => ({
  LineChart: jest.fn(() => null),
  BarChart: jest.fn(() => null),
  PieChart: jest.fn(() => null),
}));

// Mock Expo modules
jest.mock('expo-font');
jest.mock('expo-asset');

// Extended matchers for accessibility testing
expect.extend({
  toBeAccessible(received) {
    // Basic accessibility check
    const hasAccessibilityLabel =
      received.props.accessibilityLabel !== undefined;
    const hasAccessibilityRole = received.props.accessibilityRole !== undefined;

    if (hasAccessibilityLabel || hasAccessibilityRole) {
      return {
        message: () => `expected element to be accessible`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected element to be accessible but it lacks accessibility props`,
        pass: false,
      };
    }
  },

  toHaveAccessibilityState(received, expectedState) {
    const actualState = received.props.accessibilityState || {};
    const matches = Object.keys(expectedState).every(
      (key) => actualState[key] === expectedState[key]
    );

    if (matches) {
      return {
        message: () =>
          `expected element not to have accessibility state ${JSON.stringify(
            expectedState
          )}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected element to have accessibility state ${JSON.stringify(
            expectedState
          )} but got ${JSON.stringify(actualState)}`,
        pass: false,
      };
    }
  },
});

// Global test helpers
global.TestHelpers = {
  // Helper to create mock accessibility announcement
  mockA11yAnnouncement: (message) => ({
    announcement: message,
    options: { queue: false },
  }),

  // Helper to simulate screen reader focus
  simulateScreenReaderFocus: (element) => {
    if (element && element.props.onFocus) {
      element.props.onFocus();
    }
  },

  // Helper to check minimum touch target size
  checkTouchTargetSize: (element) => {
    const style = element.props.style || {};
    const minSize = 44;
    return style.minWidth >= minSize && style.minHeight >= minSize;
  },
};

// Silence console warnings in tests unless needed
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    // Ignore ReactDOM warnings in React Native tests
    return;
  }
  originalConsoleWarn.apply(console, args);
};
