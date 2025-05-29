// Add any global test setup here

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
