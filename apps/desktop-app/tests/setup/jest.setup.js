// Jest setup for Electron testing
const { app } = require('electron');

// Mock Electron modules for testing
jest.mock('electron', () => ({
  app: {
    isReady: jest.fn().mockReturnValue(true),
    whenReady: jest.fn().mockResolvedValue(),
    quit: jest.fn().mockResolvedValue(),
    getPath: jest.fn().mockReturnValue('/tmp/test'),
    getVersion: jest.fn().mockReturnValue('1.0.0'),
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn()
  },
  BrowserWindow: jest.fn().mockImplementation(() => ({
    loadFile: jest.fn(),
    loadURL: jest.fn(),
    webContents: {
      send: jest.fn(),
      on: jest.fn(),
      off: jest.fn()
    },
    on: jest.fn(),
    show: jest.fn(),
    hide: jest.fn(),
    close: jest.fn(),
    destroy: jest.fn()
  })),
  ipcMain: {
    on: jest.fn(),
    off: jest.fn(),
    handle: jest.fn(),
    removeHandler: jest.fn()
  },
  shell: {
    openExternal: jest.fn().mockResolvedValue()
  },
  dialog: {
    showMessageBox: jest.fn(),
    showOpenDialog: jest.fn(),
    showSaveDialog: jest.fn()
  }
}));

// Mock electron-store
jest.mock('electron-store', () => {
  return jest.fn().mockImplementation(() => {
    const store = {};
    return {
      get: jest.fn((key, defaultValue) => store[key] !== undefined ? store[key] : defaultValue),
      set: jest.fn((key, value) => { store[key] = value; }),
      has: jest.fn((key) => store.hasOwnProperty(key)),
      delete: jest.fn((key) => { delete store[key]; }),
      clear: jest.fn(() => { Object.keys(store).forEach(key => delete store[key]); }),
      size: 0,
      store
    };
  });
});

// Mock node modules that might cause issues in tests
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
    readdir: jest.fn(),
    stat: jest.fn(),
    access: jest.fn()
  }
}));

// Set up global test environment
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};

// Increase timeout for integration tests
jest.setTimeout(30000);