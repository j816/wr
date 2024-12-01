const { ipcRenderer } = require('electron');

class SettingsTab {
  constructor() {
    this.apiKeyInput = document.getElementById('openai-api-key-input');
    this.submitButton = document.getElementById('api-key-submit-button');

    this.submitButton.addEventListener('click', () => this.handleApiKeySubmit());

    this.loadApiKeyStatus();
  }

  async handleApiKeySubmit() {
    const apiKey = this.apiKeyInput.value.trim();
    if (apiKey) {
      const result = await ipcRenderer.invoke('save-api-key', apiKey);
      if (result.success) {
        alert('API Key saved successfully.');
      } else {
        alert('Failed to save API Key.');
      }
    } else {
      alert('Please enter a valid API Key.');
    }
  }

  async loadApiKeyStatus() {
    const result = await ipcRenderer.invoke('get-api-key');
    if (result.hasKey) {
      this.apiKeyInput.value = '*******';
    }
  }
}

module.exports = SettingsTab; 