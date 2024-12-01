import React, { useState } from 'react';

// AI Feedback Tab Component
export function AIFeedbackTab({ feedback, isLoading }) {
  return (
    <div className="ai-feedback-tab">
      {isLoading ? (
        <div className="loading-indicator">
          <p>Analyzing your writing...</p>
        </div>
      ) : feedback ? (
        <div className="feedback-display">
          <p>{feedback}</p>
        </div>
      ) : (
        <div className="feedback-placeholder">
          <p>Submit your writing for AI evaluation to receive feedback.</p>
        </div>
      )}
    </div>
  );
} 