import React, { useState } from 'react';
import { Dropdown } from './common/Dropdown';
import { Button } from './common/Button';
import { NotificationService } from '../services/NotificationService';
import styles from './Criteria.module.css';

interface CriteriaProps {
  selectedFolder: string | null;
  onFolderSelect: () => Promise<void>;
  onCriteriaChange: (criteria: string) => void;
}

export const Criteria: React.FC<CriteriaProps> = ({
  selectedFolder,
  onFolderSelect,
  onCriteriaChange
}) => {
  const [selectedCriteria, setSelectedCriteria] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFolderSelect = async () => {
    setIsLoading(true);
    try {
      await onFolderSelect();
      NotificationService.success('Folder selected', 'Criteria folder has been selected successfully');
    } catch (error) {
      NotificationService.error('Error', 'Failed to select criteria folder');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCriteriaChange = (value: string) => {
    setSelectedCriteria(value);
    onCriteriaChange(value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Writing Criteria</h3>
        <Button
          onClick={handleFolderSelect}
          disabled={isLoading}
          variant="secondary"
          size="small"
        >
          Select Folder
        </Button>
      </div>
      {selectedFolder && (
        <Dropdown
          value={selectedCriteria}
          onChange={handleCriteriaChange}
          options={[
            { value: 'basic', label: 'Basic Feedback' },
            { value: 'detailed', label: 'Detailed Analysis' },
            { value: 'advanced', label: 'Advanced Critique' }
          ]}
          placeholder="Select criteria level"
          disabled={isLoading}
        />
      )}
    </div>
  );
}; 