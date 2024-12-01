import React, { useState, useEffect } from 'react';
import styles from './CriteriaTab.module.css';

export const CriteriaTab: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [criteriaSets, setCriteriaSets] = useState<string[]>([]);
  const [selectedCriteriaSet, setSelectedCriteriaSet] = useState('');
  const [criteriaContent, setCriteriaContent] = useState('');
  const [criteriaFolder, setCriteriaFolder] = useState<string | null>(null);

  const handleSelectCriteriaFolder = async () => {
    try {
      const folderPath = await window.electronAPI.fileSystem.selectDirectory('criteria');
      if (folderPath) {
        setCriteriaFolder(folderPath);
        refreshCategories(folderPath);
      }
    } catch (error) {
      console.error('Error selecting criteria folder:', error);
      alert('An error occurred while selecting the criteria folder.');
    }
  };

  const refreshCategories = async (folderPath: string) => {
    try {
      const subfolders = await window.electronAPI.fileSystem.getSubfolders(folderPath);
      setCategories(subfolders);
    } catch (error) {
      console.error('Error refreshing categories:', error);
    }
  };

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    setSelectedCriteriaSet('');
    setCriteriaContent('');
    if (criteriaFolder) {
      const categoryPath = `${criteriaFolder}/${category}`;
      const files = await window.electronAPI.fileSystem.getFiles(categoryPath, ['txt', 'md', 'json']);
      setCriteriaSets(files);
    }
  };

  const handleCriteriaSetChange = async (criteriaFile: string) => {
    setSelectedCriteriaSet(criteriaFile);
    if (criteriaFolder && selectedCategory) {
      const filePath = `${criteriaFolder}/${selectedCategory}/${criteriaFile}`;
      try {
        const content = await window.electronAPI.fileSystem.readFile(filePath);
        setCriteriaContent(content);
        // Update the evaluation criteria display
        const criteriaDisplay = document.getElementById('criteria-display');
        if (criteriaDisplay) {
          criteriaDisplay.textContent = content;
        }
      } catch (error) {
        console.error('Error reading criteria file:', error);
      }
    }
  };

  const handleRefresh = () => {
    if (criteriaFolder) {
      refreshCategories(criteriaFolder);
      setSelectedCategory('');
      setSelectedCriteriaSet('');
      setCriteriaContent('');
    }
  };

  return (
    <div className={styles.container}>
      <button onClick={handleSelectCriteriaFolder}>Select Criteria Folder</button>
      {criteriaFolder && (
        <>
          <button onClick={handleRefresh}>Refresh</button>
          <div className={styles.dropdownContainer}>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="">Select Category</option>
              {categories.sort().map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {criteriaSets.length > 0 && (
              <select
                value={selectedCriteriaSet}
                onChange={(e) => handleCriteriaSetChange(e.target.value)}
              >
                <option value="">Select Criteria Set</option>
                {criteriaSets.sort().map((criteria) => (
                  <option key={criteria} value={criteria}>
                    {criteria}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div id="criteria-display" className={styles.criteriaDisplay}>
            <pre>{criteriaContent}</pre>
          </div>
        </>
      )}
    </div>
  );
}; 