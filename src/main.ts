import { app, BrowserWindow, ipcMain, dialog, screen } from 'electron';
import * as path from 'path';
import { OpenAIService } from './services/OpenAIService';
import { AutoSaveService } from './services/AutoSaveService';
import { ErrorBoundaryService } from './services/ErrorBoundaryService';
import { FileSystemService } from './services/FileSystemService';
import { PanelStateService } from './services/PanelStateService';
import ServiceManager from './services/ServiceManager';
import { PanelConfig } from './config/panelConfig';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as keytar from 'keytar';
import OpenAI from 'openai';
import { GPT_CONFIG } from '../config/openaiConfig';

// Register IPC Handlers
let ipcHandlersRegistered = false;

function registerIPCHandlers() {
  if (ipcHandlersRegistered) return;
  ipcHandlersRegistered = true;

  const serviceManager = ServiceManager.getInstance();

  // Error handling handlers
  ipcMain.handle('error:log', async (event, context: string, error: Error) => {
    const errorBoundary = serviceManager.getService('errorBoundary');
    await errorBoundary.handleError(context, error);
  });

  ipcMain.handle('error:getLastError', async () => {
    const errorBoundary = serviceManager.getService('errorBoundary');
    return errorBoundary.getLastError();
  });

  // FileSystem handlers
  ipcMain.handle('fileSystem:selectDirectory', async (event, panelId) => {
    return serviceManager.getService('fileSystem').selectDirectory(panelId);
  });
  ipcMain.handle('fileSystem:readFile', async (event, filePath) => {
    return serviceManager.getService('fileSystem').readFile(filePath);
  });
  ipcMain.handle('fileSystem:writeFile', async (event, filePath, content) => {
    return serviceManager.getService('fileSystem').writeFile(filePath, content);
  });
  ipcMain.handle('fileSystem:saveWriting', async (event, content, category, criteria) => {
    return serviceManager.getService('fileSystem').saveWriting(content, category, criteria);
  });

  // OpenAI handlers
  ipcMain.handle('openai:saveApiKey', async (event, apiKey) => {
    return serviceManager.getService('openai').saveApiKey(apiKey);
  });
  ipcMain.handle('openai:getApiKey', async () => {
    return serviceManager.getService('openai').getApiKey();
  });
  ipcMain.handle('openai:sendAiRequest', async (event, messages) => {
    return serviceManager.getService('openai').sendAiRequest(messages);
  });

  // AutoSave handlers
  ipcMain.handle('autoSave:start', async () => {
    return serviceManager.getService('autoSave').start();
  });
  ipcMain.handle('autoSave:getLatest', async () => {
    return serviceManager.getService('autoSave').getLatest();
  });

  // ChatHistory handlers
  ipcMain.handle('chatHistory:get', async () => {
    return serviceManager.getService('chatHistory').get();
  });
  ipcMain.handle('chatHistory:add', async (event, message) => {
    return serviceManager.getService('chatHistory').add(message);
  });
  ipcMain.handle('chatHistory:clear', async () => {
    return serviceManager.getService('chatHistory').clear();
  });

  // Panel state handlers
  ipcMain.handle('panels:saveState', async (event, panelId, state) => {
    return serviceManager.getService('panelState').saveState(panelId, state);
  });
  ipcMain.handle('panels:getState', async (event, panelId) => {
    return serviceManager.getService('panelState').getState(panelId);
  });

  // Prompts handlers
  ipcMain.handle('prompts:getSubfolders', async () => {
    return serviceManager.getService('prompt').getSubfolders();
  });
  ipcMain.handle('prompts:getNewPrompt', async (event, category) => {
    return serviceManager.getService('prompt').getNewPrompt(category);
  });
}

// Global window reference to prevent garbage collection
let mainWindow: BrowserWindow | null = null;

// Service instances
let openAIService: OpenAIService | null = null;
let autoSaveService: AutoSaveService;
let errorBoundary: ErrorBoundaryService;
let fileSystemService: FileSystemService;
let panelStateService: PanelStateService;

// Add panel state storage
const panelStates = new Map<string, any>();

// Platform-specific configurations
const getPlatformConfig = () => {
  switch (os.platform()) {
    case 'darwin':
      return {
        titleBarStyle: 'hiddenInset' as const,
        trafficLightPosition: { x: 20, y: 32 },
      };
    case 'win32':
      return {
        frame: false,
      };
    default:
      return {
        frame: true,
      };
  }
};

let openai: OpenAI | null = null;

const SERVICE_NAME = 'MyAIApp';
const ACCOUNT_NAME = 'openai-api-key';
const chatHistoryFilePath = path.join(app.getPath('userData'), 'chat-history.json');

function setupAIHandlers(openAIService: OpenAIService) {
  // Panel state handlers
  ipcMain.handle('get-panel-state', async (_, panelId: string) => {
    console.log(`Getting state for panel: ${panelId}`);
    try {
      // Return stored state or default state
      return panelStates.get(panelId) || {
        isCollapsed: false,
        width: panelId === 'middlePanel' ? 600 : 300
      };
    } catch (error) {
      console.error(`Error getting panel state for ${panelId}:`, error);
      return null;
    }
  });

  ipcMain.handle('save-panel-state', async (_, panelId: string, state: any) => {
    console.log(`Saving state for panel: ${panelId}`, state);
    try {
      panelStates.set(panelId, state);
      return true;
    } catch (error) {
      console.error(`Error saving panel state for ${panelId}:`, error);
      return false;
    }
  });

  // File System handlers
  ipcMain.handle('select-directory', async (_, panelId: string) => {
    try {
      return await fileSystemService.selectAndReadDirectory(panelId);
    } catch (error) {
      errorBoundary.handleError('Directory Selection Error', error as Error);
      throw error;
    }
  });

  ipcMain.handle('read-file', async (_, filePath: string) => {
    try {
      return await fileSystemService.readFile(filePath);
    } catch (error) {
      errorBoundary.handleError('File Read Error', error as Error);
      throw error;
    }
  });

  // AI handlers
  ipcMain.handle('ai-request', async (_, prompt: string) => {
    try {
      const response = await openAIService.sendRequest(prompt);
      const currentWindow = BrowserWindow.getFocusedWindow();
      if (currentWindow) {
        currentWindow.webContents.send('ai-progress', 100);
      }
      return response;
    } catch (error) {
      errorBoundary.handleError('AI Request Error', error as Error);
      throw error;
    }
  });

  ipcMain.handle('ai-request-with-progress', async (event, prompt) => {
    try {
      const response = await openAIService.sendRequestWithProgress(
        prompt,
        (progress) => {
          // Send progress updates to renderer
          event.sender.send('ai-progress-update', progress);
        }
      );
      return response;
    } catch (error) {
      console.error('Error in AI request:', error);
      throw error;
    }
  });

  // Auto-save handlers
  ipcMain.handle('start-auto-save', (_, content: string) => {
    autoSaveService.startAutoSave(() => content);
  });

  ipcMain.handle('stop-auto-save', () => {
    autoSaveService.stopAutoSave();
  });

  ipcMain.handle('get-auto-save', async () => {
    return await autoSaveService.getLastSave();
  });

  // OpenAI IPC Handlers
  ipcMain.handle('save-api-key', async (event, apiKey) => {
    try {
      if (typeof apiKey !== 'string' || !apiKey.trim()) {
        throw new Error('Invalid API key');
      }
      await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, apiKey.trim());
      // Update OpenAIService with the new API key
      openAIService.setApiKey(apiKey.trim());
      return true;
    } catch (error) {
      console.error('Error in saveApiKey:', error);
      throw error;
    }
  });

  ipcMain.handle('get-api-key', async () => {
    try {
      const apiKey = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
      return apiKey ? true : false;
    } catch (error) {
      console.error('Error in getApiKey:', error);
      throw error;
    }
  });

  ipcMain.handle('delete-api-key', async () => {
    try {
      await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
      openAIService = null; // instead of null
      return true;
    } catch (error) {
      console.error('Error deleting API Key:', error);
      return false;
    }
  });

  ipcMain.handle('verify-api-key', async (_event, apiKey: string) => {
    try {
      return await openAIService.verifyApiKey(apiKey);
    } catch (error) {
      console.error('Error verifying API key:', error);
      return false;
    }
  });

  ipcMain.handle('ai-request', async (_event, prompt: string) => {
    try {
      return await openAIService.sendRequest(prompt);
    } catch (error) {
      console.error('Error in AI request:', error);
      throw error;
    }
  });

  ipcMain.handle('get-app-data-path', () => {
    return app.getPath('userData');
  });

  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  });

  ipcMain.handle('read-directory', async (event, dirPath) => {
    try {
      const files = await fs.readdir(dirPath);
      return files.filter(file => !file.startsWith('.'));
    } catch (error) {
      console.error('Error reading directory:', error);
      throw error;
    }
  });

  ipcMain.handle('read-file', async (event, filePath) => {
    try {
      if (typeof filePath !== 'string') {
        throw new Error('Invalid file path');
      }
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch (error) {
      console.error('Error in readFile:', error);
      throw error;
    }
  });

  ipcMain.handle('refresh-directory', async (event, dirPath) => {
    try {
      // This is a no-op in the main process as the renderer will re-fetch
      // the directory contents when needed
      return true;
    } catch (error) {
      console.error('Error refreshing directory:', error);
      throw error;
    }
  });

  // File System IPC Handlers
  ipcMain.handle('list-subfolders', async (event, path) => {
    try {
      const entries = await fs.readdir(path, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
        .map(entry => entry.name);
    } catch (error) {
      console.error('Failed to list subfolders:', error);
      throw error;
    }
  });

  ipcMain.handle('list-files', async (event, path, extensions: string[]) => {
    try {
      const entries = await fs.readdir(path, { withFileTypes: true });
      return entries
        .filter(entry => 
          entry.isFile() && 
          !entry.name.startsWith('.') &&
          extensions.some((ext: string) => entry.name.endsWith(ext))
        )
        .map(entry => entry.name);
    } catch (error) {
      console.error('Failed to list files:', error);
      throw error;
    }
  });

  ipcMain.handle('read-file', async (event, path) => {
    try {
      return await fs.readFile(path, 'utf8');
    } catch (error) {
      console.error('Failed to read file:', error);
      throw error;
    }
  });

  ipcMain.handle('select-folder', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
      });
      return result.canceled ? null : result.filePaths[0];
    } catch (error) {
      console.error('Failed to select folder:', error);
      throw error;
    }
  });

  ipcMain.handle('select-save-location', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });

    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  });

  ipcMain.handle('save-file', async (event, filePath, content) => {
    try {
      await fs.writeFile(filePath, content, 'utf8');
      return true;
    } catch (error) {
      console.error('Error saving file:', error);
      return false;
    }
  });

  ipcMain.handle('select-criteria-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  });

  ipcMain.handle('clear-chat-history', async () => {
    try {
      const historyFilePath = path.join(app.getPath('userData'), 'chatHistory.json');
      await fs.unlink(historyFilePath);
      return true;
    } catch (error) {
      console.error('Error clearing chat history:', error);
      return false;
    }
  });

  ipcMain.handle('chat-history-save', async (event, messages) => {
    try {
      if (!Array.isArray(messages)) {
        throw new Error('Invalid messages data');
      }
      try {
        await fs.writeFile(chatHistoryFilePath, JSON.stringify(messages, null, 2), 'utf-8');
      } catch (error) {
        if ((error as any).code === 'ENOENT') {
          // Handle file not found error
          console.error('Chat history file not found:', error);
        } else {
          console.error('Error saving chat history:', error);
        }
      }
      return true;
    } catch (error) {
      console.error('Error saving chat history:', error);
      throw error;
    }
  });

  ipcMain.handle('chat-history-load', async () => {
    try {
      const chatHistoryFilePath = path.join(app.getPath('userData'), 'chatHistory.json');
      const data = await fs.readFile(chatHistoryFilePath, 'utf-8');
      const messages = JSON.parse(data);
      return messages;
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        // File doesn't exist, return empty array
        return [];
      } else {
        console.error('Error loading chat history:', error);
        throw error;
      }
    }
  });

  ipcMain.handle('chat-history-clear', async () => {
    try {
      const historyFilePath = path.join(app.getPath('userData'), 'chat_history.json');
      await fs.unlink(historyFilePath);
      return true;
    } catch (error) {
      console.error('Error clearing chat history:', error);
      return false;
    }
  });

  ipcMain.handle('ai-request', async (event, messages) => {
    try {
      if (!openAIService) {
        throw new Error('OpenAI service not initialized');
      }
      const response = await openAIService.sendChatCompletion(messages);
      return response;
    } catch (error) {
      console.error('Error in AI request:', error);
      return 'An error occurred while processing your request.';
    }
  });

  ipcMain.handle('auto-save-content', async (event, content) => {
    try {
      const autoSavePath = path.join(app.getPath('userData'), 'autosave.txt');
      await fs.writeFile(autoSavePath, content);
      return true;
    } catch (error) {
      console.error('Error during auto-save:', error);
      return false;
    }
  });

  ipcMain.handle('auto-save-get-latest', async () => {
    try {
      const autoSavePath = path.join(app.getPath('userData'), 'autosave.txt');
      const content = await fs.readFile(autoSavePath, 'utf8');
      return content;
    } catch (error) {
      console.error('Error getting auto-saved content:', error);
      return null;
    }
  });

  ipcMain.handle('auto-save-clear', async () => {
    try {
      const autoSavePath = path.join(app.getPath('userData'), 'autosave.txt');
      await fs.unlink(autoSavePath);
      return true;
    } catch (error) {
      console.error('Error clearing auto-saved content:', error);
      return false;
    }
  });

  ipcMain.handle('select-directory', async (event, purpose) => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  });

  ipcMain.handle('write-file', async (event, filePath, content) => {
    try {
      await fs.writeFile(filePath, content);
      return true;
    } catch (error) {
      console.error('Error writing file:', error);
      return false;
    }
  });

  ipcMain.handle('get-subfolders', async (event, directoryPath) => {
    try {
      if (typeof directoryPath !== 'string') {
        throw new Error('Invalid directory path');
      }
      const entries = await fs.readdir(directoryPath, { withFileTypes: true });
      const subfolders = entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);
      return subfolders;
    } catch (error) {
      console.error('Error in getSubfolders:', error);
      throw error;
    }
  });

  ipcMain.handle('get-files', async (event, directoryPath, extensions) => {
    try {
      if (typeof directoryPath !== 'string' || !Array.isArray(extensions)) {
        throw new Error('Invalid arguments');
      }

      const entries = await fs.readdir(directoryPath, { withFileTypes: true });
      const files = entries
        .filter(
          (entry) =>
            entry.isFile() &&
            extensions.includes(entry.name.split('.').pop()?.toLowerCase())
        )
        .map((entry) => entry.name);
      return files;
    } catch (error) {
      console.error('Error in getFiles:', error);
      throw error;
    }
  });

  // Prompt-related handlers
  ipcMain.handle('get-new-prompt', async (event, category: string) => {
    try {
      if (!fileSystemService) {
        throw new Error('FileSystem service not initialized');
      }
      const result = await fileSystemService.getRandomPrompt(category);
      return result;
    } catch (error) {
      console.error('Error getting new prompt:', error);
      throw error;
    }
  });

  ipcMain.handle('set-prompt-folder', async (event, path: string) => {
    try {
      if (!fileSystemService) {
        throw new Error('FileSystem service not initialized');
      }
      await fileSystemService.setSelectedFolder(path);
      return true;
    } catch (error) {
      console.error('Error setting prompt folder:', error);
      throw error;
    }
  });

  console.log('IPC handlers registered');
}

function createWindow() {
  // Get the primary display's work area
  const { workArea } = screen.getPrimaryDisplay();
  
  // Calculate optimal window size (80% of work area)
  const width = Math.floor(workArea.width * 0.8);
  const height = Math.floor(workArea.height * 0.8);

  const platformConfig = getPlatformConfig();
  
  mainWindow = new BrowserWindow({
    width,
    height,
    x: Math.floor((workArea.width - width) / 2),
    y: Math.floor((workArea.height - height) / 2),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js')
    },
    ...platformConfig,
    backgroundColor: '#ffffff',
    show: false, // Don't show the window until it's ready
  });

  // Initialize services with proper error handling
  try {
    openAIService = new OpenAIService();
    autoSaveService = new AutoSaveService(app.getPath('temp'));
    errorBoundary = new ErrorBoundaryService(app.getPath('logs'));
    fileSystemService = new FileSystemService(app.getPath('userData'));
    panelStateService = new PanelStateService(app.getPath('userData'));

    // Attach services to window for access in IPC handlers
    mainWindow.services = {
      openAIService,
      autoSaveService,
      errorBoundary,
      fileSystemService,
      panelStateService
    };
  } catch (error) {
    console.error('Failed to initialize services:', error);
    app.quit();
    return;
  }

  // Set up handlers
  setupAIHandlers(openAIService);

  // Graceful window showing
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Window state management
  mainWindow.on('close', (e) => {
    if (process.platform === 'darwin' && !app.isQuitting) {
      e.preventDefault();
      mainWindow?.hide();
    }
  });

  // Load the app
  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
  } else {
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
    mainWindow.webContents.openDevTools();
  }

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Open external links in browser
    if (url.startsWith('http')) {
      require('electron').shell.openExternal(url);
    }
    return { action: 'deny' };
  });
}

// App lifecycle management
app.on('ready', () => {
  app.whenReady().then(async () => {
    // Retrieve API key on startup
    const apiKey = await keytar.getPassword('MyAIApp', 'openai-api-key');
    if (apiKey) {
      openai = new OpenAI({ apiKey });
    }
    createWindow();
    registerIPCHandlers();
  });
  
  // macOS: Re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow?.show();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

// Enhanced error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  errorBoundary?.handleError('Uncaught Exception', error);
  
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('uncaught-error', {
      message: error.message,
      stack: error.stack
    });
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  errorBoundary?.handleError('Unhandled Rejection', reason instanceof Error ? reason : new Error(String(reason)));
}); 