# API Documentation

## Service Interfaces

### OpenAIService

Interface for managing OpenAI API interactions and API key management.

```typescript
interface OpenAIService {
  setApiKey(apiKey: string): Promise<void>;
  getStoredApiKey(): Promise<string | null>;
  deleteApiKey(): Promise<boolean>;
  getChatCompletion(messages: Array<{role: string, content: string}>): Promise<string>;
}
```

#### Methods

- **setApiKey(apiKey: string): Promise<void>**
  - Stores the API key securely and initializes the OpenAI client
  - Throws an error if the key cannot be saved
  - Parameters:
    - `apiKey`: OpenAI API key string

- **getStoredApiKey(): Promise<string | null>**
  - Retrieves the stored API key from secure storage
  - Returns null if no key is found
  - Returns: Promise resolving to the API key or null

- **deleteApiKey(): Promise<boolean>**
  - Removes the stored API key and cleans up the service
  - Returns: Promise resolving to true if successful

- **getChatCompletion(messages): Promise<string>**
  - Sends a chat completion request to OpenAI
  - Parameters:
    - `messages`: Array of message objects with role and content
  - Returns: Promise resolving to the AI's response
  - Throws an error if the client is not initialized

### AutoSaveService

Interface for managing automatic content saving and recovery.

```typescript
interface AutoSaveService {
  startAutoSave(contentProvider: () => string): void;
  stopAutoSave(): void;
  getLastSave(): Promise<string | null>;
}
```

#### Methods

- **startAutoSave(contentProvider: () => string): void**
  - Starts automatic saving of content every 30 seconds
  - Parameters:
    - `contentProvider`: Function that returns the content to save

- **stopAutoSave(): void**
  - Stops the automatic saving process
  - Cleans up the interval timer

- **getLastSave(): Promise<string | null>**
  - Retrieves the most recent auto-saved content
  - Returns null if no auto-save exists
  - Returns: Promise resolving to the content or null

### FileSystemService

Interface for handling file system operations.

```typescript
interface FileSystemService {
  selectAndReadDirectory(panelId: string): Promise<string | null>;
  readFile(filePath: string): Promise<string>;
  writeFile(filePath: string, content: string): Promise<void>;
  deleteFile(filePath: string): Promise<void>;
  listFiles(directoryPath: string): Promise<string[]>;
}
```

#### Methods

- **selectAndReadDirectory(panelId: string): Promise<string | null>**
  - Opens a directory selection dialog
  - Parameters:
    - `panelId`: Identifier for the requesting panel
  - Returns: Promise resolving to selected directory path or null

- **readFile(filePath: string): Promise<string>**
  - Reads and returns file contents
  - Parameters:
    - `filePath`: Path to the file
  - Returns: Promise resolving to file contents
  - Throws error if file cannot be read

- **writeFile(filePath: string, content: string): Promise<void>**
  - Writes content to a file
  - Parameters:
    - `filePath`: Path to write to
    - `content`: Content to write
  - Throws error if write fails

- **deleteFile(filePath: string): Promise<void>**
  - Deletes a file
  - Parameters:
    - `filePath`: Path to the file
  - Throws error if deletion fails

- **listFiles(directoryPath: string): Promise<string[]>**
  - Lists files in a directory
  - Parameters:
    - `directoryPath`: Path to list
  - Returns: Promise resolving to array of file paths
  - Excludes system files like .DS_Store

## Error Handling

All service methods implement proper error handling:

- Errors are logged with descriptive messages
- Appropriate error objects are thrown
- Network errors are handled gracefully
- File system errors include path information
- API errors include response details

## Type Definitions

Common types used across services:

```typescript
type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type FileType = {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modifiedTime?: Date;
};
```

## Configuration

Services can be configured through their respective configuration files in the `config/` directory:

- `openaiConfig.ts`: OpenAI API settings
- `autoSaveConfig.ts`: Auto-save intervals and cleanup settings
- `fileSystemConfig.ts`: File system paths and filters

## Usage Examples

### OpenAI Service

```typescript
const openAIService = new OpenAIService();

// Set API key
await openAIService.setApiKey('your-api-key');

// Get chat completion
const response = await openAIService.getChatCompletion([
  { role: 'user', content: 'Hello!' }
]);
```

### Auto-Save Service

```typescript
const autoSaveService = new AutoSaveService('/path/to/temp');

// Start auto-saving
autoSaveService.startAutoSave(() => editor.getValue());

// Get last save
const lastContent = await autoSaveService.getLastSave();
```

### File System Service

```typescript
const fileSystemService = new FileSystemService();

// Select directory
const dirPath = await fileSystemService.selectAndReadDirectory('left-panel');

// Read file
const content = await fileSystemService.readFile('/path/to/file.txt');
``` 