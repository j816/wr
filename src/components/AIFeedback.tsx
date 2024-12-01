import React from 'react';
import { CircularProgress } from './common/CircularProgress';
import { MarkdownRenderer } from './common/MarkdownRenderer';
import { useNotification } from '../hooks/useNotification';
import { AIFeedbackProps } from '../types/components';
import '../styles/AIFeedback.css';

export const AIFeedback: React.FC<AIFeedbackProps> = ({
  isLoading,
  feedback,
  error
}) => {
  const { showNotification } = useNotification();

  // Show error notification if there's an error
  React.useEffect(() => {
    if (error) {
      showNotification('error', 'Failed to get AI feedback', error);
    }
  }, [error, showNotification]);

  return (
    <div className="ai-feedback-container">
      <div className="ai-feedback-header">
        <h2>AI Feedback</h2>
      </div>
      
      <div className="ai-feedback-content">
        {isLoading ? (
          <div className="ai-feedback-loading">
            <CircularProgress />
            <p>Analyzing your writing...</p>
          </div>
        ) : feedback ? (
          <div className="ai-feedback-display">
            <MarkdownRenderer content={feedback} />
          </div>
        ) : (
          <div className="ai-feedback-empty">
            <p>Submit your writing for AI evaluation to receive feedback.</p>
          </div>
        )}
      </div>
    </div>
  );
}; 