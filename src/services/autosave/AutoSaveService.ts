import * as fs from 'fs/promises';
import * as path from 'path';

export class AutoSaveService {
  private readonly autoSaveInterval: number;
  private readonly tempDir: string;
  private autoSaveTimer: NodeJS.Timeout | null = null;

  constructor(tempDir: string, interval: number = 30000) {
    this.tempDir = tempDir;
    this.autoSaveInterval = interval;
  }

  startAutoSave(content: string, filename: string): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.autoSaveTimer = setInterval(async () => {
      await this.saveContent(content, filename);
    }, this.autoSaveInterval);
  }

  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  private async saveContent(content: string, filename: string): Promise<void> {
    const filepath = path.join(this.tempDir, filename);
    await fs.writeFile(filepath, content, 'utf8');
  }

  async getLatestAutoSave(filename: string): Promise<string | null> {
    try {
      const filepath = path.join(this.tempDir, filename);
      return await fs.readFile(filepath, 'utf8');
    } catch {
      return null;
    }
  }
} 