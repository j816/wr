import React, { useEffect, useRef, useState } from 'react';
import styles from './TextEditor.module.css';
import { useAutoSave } from '../hooks/useAutoSave';
import { useWordCount } from '../hooks/useWordCount';

interface TextEditorProps {
  onContentChange?: (content: string) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({ onContentChange }) => {
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const { wordCount } = useWordCount(content);
  const { saveStatus, error: saveError } = useAutoSave(content);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    setContent(newContent);
    onContentChange?.(newContent);
    // Clear any previous errors when user starts typing
    if (error) setError(null);
  };

  useEffect(() => {
    // Check for unsaved work on component mount
    window.electronAPI.checkUnsavedWork()
      .then((unsavedContent: string | null) => {
        if (unsavedContent) {
          const restore = window.confirm('Unsaved work found. Would you like to restore it?');
          if (restore) {
            setContent(unsavedContent);
          }
        }
      })
      .catch((err: Error) => {
        setError('Failed to check for unsaved work. Please try saving your work manually.');
        console.error('Error checking unsaved work:', err);
      });
  }, []);

  // Update error state when save error occurs
  useEffect(() => {
    if (saveError) {
      setError(saveError);
    }
  }, [saveError]);

  return (
    <div className={styles.editorContainer}>
      <div className={styles.editorHeader}>
        <h2>Scribblings</h2>
        <span className={`${styles.saveStatus} ${error ? styles.error : ''}`}>
          {error || saveStatus}
        </span>
      </div>
      <textarea
        ref={editorRef}
        className={styles.editor}
        value={content}
        onChange={handleChange}
        placeholder="Start writing here..."
      />
      <div className={styles.editorFooter}>
        <span className={styles.wordCount}>Words: {wordCount}</span>
      </div>
    </div>
  );
}; 