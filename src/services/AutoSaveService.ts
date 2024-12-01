/**
 * Service for managing automatic saving of user content.
 * Provides functionality for periodic auto-saving, cleanup of old saves,
 * and recovery of the most recent auto-saved content.
 * 
 * @implements {IAutoSaveService}
 */
import { AutoSaveService as IAutoSaveService } from '../types/electron';
import * as fs from 'fs/promises';
import * as path from 'path';

interface AutoSaveMetadata {
  timestamp: number;
  path: string;
}

export class AutoSaveService implements IAutoSaveService {
  /** Timer reference for the auto-save interval */
  private autoSaveInterval: NodeJS.Timeout | null = null;
  
  /** Auto-save interval in milliseconds (30 seconds) */
  private readonly autoSaveDelay = 30000;
  
  /** Maximum age of auto-save files in milliseconds (24 hours) */
  private readonly maxSaveAge = 24 * 60 * 60 * 1000;

  /**
   * Creates an instance of AutoSaveService.
   * @param {string} tempDir - Directory path for storing temporary auto-save files
   */
  constructor(private readonly tempDir: string) {
    this.createTempDirIfNeeded();
    this.cleanupOldSaves();
  }

  /**
   * Creates the temporary directory if it doesn't exist.
   * @private
   * @returns {Promise<void>}
   */
  private async createTempDirIfNeeded(): Promise<void> {
    try {
      await fs.access(this.tempDir);
    } catch {
      await fs.mkdir(this.tempDir, { recursive: true });
    }
  }

  /**
   * Removes auto-save files older than maxSaveAge.
   * This helps prevent accumulation of old temporary files.
   * 
   * @private
   * @returns {Promise<void>}
   */
  private async cleanupOldSaves(): Promise<void> {
    try {
      const files = await fs.readdir(this.tempDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtimeMs > this.maxSaveAge) {
          await fs.unlink(filePath);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old auto-saves:', error);
    }
  }

  /**
   * Generates a unique temporary file path for the current auto-save.
   * @private
   * @returns {string} Path for the temporary file
   */
  private getTempFilePath(): string {
    return path.join(this.tempDir, `autosave_${Date.now()}.txt`);
  }

  /**
   * Starts the auto-save process.
   * Content will be saved every autoSaveDelay milliseconds.
   * 
   * @param {() => string} contentProvider - Function that returns the content to save
   * @returns {void}
   */
  startAutoSave(contentProvider: () => string): void {
    if (this.autoSaveInterval) {
      this.stopAutoSave();
    }

    this.autoSaveInterval = setInterval(async () => {
      try {
        const content = contentProvider();
        const tempFile = this.getTempFilePath();
        await fs.writeFile(tempFile, content, 'utf8');

        // Delete previous auto-save file if it exists
        const files = await fs.readdir(this.tempDir);
        for (const file of files) {
          if (file.startsWith('autosave_') && file !== path.basename(tempFile)) {
            await fs.unlink(path.join(this.tempDir, file));
          }
        }
      } catch (error) {
        console.error('Error in auto-save:', error);
      }
    }, this.autoSaveDelay);
  }

  stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  async getLastSave(): Promise<string | null> {
    try {
      const filePath = this.getTempFilePath();
      const content = await fs.readFile(filePath, 'utf8');
      return content;
    } catch {
      return null;
    }
  }

  // Alias for getLastSave to maintain backward compatibility
  async getLatestAutoSave(): Promise<string | null> {
    return this.getLastSave();
  }
} 