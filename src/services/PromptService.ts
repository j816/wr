import * as fs from 'fs/promises';
import * as path from 'path';

export class PromptService {
  private static readonly HISTORY_FILE = 'prompt_history.json';
  private promptHistory: Map<string, string[]> = new Map();
  private displayedPrompts: Set<string> = new Set();
  private availablePrompts: string[] = [];

  constructor(private appDataPath: string) {
    this.loadHistory().catch(error => {
      console.error('Failed to load prompt history:', error);
    });
  }

  async getRandomPrompt(folderPath: string): Promise<string> {
    if (this.availablePrompts.length === 0) {
      // Reset when all prompts have been shown
      this.displayedPrompts.clear();
      this.availablePrompts = await this.loadPrompts(folderPath);
    }

    const randomIndex = Math.floor(Math.random() * this.availablePrompts.length);
    const prompt = this.availablePrompts[randomIndex];
    
    this.displayedPrompts.add(prompt);
    this.availablePrompts.splice(randomIndex, 1);
    
    return prompt;
  }

  private async loadPrompts(folderPath: string): Promise<string[]> {
    // Implementation for loading prompts from folder
    return [];
  }

  private async loadHistory(): Promise<void> {
    try {
      const historyPath = path.join(this.appDataPath, PromptService.HISTORY_FILE);
      const data = await fs.readFile(historyPath, 'utf8');
      const history = JSON.parse(data);
      this.promptHistory = new Map(Object.entries(history));
    } catch (error) {
      // If file doesn't exist, start with empty history
      this.promptHistory = new Map();
    }
  }

  private async saveHistory(): Promise<void> {
    try {
      const historyPath = path.join(this.appDataPath, PromptService.HISTORY_FILE);
      const historyObj = Object.fromEntries(this.promptHistory);
      await fs.writeFile(historyPath, JSON.stringify(historyObj, null, 2));
    } catch (error) {
      console.error('Error saving prompt history:', error);
    }
  }
} 