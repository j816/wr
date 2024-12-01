import React, { useState, useEffect } from 'react';

// Text Editor Component
export function TextEditor({ onContentChange }) {
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);

  // Load latest auto-saved content on component mount
  useEffect(() => {
    async function loadAutoSave() {
      try {
        const lastSaved = await window.electronAPI.autoSave.getLatest();
        if (lastSaved) {
          const shouldRestore = window.confirm('Unsaved work detected. Do you want to restore it?');
          if (shouldRestore) {
            setContent(lastSaved);
            setWordCount(calculateWordCount(lastSaved));
          }
        }
      } catch (error) {
        console.error('Failed to load auto-saved content:', error);
      }
    }
    loadAutoSave();
  }, []);

  // Auto-save content every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      window.electronAPI.autoSave.start(content);
    }, 30000); // 30 seconds

    return () => {
      clearInterval(intervalId);
      window.electronAPI.autoSave.stop();
    };
  }, [content]);

  // Handle content change
  const handleChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    setWordCount(calculateWordCount(newContent));
    onContentChange(newContent);
  };

  // Calculate word count
  const calculateWordCount = (text) => {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  };

  return (
    <div className="text-editor-container">
      <textarea
        id="text-editor"
        value={content}
        onChange={handleChange}
        placeholder="Start writing..."
      />
      <div className="word-count">Word Count: {wordCount}</div>
    </div>
  );
} 