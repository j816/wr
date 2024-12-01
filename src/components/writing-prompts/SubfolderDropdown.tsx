import React, { useState, useEffect } from 'react';
import { Dropdown } from '../common/Dropdown';
import { NotificationService } from '../../services/NotificationService';

interface SubfolderDropdownProps {
  selectedFolder: string;
  onSubfolderChange: (subfolder: string) => void;
}

export const SubfolderDropdown: React.FC<SubfolderDropdownProps> = ({
  selectedFolder,
  onSubfolderChange
}) => {
  const [subfolders, setSubfolders] = useState<string[]>([]);
  const [selectedSubfolder, setSelectedSubfolder] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedFolder) {
      void refreshSubfolders();
    }
  }, [selectedFolder]);

  const refreshSubfolders = async () => {
    setLoading(true);
    try {
      const folders = await window.electronAPI.fileSystem.getSubfolders(selectedFolder);
      setSubfolders(folders);

      // Get the previously selected subfolder if it exists
      const savedSubfolder = await window.electronAPI.prompts.getSelectedSubfolder();
      if (savedSubfolder && folders.includes(savedSubfolder)) {
        setSelectedSubfolder(savedSubfolder);
        onSubfolderChange(savedSubfolder);
      }
    } catch (error) {
      console.error('Error refreshing subfolders:', error);
      NotificationService.showError('Failed to load subfolders');
    } finally {
      setLoading(false);
    }
  };

  const handleSubfolderChange = async (value: string) => {
    setSelectedSubfolder(value);
    try {
      await window.electronAPI.prompts.setSelectedSubfolder(value);
      onSubfolderChange(value);
    } catch (error) {
      console.error('Error setting selected subfolder:', error);
      NotificationService.showError('Failed to set selected subfolder');
    }
  };

  return (
    <Dropdown
      value={selectedSubfolder}
      onChange={handleSubfolderChange}
      options={subfolders.map(folder => ({
        value: folder,
        label: folder
      }))}
      placeholder="Select a subfolder"
      disabled={loading || !selectedFolder}
    />
  );
}; 