import React, { useState } from 'react';
import styles from './EditorButtons.module.css';
import { ContentCombinerService } from '../services/ContentCombinerService';

interface EditorButtonsProps {
  content: string;
  currentPromptContent: string;
  evaluationCriteriaContent: string;
  onClear: () => void;
  onSubmitForFeedback: (feedback: string) => void;
}

export const EditorButtons: React.FC<EditorButtonsProps> = ({
  content,
  currentPromptContent,
  evaluationCriteriaContent,
  onClear,
  onSubmitForFeedback,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveLocation, setSaveLocation] = useState<string>('');
  const [actionStatus, setActionStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [savePath, setSavePath] = useState<string | null>(null);

  const showStatus = (type: 'success' | 'error', message: string) => {
    setActionStatus({ type, message });
    setTimeout(() => setActionStatus(null), 3000);
  };

  const handleSelectSaveLocation = async () => {
    try {
      const location = await window.electronAPI.selectSaveLocation();
      if (location) {
        setSaveLocation(location);
        showStatus('success', 'Save location selected');
      }
    } catch (error) {
      showStatus('error', 'Failed to select save location');
      console.error('Failed to select save location:', error);
    }
  };

  const handleSaveWriting = async () => {
    try {
      if (!savePath) {
        alert('Please select a save location first.');
        return;
      }
      const success = await window.electronAPI.saveWriting(content, savePath);
      if (success) {
        alert('Writing saved successfully.');
      } else {
        alert('Failed to save writing.');
      }
    } catch (error) {
      console.error('Error saving writing:', error);
      alert('An error occurred while saving your writing.');
    }
  };

  const handleClear = () => {
    if (content.trim() && window.confirm('Are you sure you want to clear your writing?')) {
      onClear();
      showStatus('success', 'Content cleared');
    }
  };

  const handleSubmitForFeedback = async () => {
    try {
      setIsSubmitting(true);

      const concatenatedContent = ContentCombinerService.combineContent(
        currentPromptContent,
        content,
        evaluationCriteriaContent
      );

      const messages = [{ role: 'user', content: concatenatedContent }];

      const feedback = await window.electronAPI.sendAIRequest(messages);
      await onSubmitForFeedback(feedback);
      showStatus('success', 'Feedback received');
    } catch (error) {
      console.error('Error during AI feedback request:', error);
      showStatus('error', 'Failed to get feedback from AI.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.buttonContainer}>
      {actionStatus && (
        <div className={`${styles.statusMessage} ${styles[actionStatus.type]}`}>
          {actionStatus.message}
        </div>
      )}
      <button
        className={`${styles.button} ${styles.submitButton}`}
        onClick={handleSubmitForFeedback}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit for Feedback'}
      </button>
      <button
        className={`${styles.button} ${styles.saveButton}`}
        onClick={handleSaveWriting}
      >
        Save Writing
      </button>
      <button
        className={`${styles.button} ${styles.locationButton}`}
        onClick={handleSelectSaveLocation}
      >
        Select Save Location
      </button>
      <button
        className={`${styles.button} ${styles.clearButton}`}
        onClick={handleClear}
      >
        Clear
      </button>
    </div>
  );
}; 