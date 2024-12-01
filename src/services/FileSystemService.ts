/**
 * Enhanced FileSystemService for handling all file system operations in the application.
 * Provides a secure and consistent way to interact with the file system
 * while maintaining proper error handling and path safety checks.
 */
import { FileSystemService as IFileSystemService } from '../types/electron';
import { dialog } from 'electron';
import * as fs from 'fs/promises';
import { FSWatcher, watch, WatchListener } from 'fs';
import { EventEmitter } from 'events';
import * as path from 'path';
import { Subfolder } from '../types/panels';
import { FileSystemError } from '../errors/FileSystemError';
import { FILE_SYSTEM_CONFIG } from '../../config/fileSystemConfig';

interface FileWatcher {
  path: string;
  watcher: FSWatcher;
}

export class FileSystemService extends EventEmitter implements IFileSystemService {
  private readonly excludedFiles = new Set(['.DS_Store', 'Thumbs.db', '.git']);
  private readonly allowedFileTypes = new Set(['.txt', '.md', '.json']);
  private readonly watchers: Map<string, FileWatcher> = new Map();
  private readonly tempDir: string;
  private basePath: string;
  private lastDirectoryPath: { [key: string]: string } = {};

  constructor(basePath: string = process.cwd()) {
    super();
    this.basePath = basePath;
    this.tempDir = path.join(basePath, 'temp');
    this.initializeBasePath();
  }

  private async initializeBasePath(): Promise<void> {
    try {
      await fs.access(this.basePath);
      await fs.access(this.tempDir).catch(() => 
        fs.mkdir(this.tempDir, { recursive: true })
      );
    } catch (error) {
      await fs.mkdir(this.basePath, { recursive: true });
      await fs.mkdir(this.tempDir, { recursive: true });
    }
  }

  /**
   * Watches a directory or file for changes
   * @param targetPath Path to watch
   * @param callback Callback to execute when changes occur
   */
  async watchPath(targetPath: string, callback: (eventType: string, filename: string) => void): Promise<void> {
    if (!this.isPathSafe(targetPath)) {
      throw new FileSystemError(`Cannot watch path: ${targetPath}`, 'WATCH_ACCESS_DENIED');
    }

    if (this.watchers.has(targetPath)) {
      return;
    }

    try {
      watch(targetPath, { persistent: true }, (eventType: string, filename: string | null) => {
        if (filename) {
          callback(eventType, filename);
        }
      });
    } catch (error) {
      console.error('Error setting up file watch:', error);
      throw new FileSystemError(`Failed to watch path: ${targetPath}`, 'WATCH_ERROR');
    }
  }

  /**
   * Stops watching a path
   * @param targetPath Path to stop watching
   */
  async unwatchPath(targetPath: string): Promise<void> {
    const watcher = this.watchers.get(targetPath);
    if (watcher) {
      watcher.watcher.close();
      this.watchers.delete(targetPath);
    }
  }

  /**
   * Creates a temporary file with the given content
   * @param content Content to write to the temporary file
   * @returns Path to the temporary file
   */
  async createTempFile(content: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const tempPath = path.join(this.tempDir, `temp-${timestamp}.txt`);
    
    try {
      await this.writeFile(tempPath, content);
      return tempPath;
    } catch (error) {
      const err = error as Error;
      throw new FileSystemError(`Failed to create temporary file: ${err.message}`, 'TEMP_FILE_ERROR');
    }
  }

  /**
   * Cleans up temporary files older than the specified age
   * @param maxAge Maximum age in milliseconds
   */
  async cleanupTempFiles(maxAge: number): Promise<void> {
    try {
      const files = await fs.readdir(this.tempDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtimeMs > maxAge) {
          await fs.unlink(filePath);
        }
      }
    } catch (error) {
      const err = error as Error;
      console.error('Error cleaning up temporary files:', err);
    }
  }

  static async selectDirectory(panelId: string): Promise<string | null> {
    const config = FILE_SYSTEM_CONFIG.panelConfigs[panelId];

    if (!config.enabled) {
      throw new FileSystemError(`File selection not enabled for panel: ${panelId}`, 'PANEL_DISABLED');
    }

    const result = await dialog.showOpenDialog({
      properties: config.properties,
      buttonLabel: config.buttonText,
      filters: config.filters,
    });

    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  }

  async readFile(filePath: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
    if (!this.isPathSafe(filePath)) {
      throw new FileSystemError(`Cannot read file: ${filePath}`, 'FILE_READ_ERROR');
    }

    try {
      return await fs.readFile(filePath, { encoding });
    } catch (error) {
      console.error('Error reading file:', error);
      throw new FileSystemError(`Failed to read file: ${filePath}`, 'FILE_READ_ERROR');
    }
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      const dir = path.dirname(filePath);
      await fs.access(dir, fs.constants.W_OK);
      
      if (!this.isPathSafe(filePath)) {
        throw new FileSystemError('Access to this file path is not allowed', 'PATH_ACCESS_DENIED');
      }

      await fs.writeFile(filePath, content, 'utf8');
      this.emit('fileChanged', filePath);
    } catch (error) {
      if (error instanceof FileSystemError) {
        throw error;
      }
      const err = error as Error;
      throw new FileSystemError(`Error writing file: ${err.message}`, 'WRITE_ERROR');
    }
  }

  private isPathSafe(filePath: string): boolean {
    const normalizedPath = path.normalize(filePath);
    const normalizedBasePath = path.normalize(this.basePath);
    const normalizedTempDir = path.normalize(this.tempDir);

    // Allow access to temp directory
    if (normalizedPath.startsWith(normalizedTempDir)) {
      return true;
    }

    // Check if the path is within the base path
    if (!normalizedPath.startsWith(normalizedBasePath)) {
      return false;
    }

    // Check for excluded files
    const fileName = path.basename(normalizedPath);
    if (this.excludedFiles.has(fileName)) {
      return false;
    }

    // Check file extension if it's not a directory
    const ext = path.extname(fileName).toLowerCase();
    if (ext && !this.allowedFileTypes.has(ext)) {
      return false;
    }

    return true;
  }

  async listDirectory(dirPath: string): Promise<string[]> {
    try {
      if (!this.isPathSafe(dirPath)) {
        throw new FileSystemError('Access to this directory path is not allowed', 'DIR_ACCESS_DENIED');
      }

      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      return entries
        .filter(entry => !this.excludedFiles.has(entry.name))
        .map(entry => entry.name);
    } catch (error) {
      if (error instanceof FileSystemError) {
        throw error;
      }
      const err = error as Error;
      throw new FileSystemError(`Error listing directory: ${err.message}`, 'LIST_ERROR');
    }
  }

  async getRandomPrompt(category: string): Promise<{ content: string; fileName: string }> {
    try {
      const promptsPath = path.join(this.basePath, 'prompts', category);
      const files = await this.listDirectory(promptsPath);
      const validFiles = files.filter(file => this.allowedFileTypes.has(path.extname(file).toLowerCase()));

      if (validFiles.length === 0) {
        throw new FileSystemError('No valid prompt files found in the category', 'NO_PROMPTS_ERROR');
      }

      const randomFile = validFiles[Math.floor(Math.random() * validFiles.length)];
      const content = await this.readFile(path.join(promptsPath, randomFile));

      return { content, fileName: randomFile };
    } catch (error) {
      if (error instanceof FileSystemError) {
        throw error;
      }
      const err = error as Error;
      throw new FileSystemError(`Error getting random prompt: ${err.message}`, 'PROMPT_ERROR');
    }
  }

  async saveWriting(content: string, category: string, criteria: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${timestamp}_WritingPrompts_${category}_${criteria}.txt`;
    const filePath = path.join(this.basePath, 'writings', fileName);

    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await this.writeFile(filePath, content);
    } catch (error) {
      const err = error as Error;
      throw new FileSystemError(`Error saving writing: ${err.message}`, 'SAVE_ERROR');
    }
  }

  /**
   * Cleanup method to be called when the service is being destroyed
   */
  async dispose(): Promise<void> {
    // Close all file watchers
    for (const [targetPath] of this.watchers) {
      await this.unwatchPath(targetPath);
    }

    // Clean up temporary files
    await this.cleanupTempFiles(24 * 60 * 60 * 1000); // 24 hours
  }

  async getSubfolders(directoryPath: string, excludeFiles: string[] = []): Promise<string[]> {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory() && !excludeFiles.includes(entry.name))
      .map(entry => entry.name);
  }

  async getFiles(directoryPath: string, extensions: string[], excludeFiles: string[] = []): Promise<string[]> {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });
    return entries
      .filter(
        entry =>
          entry.isFile() &&
          extensions.includes(path.extname(entry.name).toLowerCase()) &&
          !excludeFiles.includes(entry.name)
      )
      .map(entry => entry.name);
  }

  async selectAndReadDirectory(panelId: string): Promise<string | null> {
    const config = FILE_SYSTEM_CONFIG.panelConfigs[panelId as keyof typeof FILE_SYSTEM_CONFIG.panelConfigs];

    if (!config?.enabled) {
      throw new FileSystemError(`File selection not enabled for panel: ${panelId}`, 'PANEL_DISABLED');
    }

    try {
      const result = await dialog.showOpenDialog({
        properties: config.properties,
        buttonLabel: config.buttonText,
        filters: config.filters,
        defaultPath: this.lastDirectoryPath[panelId]
      });

      if (result.canceled || !result.filePaths.length) {
        return null;
      }

      const directoryPath = result.filePaths[0];
      this.lastDirectoryPath[panelId] = directoryPath;
      return directoryPath;
    } catch (error) {
      console.error('Error in file system operation:', error);
      throw new FileSystemError('Failed to select directory', 'SELECT_ERROR');
    }
  }

  async setSelectedFolder(path: string): Promise<void> {
    // Implement the method logic
  }
} 