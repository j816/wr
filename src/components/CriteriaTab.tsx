import React, { useState } from 'react';
import styles from './CriteriaTab.module.css';

export const CriteriaTab: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [criteriaSets, setCriteriaSets] = useState<string[]>([]);
  const [selectedCriteriaSet, setSelectedCriteriaSet] = useState('');
  const [criteriaContent, setCriteriaContent] = useState('');

  const handleSelectCriteriaFolder = async () => {
    try {
      const folderPath = await window.electronAPI.selectCriteriaFolder();
      if (folderPath) {
        // Load categories from the selected folder
        // Update state accordingly
      }
    } catch (error) {
      console.error('Error selecting criteria folder:', error);
      alert('An error occurred while selecting the criteria folder.');
    }
  };

  const handleRefreshCriteriaFolder = async () => {
    try {
      // Refresh categories and criteria sets
    } catch (error) {
      console.error('Error refreshing criteria folder:', error);
      alert('An error occurred while refreshing the criteria folder.');
    }
  };

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    // Load criteria sets for the selected category
  };

  const handleCriteriaSetChange = async (criteriaSet: string) => {
    setSelectedCriteriaSet(criteriaSet);
    if (criteriaSet) {
      const content = await window.electronAPI.readCriteriaFile(criteriaSet);
      setCriteriaContent(content);
    } else {
      setCriteriaContent('');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.buttons}>
        <button onClick={handleSelectCriteriaFolder}>Select Criteria Folder</button>
        <button onClick={handleRefreshCriteriaFolder}>Refresh</button>
      </div>
      <div className={styles.dropdownGroup}>
        <label>Category:</label>
        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          {/* Populate options from categories state */}
          <option value="">Select a Category</option>
        </select>
      </div>
      <div className={styles.dropdownGroup}>
        <label>Criteria Set:</label>
        <select
          value={selectedCriteriaSet}
          onChange={(e) => handleCriteriaSetChange(e.target.value)}
        >
          <option value="">Select Criteria Set</option>
          {criteriaSets.map((set) => (
            <option key={set} value={set}>
              {set}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.criteriaDisplay}>
        <h3>Criteria Content</h3>
        <div>{criteriaContent}</div>
      </div>
    </div>
  );
}; 