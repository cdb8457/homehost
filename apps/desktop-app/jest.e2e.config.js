module.exports = {
  displayName: 'HomeHost E2E Tests',
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/e2e/**/*.test.js',
    '<rootDir>/tests/integration/**/*.test.js'
  ],
  
  // Setup and teardown
  setupFilesAfterEnv: ['<rootDir>/tests/setup/e2e-setup.js'],
  
  // Module paths
  moduleFileExtensions: ['js', 'json'],
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/main/services/**/*.js',
    '!src/main/services/**/*.test.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage/e2e',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Timeouts for E2E tests
  testTimeout: 120000, // 2 minutes for E2E tests
  
  // Verbose output for debugging
  verbose: true,
  
  // Transform configuration
  transform: {},
  
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Performance optimization
  maxWorkers: 2, // Limit workers for E2E tests
  
  // Reporter configuration
  reporters: ['default'],
  
  // Global variables
  globals: {
    __DEV__: true,
    __TEST__: true
  }
};