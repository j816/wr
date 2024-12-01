import React, { useEffect, useState } from 'react';
import { SubfolderDropdown } from './SubfolderDropdown';
import { PromptDisplay } from './PromptDisplay';
import { CurrentPromptDisplay } from './CurrentPromptDisplay';
import { usePromptService } from '../../services/prompts/usePromptService';
import { NotificationService } from '../../services/NotificationService';
import styles from './WritingPromptsTab.module.css';

export const WritingPromptsTab: React.FC = () => {
  const [selectedSubfolder, setSelectedSubfolder] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [randomPrompt, setRandomPrompt] = useState('');
  const [totalPrompts, setTotalPrompts] = useState(0);
  const {
    selectedFolder,
    setSelectedFolder,
    loading,
    refreshPrompts
  } = usePromptService();

  useEffect(() => {
    void loadInitialFolder();
  }, []);

  const loadInitialFolder = async () => {
    try {
      const folders = await window.electronAPI.settings.getStoredFolders();
      if (folders.prompts) {
        setSelectedFolder(folders.prompts);
      }
    } catch (error) {
      console.error('Error loading initial folder:', error);
      NotificationService.error('Failed to load prompts folder');
    }
  };

  const handleFolderSelect = async () => {
    try {
      const result = await window.electronAPI.fileSystem.selectDirectory('prompts');
      if (result) {
        await window.electronAPI.settings.setStoredFolder('prompts', result.directoryPath);
        setSelectedFolder(result.directoryPath);
        setRandomPrompt('');
        setTotalPrompts(0);
        NotificationService.success('Prompt folder selected successfully');
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
      NotificationService.error('Failed to select prompts folder');
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshPrompts();
      setRandomPrompt('');
      setTotalPrompts(0);
      NotificationService.success('Prompts refreshed successfully');
    } catch (error) {
      console.error('Error refreshing prompts:', error);
      NotificationService.error('Failed to refresh prompts');
    }
  };

  const handleGetNewPrompt = async () => {
    if (!selectedSubfolder) {
      NotificationService.warning('Please select a category first');
      return;
    }

    try {
      const result = await window.electronAPI.prompts.getNewPrompt(selectedSubfolder);
      if (result) {
        setRandomPrompt(result.content);
        setTotalPrompts(result.viewed);
        NotificationService.success('New prompt loaded');
      } else {
        NotificationService.info('No more prompts available in this category');
      }
    } catch (error) {
      console.error('Error getting new prompt:', error);
      NotificationService.error('Failed to get new prompt');
    }
  };

  const handleUsePrompt = () => {
    if (!randomPrompt) {
      NotificationService.warning('Please get a prompt first');
      return;
    }
    setCurrentPrompt(randomPrompt);
    NotificationService.success('Prompt set as current');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Writing Prompts</h2>
        <div className={styles.headerButtons}>
          <button 
            onClick={handleFolderSelect} 
            disabled={loading}
            className={styles.button}
          >
            Select Folder
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading || !selectedFolder}
            className={styles.button}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className={styles.controls}>
        {selectedFolder && (
          <>
            <SubfolderDropdown
              selectedFolder={selectedFolder}
              onSubfolderChange={setSelectedSubfolder}
            />
            <button 
              onClick={handleGetNewPrompt} 
              disabled={loading || !selectedSubfolder}
              className={styles.button}
            >
              Get New Prompt
            </button>
          </>
        )}
      </div>

      <PromptDisplay
        prompt={randomPrompt}
        isLoading={loading}
        totalPrompts={totalPrompts}
      />

      {randomPrompt && (
        <div className={styles.usePromptContainer}>
          <button
            onClick={handleUsePrompt}
            className={styles.usePromptButton}
            disabled={loading}
          >
            Use This Prompt
          </button>
        </div>
      )}

      <CurrentPromptDisplay prompt={currentPrompt} />
    </div>
  );
}; 