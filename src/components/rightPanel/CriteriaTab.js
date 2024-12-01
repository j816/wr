import React, { useState, useEffect } from 'react';

function CriteriaTab() {
  const [criteriaFolder, setCriteriaFolder] = useState(null);
  const [categories, setCategories] = useState([]);
  const [criteriaSets, setCriteriaSets] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCriteriaSet, setSelectedCriteriaSet] = useState('');
  const [criteriaContent, setCriteriaContent] = useState('');

  const handleSelectCriteriaFolder = async () => {
    try {
      const folderPath = await window.electronAPI.selectDirectory('right');
      if (folderPath) {
        setCriteriaFolder(folderPath);
        // Save the folder path in persistent storage if needed
        await refreshCategories(folderPath);
      }
    } catch (error) {
      console.error('Error selecting criteria folder:', error);
      alert('An error occurred while selecting the criteria folder.');
    }
  };

  const refreshCategories = async (folderPath) => {
    try {
      const subfolders = await window.electronAPI.getSubfolders(folderPath);
      setCategories(subfolders);
      setCriteriaSets([]);
      setSelectedCategory('');
      setSelectedCriteriaSet('');
      setCriteriaContent('');
    } catch (error) {
      console.error('Error refreshing criteria categories:', error);
      alert('Failed to load categories.');
    }
  };

  const handleCategoryChange = async (category) => {
    setSelectedCategory(category);
    if (criteriaFolder && category) {
      try {
        const files = await window.electronAPI.getFiles(
          `${criteriaFolder}/${category}`,
          ['txt', 'md', 'json']
        );
        setCriteriaSets(files);
        setSelectedCriteriaSet('');
        setCriteriaContent('');
      } catch (error) {
        console.error('Error loading criteria sets:', error);
        alert('Failed to load criteria sets.');
      }
    }
  };

  const handleCriteriaSetChange = async (criteriaFile) => {
    setSelectedCriteriaSet(criteriaFile);
    if (criteriaFolder && selectedCategory && criteriaFile) {
      const filePath = `${criteriaFolder}/${selectedCategory}/${criteriaFile}`;
      try {
        const content = await window.electronAPI.readFile(filePath);
        setCriteriaContent(content);
        // Update the evaluation criteria display
        const criteriaDisplay = document.getElementById('criteria-display');
        if (criteriaDisplay) {
          criteriaDisplay.textContent = content;
        }
      } catch (error) {
        console.error('Error reading criteria file:', error);
        alert('Failed to load criteria content.');
      }
    }
  };

  const handleRefreshCriteriaFolder = async () => {
    if (criteriaFolder) {
      await refreshCategories(criteriaFolder);
    }
  };

  return (
    <div className="criteria-tab">
      <button onClick={handleSelectCriteriaFolder}>Select Criteria Folder</button>
      {criteriaFolder && (
        <>
          <button onClick={handleRefreshCriteriaFolder}>Refresh</button>
          <div className="dropdown-container">
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
          <div id="criteria-display" className="criteria-display">
            <pre>{criteriaContent}</pre>
          </div>
        </>
      )}
    </div>
  );
}

export default CriteriaTab; 