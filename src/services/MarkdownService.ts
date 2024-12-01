import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

export class MarkdownService {
  async render(content: string): Promise<string> {
    try {
      const html = await marked(content);
      return sanitizeHtml(html, {
        allowedTags: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'em', 'code', 'pre', 'blockquote'],
        allowedAttributes: {}
      });
    } catch (error) {
      console.error('Error rendering markdown:', error);
      return content; // Return original content if rendering fails
    }
  }
} 