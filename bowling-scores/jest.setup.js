// Add any global test setup here

// Mock performance for consistent testing
global.performance = global.performance || {
  now: jest.fn(() => Date.now()),
};

// Mock the MMKV module
jest.mock('react-native-mmkv', () => {
  // Create a singleton store for the mock data
  const mockStore = {};

  // Define mock functions that operate on the store
  const mockSet = jest.fn((key, value) => {
    mockStore[key] = value;
    return true;
  });

  const mockGetString = jest.fn((key) => {
    return mockStore[key] || null;
  });

  const mockDelete = jest.fn((key) => {
    delete mockStore[key];
    return true;
  });

  const mockGetAllKeys = jest.fn(() => {
    return Object.keys(mockStore);
  });

  const mockClearAll = jest.fn(() => {
    Object.keys(mockStore).forEach((key) => {
      delete mockStore[key];
    });
    return true;
  });

  // Create the mock instance that will be returned when new MMKV() is called
  const mockInstance = {
    set: mockSet,
    getString: mockGetString,
    delete: mockDelete,
    getAllKeys: mockGetAllKeys,
    clearAll: mockClearAll,
  };

  // Return the constructor function that will create the mock
  return {
    MMKV: jest.fn(() => mockInstance),
  };
});

// Mock React Native components that aren't available in test environment
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Dimensions: {
      get: jest.fn(() => ({ width: 400, height: 800 })),
    },
    // Mock TurboModules that aren't available in test environment
    DevMenu: {},
    ProgressBarAndroid: 'ProgressBarAndroid',
    Clipboard: {
      getString: jest.fn(),
      setString: jest.fn(),
    },
    // Mock other problematic modules
    NativeModules: {
      ...RN.NativeModules,
      DevMenu: {},
      ProgressBarAndroid: {},
      Clipboard: {},
    },
  };
});

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      reset: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
    NavigationContainer: ({ children }) => children,
  };
});

// Mock React Native Chart Kit
jest.mock('react-native-chart-kit', () => ({
  LineChart: 'LineChart',
  BarChart: 'BarChart',
  PieChart: 'PieChart',
}));

// Mock TurboModuleRegistry to prevent DevMenu errors
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  getEnforcing: jest.fn(() => ({})),
  get: jest.fn(() => ({})),
}));
