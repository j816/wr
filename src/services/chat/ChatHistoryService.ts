import * as fs from 'fs/promises';
import * as path from 'path';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export class ChatHistoryService {
  private readonly historyFile: string;

  constructor(historyDir: string) {
    this.historyFile = path.join(historyDir, 'chat_history.json');
  }

  async saveMessage(message: Omit<ChatMessage, 'timestamp'>): Promise<void> {
    const history = await this.loadHistory();
    history.push({
      ...message,
      timestamp: Date.now()
    });
    await fs.writeFile(this.historyFile, JSON.stringify(history), 'utf8');
  }

  async loadHistory(): Promise<ChatMessage[]> {
    try {
      const content = await fs.readFile(this.historyFile, 'utf8');
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  async clearHistory(): Promise<void> {
    await fs.writeFile(this.historyFile, '[]', 'utf8');
  }
} 