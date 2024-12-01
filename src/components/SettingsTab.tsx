import React, { useState, useEffect } from 'react';

export const SettingsTab: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [apiKeyExists, setApiKeyExists] = useState(false);

  useEffect(() => {
    const checkApiKey = async () => {
      const exists = await window.electronAPI.getApiKey();
      setApiKeyExists(exists);
    };
    checkApiKey();
  }, []);

  const handleApiKeySubmit = async () => {
    setIsSaving(true);
    try {
      if (apiKey.trim()) {
        const success = await window.electronAPI.saveApiKey(apiKey.trim());
        if (success) {
          setMessage('API Key saved successfully.');
          setApiKey('');
          setApiKeyExists(true);
        } else {
          setMessage('Failed to save API Key.');
        }
      } else {
        setMessage('Please enter a valid API Key.');
      }
    } catch (error) {
      console.error('Error saving API Key:', error);
      setMessage('An error occurred while saving the API Key.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteApiKey = async () => {
    setIsSaving(true);
    try {
      const success = await window.electronAPI.deleteApiKey();
      if (success) {
        setMessage('API Key deleted successfully.');
        setApiKeyExists(false);
      } else {
        setMessage('Failed to delete API Key.');
      }
    } catch (error) {
      console.error('Error deleting API Key:', error);
      setMessage('An error occurred while deleting the API Key.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h3>Settings</h3>
      {apiKeyExists ? (
        <div>
          <p>An API Key is already saved.</p>
          <button onClick={handleDeleteApiKey} disabled={isSaving}>
            Delete API Key
          </button>
        </div>
      ) : (
        <div>
          <label htmlFor="apiKeyInput">OpenAI API Key:</label>
          <input
            type="password"
            id="apiKeyInput"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API Key"
            disabled={isSaving}
          />
          <button onClick={handleApiKeySubmit} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Submit'}
          </button>
        </div>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}; 