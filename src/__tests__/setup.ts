import '@jest/globals';

// Mock DOM
const mockDocument = {
  createElement: jest.fn().mockImplementation((tag) => ({
    className: '',
    textContent: '',
    id: '',
    appendChild: jest.fn(),
    classList: {
      add: jest.fn()
    }
  })),
  getElementById: jest.fn(),
  body: {
    appendChild: jest.fn()
  }
};

global.document = mockDocument as unknown as Document;
global.window = { 
  electronAPI: {} 
} as unknown as Window & typeof globalThis;

// Mock electron
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn()
  },
  dialog: {
    showOpenDialog: jest.fn().mockResolvedValue({
      canceled: false,
      filePaths: ['/mock/path']
    })
  },
  ipcMain: {
    handle: jest.fn()
  }
}));

// Mock fs promises
jest.mock('fs/promises', () => ({
  readdir: jest.fn().mockResolvedValue(['file1.txt', 'file2.md']),
  readFile: jest.fn().mockResolvedValue('mock content'),
  writeFile: jest.fn().mockResolvedValue(undefined),
  mkdir: jest.fn().mockResolvedValue(undefined)
}));

describe('Test Environment Setup', () => {
  test('global mocks are properly configured', () => {
    expect(global.document).toBeDefined();
    expect(global.window).toBeDefined();
    expect(global.window.electronAPI).toBeDefined();
  });
}); 