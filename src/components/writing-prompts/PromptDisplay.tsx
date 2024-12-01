import React from 'react';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import styles from './PromptDisplay.module.css';
import { FILE_DISPLAY_CONFIG } from '../../../config/fileDisplayConfig';

interface PromptDisplayProps {
  prompt: string;
  isLoading: boolean;
  totalPrompts: number;
}

export const PromptDisplay: React.FC<PromptDisplayProps> = ({ 
  prompt, 
  isLoading,
  totalPrompts 
}) => {
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <div>Loading prompt...</div>
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p>Select a category and click "Get New Prompt" to display a writing prompt</p>
          <p className={styles.hint}>Prompts will be shown randomly and won't repeat until all have been viewed</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Random Writing Prompt</h3>
        <div className={styles.progress}>
          Prompts viewed: {totalPrompts}
        </div>
      </div>
      <div className={styles.promptContent}>
        {FILE_DISPLAY_CONFIG.markdown ? (
          <MarkdownRenderer content={prompt} />
        ) : (
          <pre>{prompt}</pre>
        )}
      </div>
    </div>
  );
}; 