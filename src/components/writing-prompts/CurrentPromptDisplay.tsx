import React from 'react';
import { usePromptService } from '../../services/prompts/usePromptService';
import styles from './CurrentPromptDisplay.module.css';

interface CurrentPromptDisplayProps {
  prompt?: string;
}

export const CurrentPromptDisplay: React.FC<CurrentPromptDisplayProps> = ({ prompt }) => {
  const { selectedFolder } = usePromptService();

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Current Prompt</h3>
      <div className={styles.content}>
        {prompt ? (
          <p>{prompt}</p>
        ) : selectedFolder ? (
          <p>Select a prompt from {selectedFolder}</p>
        ) : (
          <p className={styles.empty}>No prompt selected</p>
        )}
      </div>
    </div>
  );
}; 