import React, { useState } from 'react';
import { ContentCombinerService } from '../../services/ContentCombinerService';

// Editor Buttons Component
export function EditorButtons({
  content,
  currentPromptContent,
  evaluationCriteriaContent,
  onClear,
  onSubmitFeedback,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveLocation, setSaveLocation] = useState(null);

  // Handle Submit for Feedback
  const handleSubmitForFeedback = async () => {
    if (!content.trim()) {
      alert('Please write something before submitting for feedback.');
      return;
    }
    setIsSubmitting(true);
    try {
      const combinedContent = ContentCombinerService.combineContent(
        currentPromptContent,
        content,
        evaluationCriteriaContent
      );

      const aiResponse = await window.electronAPI.sendAIRequest([
        { role: 'user', content: combinedContent },
      ]);
      await onSubmitFeedback(aiResponse);
    } catch (error) {
      console.error('Error submitting for feedback:', error);
      alert('Failed to get feedback from AI.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Save Writing
  const handleSaveWriting = async () => {
    try {
      if (!saveLocation) {
        const selectedPath = await window.electronAPI.fileSystem.selectDirectory('save');
        if (selectedPath) {
          setSaveLocation(selectedPath);
        } else {
          alert('Save location not selected.');
          return;
        }
      }
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${timestamp}_WritingPrompts.txt`;
      const filePath = `${saveLocation}/${fileName}`;
      await window.electronAPI.fileSystem.writeFile(filePath, content);
      alert('Writing saved successfully.');
    } catch (error) {
      console.error('Error saving writing:', error);
      alert('Failed to save writing.');
    }
  };

  // Handle Select Save Location
  const handleSelectSaveLocation = async () => {
    try {
      const selectedPath = await window.electronAPI.fileSystem.selectDirectory('save');
      if (selectedPath) {
        setSaveLocation(selectedPath);
        alert('Save location selected.');
      } else {
        alert('No folder selected.');
      }
    } catch (error) {
      console.error('Error selecting save location:', error);
    }
  };

  // Handle Clear
  const handleClear = () => {
    const confirmClear = window.confirm('Are you sure you want to clear your writing?');
    if (confirmClear) {
      onClear();
    }
  };

  return (
    <div className="editor-buttons">
      <button onClick={handleSubmitForFeedback} disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit for Feedback'}
      </button>
      <button onClick={handleSaveWriting}>Save Writing</button>
      <button onClick={handleSelectSaveLocation}>Select Save Location</button>
      <button onClick={handleClear}>Clear</button>
    </div>
  );
} 