import { CONTENT_COMBINER_CONFIG } from '../../config/contentCombinerConfig';

export class ContentCombinerService {
  private static readonly SEPARATOR = '\n===\n';

  async getAllDisplayContents(): Promise<string> {
    try {
      const contents: string[] = [];
      const panelIds = ['left', 'center', 'right'];
      
      for (const panelId of panelIds) {
        try {
          const content = await this.getPanelContent(panelId);
          if (content) {
            contents.push(content);
          }
        } catch (error) {
          console.error(`Error getting content from panel ${panelId}:`, error);
          // Continue with other panels even if one fails
        }
      }

      if (contents.length === 0) {
        throw new Error('No content available from any panel');
      }

      return contents.join(ContentCombinerService.SEPARATOR);
    } catch (error) {
      console.error('Error combining contents:', error);
      throw new Error('Failed to combine panel contents');
    }
  }

  private async getPanelContent(panelId: string): Promise<string | null> {
    try {
      const config = CONTENT_COMBINER_CONFIG[panelId];
      if (!config?.enabled) {
        return null;
      }

      const element = document.getElementById(config.containerId);
      return element?.textContent || null;
    } catch (error) {
      console.error(`Error getting content from panel ${panelId}:`, error);
      return null;
    }
  }

  static combineContent(
    originalPrompt: string,
    userSubmission: string,
    evaluationCriteria: string
  ): string {
    const { separator, prefixes } = CONTENT_COMBINER_CONFIG;
    return (
      `${prefixes.originalPrompt}${originalPrompt}${separator}` +
      `${prefixes.userSubmission}${userSubmission}${separator}` +
      `${prefixes.evaluationCriteria}${evaluationCriteria}${separator}`
    );
  }
} 