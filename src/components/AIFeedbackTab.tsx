import React from 'react';
import styles from './AIFeedbackTab.module.css';

interface AIFeedbackTabProps {
  isLoading: boolean;
  feedback: string | null;
}

export const AIFeedbackTab: React.FC<AIFeedbackTabProps> = ({
  isLoading,
  feedback,
}) => {
  return (
    <div className={styles.container}>
      {isLoading ? (
        <div className={styles.loadingIndicator}>
          <p>Loading AI Feedback...</p>
          {/* You can add a spinner or progress bar here */}
        </div>
      ) : (
        <div className={styles.feedbackDisplay}>
          <h3>AI Feedback</h3>
          <div className={styles.feedbackContent}>
            {feedback || 'No feedback available.'}
          </div>
        </div>
      )}
    </div>
  );
}; 