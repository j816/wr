interface ViewedPrompt {
  content: string;
  timestamp: number;
}

class PromptsService {
  private viewedPrompts: Map<string, ViewedPrompt[]> = new Map();
  private readonly VIEWED_PROMPTS_KEY = 'viewed-prompts';
  private readonly PROMPT_RESET_HOURS = 24;

  constructor() {
    this.loadViewedPrompts();
  }

  private loadViewedPrompts() {
    try {
      const saved = localStorage.getItem(this.VIEWED_PROMPTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.viewedPrompts = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Error loading viewed prompts:', error);
    }
  }

  private saveViewedPrompts() {
    try {
      const obj = Object.fromEntries(this.viewedPrompts);
      localStorage.setItem(this.VIEWED_PROMPTS_KEY, JSON.stringify(obj));
    } catch (error) {
      console.error('Error saving viewed prompts:', error);
    }
  }

  private cleanOldPrompts(category: string) {
    const prompts = this.viewedPrompts.get(category) || [];
    const now = Date.now();
    const filtered = prompts.filter(p => 
      (now - p.timestamp) < (this.PROMPT_RESET_HOURS * 60 * 60 * 1000)
    );
    this.viewedPrompts.set(category, filtered);
    this.saveViewedPrompts();
  }

  async getNewPrompt(category: string): Promise<string | null> {
    this.cleanOldPrompts(category);
    
    const viewed = this.viewedPrompts.get(category) || [];
    const viewedContents = new Set(viewed.map(p => p.content));
    
    // Get all prompts for the category
    const allPrompts = await window.electronAPI.prompts.getAllInCategory(category);
    const availablePrompts = allPrompts.filter((p: string) => !viewedContents.has(p));

    if (availablePrompts.length === 0) {
      if (allPrompts.length === 0) {
        return null;
      }
      // All prompts have been viewed, reset tracking
      this.viewedPrompts.set(category, []);
      this.saveViewedPrompts();
      return allPrompts[Math.floor(Math.random() * allPrompts.length)];
    }

    const selectedPrompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
    viewed.push({
      content: selectedPrompt,
      timestamp: Date.now()
    });
    this.viewedPrompts.set(category, viewed);
    this.saveViewedPrompts();

    return selectedPrompt;
  }
}

export default PromptsService; 