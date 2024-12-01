import React from 'react';
import './LoadingIndicator.css';

interface LoadingIndicatorProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  size = 'medium',
  message
}) => {
  return (
    <div className={`loading-indicator ${size}`}>
      <div className="spinner"></div>
      {message && <div className="loading-message">{message}</div>}
    </div>
  );
}; 