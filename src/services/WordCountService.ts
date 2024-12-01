export class WordCountService {
  static getWordCount(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  static updateDisplay(count: number): void {
    const display = document.getElementById('word-count-display');
    if (display) {
      display.textContent = `Words: ${count}`;
    }
  }
} 