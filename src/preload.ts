import { contextBridge, ipcRenderer } from 'electron';
import { StreamEvent } from './types/electron';
import { PanelState } from './config/panelConfig';

// Define interfaces for type safety
interface FileSystemAPI {
  selectDirectory: (panelId: string) => Promise<string | null>;
  readFile: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, content: string) => Promise<void>;
  saveWriting: (content: string, category: string, criteria: string) => Promise<void>;
  getRandomPrompt: (folderPath: string) => Promise<string>;
}

interface SettingsAPI {
  getStoredFolders: () => Promise<Record<string, string>>;
  setStoredFolder: (panelId: string, path: string) => Promise<void>;
}

interface PromptsAPI {
  getSubfolders: () => Promise<string[]>;
  getNewPrompt: (category: string) => Promise<string>;
  setSelectedFolder: (path: string) => Promise<void>;
}

interface AutoSaveAPI {
  start: () => Promise<void>;
  getLatest: () => Promise<string | null>;
}

interface ChatHistoryAPI {
  get: () => Promise<Array<{ role: string; content: string }>>;
  add: (message: { role: string; content: string }) => Promise<void>;
  clear: () => Promise<void>;
}

interface WordCountAPI {
  get: (text: string) => Promise<number>;
}

interface PanelsAPI {
  saveState: (panelId: string, state: PanelState) => Promise<void>;
  getState: (panelId: string) => Promise<PanelState>;
}

interface OpenAIAPI {
  saveApiKey: (apiKey: string) => Promise<boolean>;
  getApiKey: () => Promise<boolean>;
  deleteApiKey: () => Promise<boolean>;
  verifyApiKey: (apiKey: string) => Promise<boolean>;
  sendAiRequest: (prompt: string) => Promise<string>;
  sendStreamingAiRequest: (prompt: string, callback: (chunk: string) => void) => Promise<void>;
}

// Validate IPC channel names for security
const validChannels = new Set([
  'select-directory',
  'read-file',
  'write-file',
  'save-writing',
  'get-random-prompt',
  'get-stored-folders',
  'set-stored-folder',
  'get-subfolders',
  'get-new-prompt',
  'set-prompt-folder',
  'start-auto-save',
  'get-latest-auto-save',
  'chat-history-get',
  'chat-history-add',
  'chat-history-clear',
  'get-word-count',
  'save-panel-state',
  'get-panel-state',
  'save-api-key',
  'get-api-key',
  'delete-api-key',
  'verify-api-key',
  'ai-request',
  'ai-request-streaming',
  'get-app-data-path',
  'uncaught-error'
]);

// Secure IPC wrapper
const secureIPCInvoke = async <T>(channel: string, ...args: unknown[]): Promise<T> => {
  if (!validChannels.has(channel)) {
    throw new Error(`Invalid IPC channel: ${channel}`);
  }
  try {
    return await ipcRenderer.invoke(channel, ...args);
  } catch (error) {
    console.error(`Error in IPC channel ${channel}:`, error);
    throw error;
  }
};

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI',
  {
    fileSystem: {
      selectDirectory: async (panelId: string) => 
        secureIPCInvoke('select-directory', panelId),
      readFile: async (filePath: string) => 
        secureIPCInvoke('read-file', filePath),
      writeFile: async (filePath: string, content: string) => 
        secureIPCInvoke('write-file', filePath, content),
      saveWriting: async (content: string, category: string, criteria: string) => 
        secureIPCInvoke('save-writing', content, category, criteria),
      getRandomPrompt: async (folderPath: string) => 
        secureIPCInvoke('get-random-prompt', folderPath)
    } as FileSystemAPI,

    settings: {
      getStoredFolders: async () => 
        secureIPCInvoke('get-stored-folders'),
      setStoredFolder: async (panelId: string, path: string) => 
        secureIPCInvoke('set-stored-folder', panelId, path)
    } as SettingsAPI,

    prompts: {
      getSubfolders: () => secureIPCInvoke('get-subfolders'),
      getNewPrompt: (category: string) => secureIPCInvoke('get-new-prompt', category),
      setSelectedFolder: (path: string) => secureIPCInvoke('set-prompt-folder', path)
    } as PromptsAPI,

    autoSave: {
      start: async () => secureIPCInvoke('start-auto-save'),
      getLatest: async () => secureIPCInvoke('get-latest-auto-save')
    } as AutoSaveAPI,

    chatHistory: {
      get: () => secureIPCInvoke('chat-history-get'),
      add: (message: { role: string; content: string }) => 
        secureIPCInvoke('chat-history-add', message),
      clear: () => secureIPCInvoke('chat-history-clear')
    } as ChatHistoryAPI,

    wordCount: {
      get: (text: string) => secureIPCInvoke('get-word-count', text)
    } as WordCountAPI,

    panels: {
      saveState: (panelId: string, state: PanelState) => 
        secureIPCInvoke('save-panel-state', panelId, state),
      getState: (panelId: string) => 
        secureIPCInvoke('get-panel-state', panelId)
    } as PanelsAPI,

    // OpenAI methods
    openai: {
      saveApiKey: (apiKey: string) => secureIPCInvoke('save-api-key', apiKey),
      getApiKey: () => secureIPCInvoke('get-api-key'),
      deleteApiKey: () => secureIPCInvoke('delete-api-key'),
      verifyApiKey: (apiKey: string) => secureIPCInvoke('verify-api-key', apiKey),
      sendAiRequest: (prompt: string) => secureIPCInvoke('ai-request', prompt),
      sendStreamingAiRequest: (prompt: string, callback: (chunk: string) => void) => {
        const channel = `streaming-response-${Date.now()}`;
        if (validChannels.has(channel)) {
          ipcRenderer.on(channel, (_event, chunk) => callback(chunk));
          return secureIPCInvoke('ai-request-streaming', prompt, channel);
        }
        throw new Error('Invalid streaming channel');
      }
    } as OpenAIAPI,

    // Error handling
    onUncaughtError: (callback: (error: { message: string; stack?: string }) => void) => {
      ipcRenderer.on('uncaught-error', (_event, error) => callback(error));
    },

    saveWriting: (content: string, filePath: string) =>
      ipcRenderer.invoke('save-writing', content, filePath),
    selectSaveLocation: () => ipcRenderer.invoke('select-save-location'),
    selectCriteriaFolder: () => ipcRenderer.invoke('select-criteria-folder'),
    saveApiKey: (apiKey: string) => ipcRenderer.invoke('save-api-key', apiKey),
    getApiKey: () => ipcRenderer.invoke('get-api-key'),
    deleteApiKey: () => ipcRenderer.invoke('delete-api-key'),
    clearChatHistory: () => ipcRenderer.invoke('clear-chat-history'),
    saveFile: (filePath: string, content: string) => ipcRenderer.invoke('save-file', filePath, content),

    chatHistory: {
      save: (messages: Array<{ role: string; content: string }>) => ipcRenderer.invoke('chat-history-save', messages),
      load: () => ipcRenderer.invoke('chat-history-load'),
      clear: () => ipcRenderer.invoke('chat-history-clear')
    },

    sendAIRequest: (messages: Array<{ role: string; content: string }>) => ipcRenderer.invoke('send-ai-request', messages),

    autoSave: {
      start: () => ipcRenderer.invoke('auto-save-start'),
      getLatest: () => ipcRenderer.invoke('auto-save-get-latest'),
      clear: () => ipcRenderer.invoke('auto-save-clear'),
    },

    fileSystem: {
      selectDirectory: (purpose: string) => ipcRenderer.invoke('select-directory', purpose),
      writeFile: (filePath: string, content: string) => ipcRenderer.invoke('write-file', filePath, content),
    },

    chatHistory: {
      load: () => ipcRenderer.invoke('chat-history-load'),
      save: (messages) => ipcRenderer.invoke('chat-history-save', messages),
      clear: () => ipcRenderer.invoke('chat-history-clear'),
    },

    sendAIRequest: (messages) => ipcRenderer.invoke('send-ai-request', messages),
    selectDirectory: (panelId: string) => ipcRenderer.invoke('select-directory', panelId),
    getSubfolders: (directoryPath: string) => ipcRenderer.invoke('get-subfolders', directoryPath),
    getFiles: (directoryPath: string, extensions: string[]) => ipcRenderer.invoke('get-files', directoryPath, extensions),
    readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
    saveApiKey: (apiKey: string) => ipcRenderer.invoke('save-api-key', apiKey),
    getApiKey: () => ipcRenderer.invoke('get-api-key'),

    // Error handling methods
    logError: (context: string, error: Error) => ipcRenderer.invoke('error:log', context, error),
    getLastError: () => ipcRenderer.invoke('error:getLastError'),
  }
);

// Expose all APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  fileSystem: {
    selectDirectory: (...args: unknown[]) => secureIPCInvoke('fileSystem:selectDirectory', ...args),
    readFile: (...args: unknown[]) => secureIPCInvoke('fileSystem:readFile', ...args),
    writeFile: (...args: unknown[]) => secureIPCInvoke('fileSystem:writeFile', ...args),
    saveWriting: (...args: unknown[]) => secureIPCInvoke('fileSystem:saveWriting', ...args),
    getRandomPrompt: (...args: unknown[]) => secureIPCInvoke('fileSystem:getRandomPrompt', ...args)
  },
  settings: {
    getStoredFolders: (...args: unknown[]) => secureIPCInvoke('settings:getStoredFolders', ...args),
    setStoredFolder: (...args: unknown[]) => secureIPCInvoke('settings:setStoredFolder', ...args)
  },
  prompts: {
    getSubfolders: (...args: unknown[]) => secureIPCInvoke('prompts:getSubfolders', ...args),
    getNewPrompt: (...args: unknown[]) => secureIPCInvoke('prompts:getNewPrompt', ...args),
    setSelectedFolder: (...args: unknown[]) => secureIPCInvoke('prompts:setSelectedFolder', ...args)
  },
  autoSave: {
    start: (...args: unknown[]) => secureIPCInvoke('autoSave:start', ...args),
    getLatest: (...args: unknown[]) => secureIPCInvoke('autoSave:getLatest', ...args)
  },
  chatHistory: {
    get: (...args: unknown[]) => secureIPCInvoke('chatHistory:get', ...args),
    add: (...args: unknown[]) => secureIPCInvoke('chatHistory:add', ...args),
    clear: (...args: unknown[]) => secureIPCInvoke('chatHistory:clear', ...args)
  },
  wordCount: {
    get: (...args: unknown[]) => secureIPCInvoke('wordCount:get', ...args)
  },
  panels: {
    saveState: (...args: unknown[]) => secureIPCInvoke('panels:saveState', ...args),
    getState: (...args: unknown[]) => secureIPCInvoke('panels:getState', ...args)
  },
  openai: {
    saveApiKey: (...args: unknown[]) => secureIPCInvoke('openai:saveApiKey', ...args),
    getApiKey: (...args: unknown[]) => secureIPCInvoke('openai:getApiKey', ...args),
    deleteApiKey: (...args: unknown[]) => secureIPCInvoke('openai:deleteApiKey', ...args),
    verifyApiKey: (...args: unknown[]) => secureIPCInvoke('openai:verifyApiKey', ...args),
    sendAiRequest: (...args: unknown[]) => secureIPCInvoke('openai:sendAiRequest', ...args),
    sendStreamingAiRequest: (...args: unknown[]) => secureIPCInvoke('openai:sendStreamingAiRequest', ...args)
  }
});

// Add console message to verify preload script execution
console.log('Preload: Script loaded and API exposed'); 