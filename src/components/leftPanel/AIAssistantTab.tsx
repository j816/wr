import React from 'react';
import { AIAssistant } from '../AIAssistant';
import styles from './AIAssistantTab.module.css';

export const AIAssistantTab: React.FC = () => {
  return (
    <div className={styles.aiAssistantTab}>
      <AIAssistant />
    </div>
  );
}; 