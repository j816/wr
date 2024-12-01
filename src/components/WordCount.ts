export class WordCount {
  private element: HTMLElement;

  constructor(container: HTMLElement) {
    this.element = document.createElement('div');
    this.element.className = 'word-count';
    container.appendChild(this.element);
  }

  update(content: string) {
    const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    this.element.textContent = `Words: ${wordCount}`;
  }
} 