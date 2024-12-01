function initResizablePanels() {
  const leftResizer = document.getElementById('leftResizer');
  const rightResizer = document.getElementById('rightResizer');
  const leftPanel = document.getElementById('leftPanel');
  const middlePanel = document.getElementById('middlePanel');
  const rightPanel = document.getElementById('rightPanel');

  let isResizingLeft = false;
  let isResizingRight = false;

  leftResizer.addEventListener('mousedown', () => {
    isResizingLeft = true;
    document.body.style.cursor = 'ew-resize';
  });

  rightResizer.addEventListener('mousedown', () => {
    isResizingRight = true;
    document.body.style.cursor = 'ew-resize';
  });

  document.addEventListener('mousemove', (e) => {
    if (isResizingLeft) {
      const newWidth = e.clientX;
      leftPanel.style.width = `${newWidth}px`;
    } else if (isResizingRight) {
      const containerWidth = document.body.clientWidth;
      const newWidth = containerWidth - e.clientX;
      rightPanel.style.width = `${newWidth}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    isResizingLeft = false;
    isResizingRight = false;
    document.body.style.cursor = 'default';
  });
}

function initLeftPanelTabs() {
  const tabButtons = document.querySelectorAll('#leftPanel .tab-btn');
  const tabContents = document.querySelectorAll('#leftPanel .tab-content');

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      // Remove 'active' class from all buttons and contents
      tabButtons.forEach((btn) => btn.classList.remove('active'));
      tabContents.forEach((content) => (content.style.display = 'none'));

      // Add 'active' class to clicked button and display corresponding content
      button.classList.add('active');
      document.getElementById(targetTab).style.display = 'block';
    });
  });
}

function handleUseThisPrompt() {
  const currentPromptElement = document.getElementById('current-writing-prompt');
  const randomPromptContent = /* Get content from random prompt display */;
  currentPromptElement.textContent = randomPromptContent;
}

const chatHistory = [];

function loadChatHistory() {
  // Load from storage if available
  const storedHistory = localStorage.getItem('chatHistory');
  if (storedHistory) {
    return JSON.parse(storedHistory);
  }
  return [];
}

function saveChatHistory() {
  localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

function renderChatMessage(message) {
  const chatDisplay = document.getElementById('chat-display');
  const messageElement = document.createElement('div');
  messageElement.classList.add('chat-message', message.role);
  messageElement.textContent = message.content;
  chatDisplay.appendChild(messageElement);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

function handleSendMessage() {
  const inputField = document.getElementById('ai-assistant-input');
  const userMessage = inputField.value.trim();
  if (!userMessage) return;

  // Display user's message
  const userChat = { role: 'user', content: userMessage };
  chatHistory.push(userChat);
  renderChatMessage(userChat);

  inputField.value = '';

  // Send message to OpenAI API
  window.electronAPI.sendAIRequest(chatHistory)
    .then((responseContent) => {
      const aiMessage = { role: 'assistant', content: responseContent };
      chatHistory.push(aiMessage);
      renderChatMessage(aiMessage);
      saveChatHistory();
    })
    .catch((error) => {
      console.error('AI Assistant Error:', error);
    });
}

function handleClearChat() {
  chatHistory.length = 0; // Clear array
  saveChatHistory();
  document.getElementById('chat-display').innerHTML = '';
}

document.getElementById('ai-assistant-send').addEventListener('click', handleSendMessage);
document.getElementById('ai-assistant-clear').addEventListener('click', handleClearChat);

// Load chat history on startup
document.addEventListener('DOMContentLoaded', () => {
  const history = loadChatHistory();
  history.forEach(renderChatMessage);
});

window.onload = () => {
  initResizablePanels();
  initLeftPanelTabs();
  // Initialize other components
  // Ensure that interactive elements can be focused
  const interactiveElements = document.querySelectorAll('button, [href], input, select, textarea');
  interactiveElements.forEach((el) => {
    el.setAttribute('tabindex', '0');
  });
  document.getElementById('use-prompt-button').addEventListener('click', handleUseThisPrompt);
}; 