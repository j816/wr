import React, { useState, useEffect, useRef } from 'react';
import styles from './AIAssistant.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send the entire conversation to the AI assistant
      const aiResponse = await window.electronAPI.sendAIRequest(
        updatedMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))
      );

      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now(),
      };
      const newMessages = [...updatedMessages, assistantMessage];
      setMessages(newMessages);
      // Save the updated chat history
      await window.electronAPI.chatHistory.save(newMessages);
    } catch (error) {
      console.error('Error communicating with AI assistant:', error);
      // Handle error gracefully
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: Date.now(),
      };
      const newMessages = [...updatedMessages, errorMessage];
      setMessages(newMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    // Clear chat history both in state and in storage
    setMessages([]);
    await window.electronAPI.chatHistory.clear();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.messages}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`${styles.message} ${
              message.role === 'user' ? styles.userMessage : styles.assistantMessage
            }`}
          >
            <div className={styles.messageContent}>{message.content}</div>
            <div className={styles.messageTimestamp}>
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && <div className={styles.loading}>AI is thinking...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.inputArea}>
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Type your message..."
          disabled={isLoading}
          className={styles.input}
        />
        <button
          onClick={() => void handleSendMessage()}
          disabled={isLoading || !inputMessage.trim()}
          className={styles.sendButton}
        >
          Send
        </button>
        <button
          onClick={handleClearChat}
          disabled={isLoading || messages.length === 0}
          className={styles.clearButton}
        >
          Clear Chat
        </button>
      </div>
    </div>
  );
}; 