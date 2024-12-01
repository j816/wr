import React, { useState, useEffect, useRef } from 'react';

// AI Assistant Tab Component
export function AIAssistantTab() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing chat history on component mount
  useEffect(() => {
    async function loadChatHistory() {
      try {
        const history = await window.electronAPI.chatHistory.load();
        setMessages(history);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    }
    loadChatHistory();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending message to AI assistant
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send the entire conversation to the AI assistant
      const aiResponseContent = await window.electronAPI.sendAIRequest(updatedMessages);
      const assistantMessage = {
        role: 'assistant',
        content: aiResponseContent,
        timestamp: new Date(),
      };
      const newMessages = [...updatedMessages, assistantMessage];
      setMessages(newMessages);
      // Save the updated chat history
      await window.electronAPI.chatHistory.save(newMessages);
    } catch (error) {
      console.error('Error communicating with AI assistant:', error);
      // Handle error gracefully
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date(),
      };
      const newMessages = [...updatedMessages, errorMessage];
      setMessages(newMessages);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle clearing the chat history
  const handleClearChat = async () => {
    // Clear chat history both in state and in storage
    setMessages([]);
    await window.electronAPI.chatHistory.clear();
  };

  // Handle Enter key press in the input field
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="ai-assistant-container">
      <div className="chat-display">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${
              message.role === 'user' ? 'user-message' : 'assistant-message'
            }`}
          >
            <div className="message-content">{message.content}</div>
            <div className="message-timestamp">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && <div className="loading">AI is thinking...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()}>
          Send
        </button>
        <button onClick={handleClearChat} disabled={isLoading || messages.length === 0}>
          Clear Chat
        </button>
      </div>
    </div>
  );
} 