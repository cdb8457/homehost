import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/homehost_test';

// Mock external services
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
  })),
}));

jest.mock('ioredis', () => {
  const redisMock = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
    disconnect: jest.fn(),
  };
  return jest.fn(() => redisMock);
});

// Global test timeout
jest.setTimeout(30000);