import React, { useState, useEffect } from 'react';
import styles from './AIFeedbackTab.module.css';

export const AIFeedbackTab: React.FC = () => {
  const [feedback, setFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const handleAIFeedback = (event: CustomEvent) => {
      setFeedback(event.detail);
      setIsLoading(false);
    };
    const handleAISubmission = () => {
      setIsLoading(true);
      setFeedback('');
    };
    window.addEventListener('ai-feedback', handleAIFeedback as any);
    window.addEventListener('ai-submission', handleAISubmission);
    return () => {
      window.removeEventListener('ai-feedback', handleAIFeedback as any);
      window.removeEventListener('ai-submission', handleAISubmission);
    };
  }, []);

  return (
    <div className={styles.container}>
      {isLoading && <div className={styles.loadingIndicator}>Processing AI feedback...</div>}
      {feedback && !isLoading ? (
        <div className={styles.feedbackDisplay}>{feedback}</div>
      ) : (
        !isLoading && <div className={styles.placeholder}>No feedback available.</div>
      )}
    </div>
  );
}; 