import { ChatMessage, ChatHistory } from '../types/chat';

export class ChatHistoryService {
  private readonly storageKey = 'chat-history';

  public async loadHistory(): Promise<ChatMessage[]> {
    try {
      const historyString = localStorage.getItem(this.storageKey);
      if (!historyString) {
        return [];
      }

      const history: ChatHistory = JSON.parse(historyString);
      return history.messages;
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  }

  public async saveHistory(messages: ChatMessage[]): Promise<void> {
    try {
      const history: ChatHistory = {
        messages,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(this.storageKey, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving chat history:', error);
      throw new Error('Failed to save chat history');
    }
  }

  public async clearHistory(): Promise<void> {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Error clearing chat history:', error);
      throw new Error('Failed to clear chat history');
    }
  }
} 