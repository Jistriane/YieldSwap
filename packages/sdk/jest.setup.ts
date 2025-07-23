import '@testing-library/jest-dom';

// Mock do axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
  })),
}));

// Mock do socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  })),
}));

// Mock do @stellar/stellar-sdk
jest.mock('@stellar/stellar-sdk', () => ({
  Server: jest.fn(() => ({
    loadAccount: jest.fn(),
    submitTransaction: jest.fn(),
  })),
})); 