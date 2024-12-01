import React, { useState, useEffect } from 'react';
import styles from './MiddlePanel.module.css';
import { ContentCombinerService } from '../services/ContentCombinerService';

export const MiddlePanel: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [wordCount, setWordCount] = useState<number>(0);
  const [saveLocation, setSaveLocation] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load auto-saved content on mount
  useEffect(() => {
    async function loadAutoSavedContent() {
      try {
        const savedContent = await window.electronAPI.autoSave.getLatest();
        if (savedContent) {
          const restore = window.confirm('Unsaved content detected. Do you want to restore it?');
          if (restore) {
            setContent(savedContent);
            setWordCount(calculateWordCount(savedContent));
          }
        }
      } catch (error) {
        console.error('Error loading auto-saved content:', error);
      }
    }
    loadAutoSavedContent();
  }, []);

  // Auto-save content every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      window.electronAPI.autoSave.save(content);
    }, 30000);

    return () => {
      clearInterval(autoSaveInterval);
      window.electronAPI.autoSave.clear();
    };
  }, [content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setContent(newText);
    setWordCount(calculateWordCount(newText));
  };

  const calculateWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter((word) => word.length > 0).length;
  };

  const handleSubmitForFeedback = async () => {
    if (!content.trim()) {
      alert('Please write something before submitting for feedback.');
      return;
    }
    setIsSubmitting(true);
    try {
      // Get the content from other panels
      const promptContent = document.getElementById('current-writing-prompt')?.textContent || '';
      const criteriaContent = document.getElementById('criteria-display')?.textContent || '';

      // Combine the contents
      const combinedContent = ContentCombinerService.combineContent(
        promptContent,
        content,
        criteriaContent
      );

      // Send AI request
      const feedback = await window.electronAPI.sendAIRequest([
        { role: 'user', content: combinedContent },
      ]);

      // Dispatch event to update AI Feedback Tab
      window.dispatchEvent(new CustomEvent('ai-feedback', { detail: feedback }));
    } catch (error) {
      console.error('Error submitting for feedback:', error);
      alert('Failed to get feedback from AI.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      const fileName = `${timestamp}_Writing.txt`;
      const filePath = `${saveLocation}/${fileName}`;
      await window.electronAPI.fileSystem.writeFile(filePath, content);
      alert('Writing saved successfully.');
    } catch (error) {
      console.error('Error saving writing:', error);
      alert('Failed to save writing.');
    }
  };

  const handleSelectSaveLocation = async () => {
    try {
      const selectedPath = await window.electronAPI.fileSystem.selectDirectory('save');
      if (selectedPath) {
        setSaveLocation(selectedPath);
      } else {
        alert('Save location not selected.');
      }
    } catch (error) {
      console.error('Error selecting save location:', error);
    }
  };

  const handleClear = () => {
    if (content.trim() && window.confirm('Are you sure you want to clear your writing?')) {
      setContent('');
      setWordCount(0);
      window.electronAPI.autoSave.clear();
    }
  };

  return (
    <div className={styles.middlePanel}>
      <h2 className={styles.title}>Scribblings</h2>
      <textarea
        id="text-editor"
        className={styles.textEditor}
        value={content}
        onChange={handleContentChange}
        placeholder="Start writing here..."
      />
      <div className={styles.wordCount}>Word Count: {wordCount}</div>
      <div className={styles.buttonContainer}>
        <button onClick={handleSubmitForFeedback} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit for Feedback'}
        </button>
        <button onClick={handleSaveWriting}>Save Writing</button>
        <button onClick={handleSelectSaveLocation}>Select Save Location</button>
        <button onClick={handleClear}>Clear</button>
      </div>
    </div>
  );
}; 