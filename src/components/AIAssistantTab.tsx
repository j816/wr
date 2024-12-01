import { useEffect, useState } from 'react';
import { ChatMessage } from '../types';

export const AIAssistantTab: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const history = await window.electronAPI.chatHistory.get();
      setChatHistory(history);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      const userMessage: ChatMessage = { role: 'user', content, timestamp: Date.now() };
      await window.electronAPI.chatHistory.add(userMessage);
      
      const response = await window.electronAPI.openai.sendAiRequest(content);
      const aiMessage: ChatMessage = { role: 'assistant', content: response, timestamp: Date.now() };
      await window.electronAPI.chatHistory.add(aiMessage);
      
      setChatHistory(prev => [...prev, userMessage, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-assistant-tab">
      <div className="chat-history">
        {chatHistory.map((msg, idx) => (
          <div key={msg.timestamp} className={`chat-message ${msg.role}`}>
            <div className="message-content">{msg.content}</div>
            <div className="message-time">
              {new Date(msg.timestamp || Date.now()).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <textarea 
          disabled={isLoading}
          placeholder="Type your message..."
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e.currentTarget.value);
              e.currentTarget.value = '';
            }
          }}
        />
        {isLoading && <div className="loading-spinner" />}
      </div>
    </div>
  );
}; 