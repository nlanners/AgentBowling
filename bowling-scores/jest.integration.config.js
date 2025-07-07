module.exports = {
  preset: 'jest-expo',
  displayName: 'Integration Tests',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {
        presets: [
          ['babel-preset-expo', { jsxRuntime: 'automatic' }],
          '@babel/preset-typescript',
        ],
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/src/__tests__/integration/setup.integration.js',
  ],

  // Only run integration tests
  testMatch: ['<rootDir>/src/__tests__/integration/**/*.{ts,tsx}'],

  // Integration test specific settings
  testTimeout: 10000, // Longer timeout for integration tests

  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/types/**',
    '!src/index.ts',
    '!src/__tests__/**', // Exclude test files from coverage
  ],

  coverageDirectory: 'coverage/integration',
  coverageReporters: ['text', 'lcov', 'html'],

  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|react-clone-referenced-element|@react-native-community|expo|@expo|@unimodules|react-navigation|@react-navigation/.*|@unimodules/.*|sentry-expo|native-base|react-native-svg)',
  ],

  // Integration test specific globals
  globals: {
    __DEV__: true,
    __TEST_INTEGRATION__: true,
  },

  // Verbose output for integration tests
  verbose: true,

  // Fail fast on first test failure (optional)
  bail: false,

  // Clear mock calls between tests
  clearMocks: true,

  // Reset modules between tests
  resetModules: true,
};
