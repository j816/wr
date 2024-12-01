import { Panel } from '../components/Panel';
import { PANEL_CONFIG } from '../config/panelConfig';
import { Subfolder } from '../types/panels';

class AppRenderer {
  private panels: { [key: string]: Panel } = {};

  constructor() {
    // Ensure DOM is ready before initialization
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  }

  private async initialize() {
    console.log('Initializing AppRenderer');
    await this.initializePanels();
    this.initializeEventListeners();
    console.log('AppRenderer initialization complete');
  }

  private async initializePanels() {
    console.log('Initializing panels');
    for (const [id, config] of Object.entries(PANEL_CONFIG)) {
      try {
        this.panels[id] = new Panel(id, config, (state) => {
          console.log(`Panel ${id} state changed:`, state);
          window.electronAPI.panels.saveState(id, state).catch(console.error);
        });
      } catch (error) {
        console.error(`Failed to initialize panel ${id}:`, error);
      }
    }
  }

  private initializeEventListeners() {
    console.log('Initializing event listeners');
    
    // Writing Prompts
    const selectPromptBtn = document.getElementById('select-prompt-folder');
    if (selectPromptBtn) {
      selectPromptBtn.addEventListener('click', () => this.handleSelectPromptFolder());
    } else {
      console.error('select-prompt-folder button not found');
    }

    // AI Assistant
    const aiAssistantBtn = document.getElementById('ai-assistant-send');
    if (aiAssistantBtn) {
      aiAssistantBtn.addEventListener('click', () => this.handleAIAssistantSend());
    } else {
      console.error('ai-assistant-send button not found');
    }

    // Text Editor
    const textEditor = document.getElementById('text-editor') as HTMLTextAreaElement;
    if (textEditor) {
      textEditor.addEventListener('input', () => this.handleTextEditorInput());
    } else {
      console.error('text-editor not found');
    }

    // Submit for Feedback
    const submitFeedbackBtn = document.getElementById('submit-feedback');
    if (submitFeedbackBtn) {
      submitFeedbackBtn.addEventListener('click', () => this.handleSubmitFeedback());
    } else {
      console.error('submit-feedback button not found');
    }

    console.log('Event listeners initialized');
  }

  private async handleSelectPromptFolder() {
    try {
      const result = await window.electronAPI.fileSystem.selectDirectory('left');
      if (result) {
        // Update prompt folder display and load prompts
        this.updatePromptFolderDisplay(result);
      }
    } catch (error) {
      console.error('Error selecting prompt folder:', error);
      // Show error message to user
    }
  }

  private async handleAIAssistantSend() {
    const input = document.getElementById('ai-assistant-input') as HTMLTextAreaElement;
    if (!input?.value) return;

    try {
      const response = await window.electronAPI.sendAIRequest(input.value);
      this.updateAIAssistantChat(input.value, response);
      input.value = '';
    } catch (error) {
      console.error('Error sending AI request:', error);
      // Show error message to user
    }
  }

  private handleTextEditorInput() {
    const textEditor = document.getElementById('text-editor') as HTMLTextAreaElement;
    if (!textEditor) return;

    // Update word count
    const wordCount = textEditor.value.trim().split(/\s+/).length;
    const wordCountDisplay = document.getElementById('word-count');
    if (wordCountDisplay) {
      wordCountDisplay.textContent = `Words: ${wordCount}`;
    }

    // Trigger auto-save
    window.electronAPI.autoSave.start();
  }

  private async handleSubmitFeedback() {
    try {
      const textEditor = document.getElementById('text-editor') as HTMLTextAreaElement;
      const promptDisplay = document.getElementById('current-writing-prompt');
      const criteriaDisplay = document.getElementById('criteria-display');

      if (!textEditor?.value || !promptDisplay?.textContent || !criteriaDisplay?.textContent) {
        throw new Error('Missing required content for feedback');
      }

      // Show loading state
      this.setFeedbackLoading(true);

      // Get AI feedback
      const feedback = await window.electronAPI.sendAIRequest({
        prompt: promptDisplay.textContent,
        submission: textEditor.value,
        criteria: criteriaDisplay.textContent
      });

      // Display feedback
      this.updateFeedbackDisplay(feedback);
    } catch (error) {
      console.error('Error submitting for feedback:', error);
      // Show error message to user
    } finally {
      this.setFeedbackLoading(false);
    }
  }

  private updatePromptFolderDisplay(result: { directoryPath: string; contents: string[] }) {
    const display = document.getElementById('prompt-folder-display');
    if (display) {
      display.textContent = result.directoryPath;
    }

    // Update prompts dropdown
    const dropdown = document.getElementById('prompt-folders') as HTMLSelectElement;
    if (dropdown) {
      dropdown.innerHTML = '';
      result.contents.forEach(folder => {
        const option = document.createElement('option');
        option.value = folder;
        option.textContent = folder;
        dropdown.appendChild(option);
      });
    }
  }

  private updateAIAssistantChat(userMessage: string, aiResponse: string) {
    const chatDisplay = document.getElementById('ai-assistant-chat');
    if (!chatDisplay) return;

    const userDiv = document.createElement('div');
    userDiv.className = 'chat-message user-message';
    userDiv.textContent = userMessage;

    const aiDiv = document.createElement('div');
    aiDiv.className = 'chat-message ai-message';
    aiDiv.textContent = aiResponse;

    chatDisplay.appendChild(userDiv);
    chatDisplay.appendChild(aiDiv);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
  }

  private setFeedbackLoading(loading: boolean) {
    const submitButton = document.getElementById('submit-feedback') as HTMLButtonElement;
    const loadingIndicator = document.getElementById('feedback-loading');

    if (submitButton) {
      submitButton.disabled = loading;
    }
    if (loadingIndicator) {
      loadingIndicator.style.display = loading ? 'block' : 'none';
    }
  }

  private updateFeedbackDisplay(feedback: string) {
    const feedbackDisplay = document.getElementById('ai-feedback-display');
    if (feedbackDisplay) {
      feedbackDisplay.innerHTML = feedback;
    }
  }

  private async initializeSubfolderDropdown() {
    const dropdown = document.getElementById('subfolder-dropdown') as HTMLSelectElement;
    if (!dropdown) return;

    dropdown.innerHTML = '';

    try {
      const storedFolders = await window.electronAPI.settings.getStoredFolders();
      const selectedFolder = storedFolders['left'];
      if (!selectedFolder) return;

      const subfolders = await window.electronAPI.fileSystem.getSubfolders(selectedFolder);
      
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Select a category...';
      dropdown.appendChild(defaultOption);

      subfolders.forEach((subfolder: { name: string; path: string }) => {
        const option = document.createElement('option');
        option.value = subfolder.path;
        option.textContent = subfolder.name;
        dropdown.appendChild(option);
      });

      const lastSelectedFolder = storedFolders['lastSelectedSubfolder'];
      if (lastSelectedFolder) {
        dropdown.value = lastSelectedFolder;
        await this.handleSubfolderChange(lastSelectedFolder);
      }
    } catch (error) {
      console.error('Error initializing subfolder dropdown:', error);
    }
  }

  private async handleSubfolderChange(folderPath: string) {
    try {
      await window.electronAPI.fileSystem.selectDirectory(folderPath);
      await this.updatePromptDisplay();
    } catch (error) {
      console.error('Error handling subfolder change:', error);
    }
  }

  private async updatePromptDisplay() {
    const dropdown = document.getElementById('subfolder-dropdown') as HTMLSelectElement;
    if (!dropdown?.value) return;

    try {
      const result = await window.electronAPI.fileSystem.selectDirectory(dropdown.value);
      const files = result?.contents || [];
      
      const promptDisplay = document.getElementById('prompt-display');
      if (promptDisplay) {
        promptDisplay.innerHTML = files.map((file: string) => `<div>${file}</div>`).join('');
      }
    } catch (error) {
      console.error('Error updating prompt display:', error);
    }
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AppRenderer();
}); 