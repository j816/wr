const { ipcRenderer } = require('electron');
const path = require('path');

class CriteriaTab {
  constructor() {
    this.selectFolderButton = document.getElementById('select-criteria-folder');
    this.refreshButton = document.getElementById('refresh-criteria-folder');
    this.categoryDropdown = document.getElementById('criteria-category-dropdown');
    this.criteriaSetDropdown = document.getElementById('criteria-set-dropdown');
    this.fileDisplay = document.getElementById('criteria-file-display');

    this.selectFolderButton.addEventListener('click', () => this.handleSelectFolder());
    this.refreshButton.addEventListener('click', () => this.refreshCategories());
    this.categoryDropdown.addEventListener('change', () => this.handleCategoryChange());
    this.criteriaSetDropdown.addEventListener('change', () => this.handleCriteriaSetChange());

    this.selectedFolder = null;
    this.categories = [];
    this.criteriaSets = [];
    this.criteriaContent = '';
  }

  async handleSelectFolder() {
    const folderPath = await ipcRenderer.invoke('select-directory', 'right');
    if (folderPath) {
      this.selectedFolder = folderPath;
      await ipcRenderer.invoke('set-stored-folder', 'criteria', folderPath);
      await this.refreshCategories();
    }
  }

  async refreshCategories() {
    if (!this.selectedFolder) return;
    const subfolders = await ipcRenderer.invoke(
      'get-subfolders',
      this.selectedFolder,
      ['.DS_Store', 'Thumbs.db']
    );
    this.categories = subfolders.sort();
    this.populateCategoryDropdown();
  }

  populateCategoryDropdown() {
    this.categoryDropdown.innerHTML = '<option value="">Select Category</option>';
    this.categories.forEach((category) => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      this.categoryDropdown.appendChild(option);
    });
  }

  async handleCategoryChange() {
    const category = this.categoryDropdown.value;
    if (category) {
      const categoryPath = path.join(this.selectedFolder, category);
      const files = await ipcRenderer.invoke(
        'get-files',
        categoryPath,
        ['.txt', '.md', '.json'],
        ['.DS_Store', 'Thumbs.db']
      );
      this.criteriaSets = files.sort();
      this.populateCriteriaSetDropdown();
    } else {
      this.criteriaSets = [];
      this.populateCriteriaSetDropdown();
    }
  }

  populateCriteriaSetDropdown() {
    this.criteriaSetDropdown.innerHTML = '<option value="">Select Criteria Set</option>';
    this.criteriaSets.forEach((criteriaFile) => {
      const option = document.createElement('option');
      option.value = criteriaFile;
      option.textContent = criteriaFile;
      this.criteriaSetDropdown.appendChild(option);
    });
  }

  async handleCriteriaSetChange() {
    const criteriaFile = this.criteriaSetDropdown.value;
    if (criteriaFile) {
      const category = this.categoryDropdown.value;
      const filePath = path.join(this.selectedFolder, category, criteriaFile);
      const content = await ipcRenderer.invoke('read-file', filePath);
      this.criteriaContent = content;
      this.fileDisplay.textContent = content;
    } else {
      this.criteriaContent = '';
      this.fileDisplay.textContent = '';
    }
  }
}

module.exports = CriteriaTab; 