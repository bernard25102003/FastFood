import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';

// Mock Prisma client for unit tests
jest.mock('../src/config/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  // Reset all mocks before each test
  const prismaMock = jest.requireMock('../src/config/prisma').default;
  mockReset(prismaMock);
});

// Silence console during tests
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
