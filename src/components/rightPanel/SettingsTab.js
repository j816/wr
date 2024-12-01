import React, { useState, useEffect } from 'react';

function SettingsTab() {
  const [apiKey, setApiKey] = useState('');
  const [apiKeySaved, setApiKeySaved] = useState(false);

  useEffect(() => {
    async function checkApiKey() {
      const exists = await window.electronAPI.getApiKey();
      setApiKeySaved(exists);
    }
    checkApiKey();
  }, []);

  const handleApiKeySubmit = async () => {
    if (!apiKey.trim()) {
      alert('Please enter a valid API key.');
      return;
    }
    try {
      const success = await window.electronAPI.saveApiKey(apiKey.trim());
      if (success) {
        alert('API key saved successfully.');
        setApiKey('');
        setApiKeySaved(true);
      } else {
        alert('Failed to save API key.');
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      alert('An error occurred while saving the API key.');
    }
  };

  return (
    <div className="settings-tab">
      <h3>Settings</h3>
      <div className="api-key-input">
        <label htmlFor="api-key">OpenAI API Key:</label>
        <input
          type="password"
          id="api-key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your OpenAI API key"
        />
        <button onClick={handleApiKeySubmit}>Save API Key</button>
      </div>
      {apiKeySaved && <p>Your API key is saved.</p>}
    </div>
  );
}

export default SettingsTab; 