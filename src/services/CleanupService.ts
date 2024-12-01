import * as fs from 'fs/promises';
import * as path from 'path';

export class CleanupService {
  private static readonly MAX_FILE_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  constructor(private tempDir: string) {}

  /**
   * Cleans up temporary files older than MAX_FILE_AGE
   */
  async cleanupTempFiles(): Promise<void> {
    try {
      const files = await fs.readdir(this.tempDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = await fs.stat(filePath);

        // Check if file is older than MAX_FILE_AGE
        if (now - stats.mtimeMs > CleanupService.MAX_FILE_AGE) {
          await fs.unlink(filePath).catch(err => {
            console.error(`Failed to delete file ${filePath}:`, err);
          });
        }
      }
    } catch (error) {
      console.error('Error during temp file cleanup:', error);
    }
  }

  /**
   * Schedules periodic cleanup of temporary files
   */
  scheduleCleanup(interval: number = 60 * 60 * 1000): void { // Default: every hour
    setInterval(() => {
      this.cleanupTempFiles().catch(err => {
        console.error('Scheduled cleanup failed:', err);
      });
    }, interval);
  }
} 