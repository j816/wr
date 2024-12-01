const { ipcRenderer } = require('electron');
const path = require('path');

class AIAssistantTab {
  constructor() {
    this.chatHistory = [];
    this.chatDisplay = document.getElementById('ai-assistant-chat-display');
    this.inputBox = document.getElementById('ai-assistant-input');
    this.sendButton = document.getElementById('ai-assistant-send-button');
    this.clearButton = document.getElementById('ai-assistant-clear-button');

    this.sendButton.addEventListener('click', () => this.handleSend());
    this.clearButton.addEventListener('click', () => this.clearChat());

    this.loadChatHistory();
  }

  async handleSend() {
    const messageContent = this.inputBox.value.trim();
    if (!messageContent) return;

    const userMessage = { role: 'user', content: messageContent };
    this.chatHistory.push(userMessage);
    this.updateChatDisplay();

    // Clear input box
    this.inputBox.value = '';

    // Send AI request
    const response = await ipcRenderer.invoke('ai-request', this.chatHistory);
    if (response.success) {
      const assistantMessage = { role: 'assistant', content: response.content };
      this.chatHistory.push(assistantMessage);
      this.updateChatDisplay();
      await this.saveChatHistory();
    } else {
      console.error('AI Assistant Error:', response.error);
    }
  }

  updateChatDisplay() {
    this.chatDisplay.innerHTML = '';
    for (const message of this.chatHistory) {
      const messageElement = document.createElement('div');
      messageElement.classList.add('chat-message', `${message.role}-message`);

      const contentElement = document.createElement('p');
      contentElement.textContent = message.content;
      messageElement.appendChild(contentElement);

      this.chatDisplay.appendChild(messageElement);
    }

    // Scroll to bottom
    this.chatDisplay.scrollTop = this.chatDisplay.scrollHeight;
  }

  async saveChatHistory() {
    await ipcRenderer.invoke('chat-history-save', this.chatHistory);
  }

  async loadChatHistory() {
    const history = await ipcRenderer.invoke('chat-history-load');
    if (history) {
      this.chatHistory = history;
      this.updateChatDisplay();
    }
  }

  async clearChat() {
    this.chatHistory = [];
    this.updateChatDisplay();
    await ipcRenderer.invoke('chat-history-clear');
  }
}

module.exports = AIAssistantTab; 