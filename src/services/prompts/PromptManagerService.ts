import * as fs from 'fs/promises';
import * as path from 'path';

interface PromptHistory {
  [category: string]: {
    shown: string[];
    remaining: string[];
  };
}

export class PromptManagerService {
  private static readonly HISTORY_FILE = 'prompt_history.json';
  private history: PromptHistory = {};
  private selectedFolder: string | null = null;

  constructor(private appDataPath: string) {
    this.loadHistory().catch(error => {
      console.error('Failed to load prompt history:', error);
    });
  }

  async setSelectedFolder(folderPath: string): Promise<void> {
    try {
      await fs.access(folderPath);
      this.selectedFolder = folderPath;
      await this.saveSelectedFolder();
    } catch (error) {
      throw new Error('Selected folder is not accessible');
    }
  }

  async getSubfolders(): Promise<string[]> {
    if (!this.selectedFolder) {
      throw new Error('No folder selected');
    }

    try {
      const entries = await fs.readdir(this.selectedFolder, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .sort();
    } catch (error) {
      throw new Error('Failed to read subfolders');
    }
  }

  async getNewPrompt(category: string): Promise<{ content: string; fileName: string }> {
    if (!this.selectedFolder) {
      throw new Error('No folder selected');
    }

    const categoryPath = path.join(this.selectedFolder, category);
    
    try {
      // Initialize category if needed
      if (!this.history[category]) {
        await this.initializeCategory(category, categoryPath);
      }

      // Reset if all prompts have been shown
      if (this.history[category].remaining.length === 0) {
        this.history[category].remaining = [...this.history[category].shown];
        this.history[category].shown = [];
      }

      // Get random prompt from remaining
      const randomIndex = Math.floor(Math.random() * this.history[category].remaining.length);
      const fileName = this.history[category].remaining[randomIndex];

      // Move to shown
      this.history[category].remaining.splice(randomIndex, 1);
      this.history[category].shown.push(fileName);

      // Read content
      const content = await fs.readFile(path.join(categoryPath, fileName), 'utf8');
      await this.saveHistory();

      return { content, fileName };
    } catch (error: unknown) {
      // Handle unknown error type safely
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to get new prompt: ${errorMessage}`);
    }
  }

  private async initializeCategory(category: string, categoryPath: string): Promise<void> {
    const files = await fs.readdir(categoryPath);
    const validFiles = files.filter(file => 
      ['.txt', '.md'].includes(path.extname(file).toLowerCase())
    );

    if (validFiles.length === 0) {
      throw new Error('No valid prompt files found in category');
    }

    this.history[category] = {
      shown: [],
      remaining: validFiles
    };
  }

  private async loadHistory(): Promise<void> {
    try {
      const historyPath = path.join(this.appDataPath, PromptManagerService.HISTORY_FILE);
      const data = await fs.readFile(historyPath, 'utf8');
      const parsed = JSON.parse(data);
      this.history = parsed.history || {};
      this.selectedFolder = parsed.selectedFolder || null;
    } catch (error) {
      // Start with empty history if file doesn't exist
      this.history = {};
      this.selectedFolder = null;
    }
  }

  private async saveHistory(): Promise<void> {
    try {
      const historyPath = path.join(this.appDataPath, PromptManagerService.HISTORY_FILE);
      const data = {
        history: this.history,
        selectedFolder: this.selectedFolder
      };
      await fs.writeFile(historyPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to save prompt history:', error);
    }
  }

  private async saveSelectedFolder(): Promise<void> {
    await this.saveHistory();
  }
} 