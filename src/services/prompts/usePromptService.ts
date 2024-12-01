import { useState, useEffect } from 'react';
import { NotificationService } from '../NotificationService';

interface UsePromptService {
  selectedFolder: string | null;
  setSelectedFolder: (folder: string) => void;
  refreshPrompts: () => Promise<void>;
  loading: boolean;
}

export const usePromptService = (): UsePromptService => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void loadLastSelectedFolder();
  }, []);

  const loadLastSelectedFolder = async () => {
    try {
      const folders = await window.electronAPI.settings.getStoredFolders();
      if (folders.prompts) {
        setSelectedFolder(folders.prompts);
      }
    } catch (error) {
      console.error('Error loading last selected folder:', error);
    }
  };

  const refreshPrompts = async () => {
    if (!selectedFolder) return;
    
    setLoading(true);
    try {
      await window.electronAPI.fileSystem.getPrompts(selectedFolder, 'prompts');
    } catch (error) {
      console.error('Error refreshing prompts:', error);
      NotificationService.showError('Failed to refresh prompts');
    } finally {
      setLoading(false);
    }
  };

  return {
    selectedFolder,
    setSelectedFolder,
    refreshPrompts,
    loading
  };
}; 