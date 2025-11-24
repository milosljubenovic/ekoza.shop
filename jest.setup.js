// Jest setup file
require('@testing-library/jest-dom');

// Simple localStorage mock - tests can override this
if (typeof global.localStorage === 'undefined') {
  global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
}
