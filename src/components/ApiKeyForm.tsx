import React, { useState, useEffect } from 'react';
import { OpenAIService } from '../services/OpenAIService';
import { SettingsService } from '../services/SettingsService';
import styles from './ApiKeyForm.module.css';

interface ApiKeyFormProps {
  onSaved: () => void;
  onError: (message: string) => void;
}

const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onSaved, onError }: ApiKeyFormProps) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasKey, setHasKey] = useState<boolean>(false);
  const openAIService = new OpenAIService();
  const settingsService = new SettingsService();

  useEffect(() => {
    void checkExistingKey();
  }, []);

  const checkExistingKey = async (): Promise<void> => {
    try {
      const key = await settingsService.getApiKey();
      setHasKey(!!key);
    } catch (error) {
      console.error('Error checking API key:', error);
      setHasKey(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isValid = await openAIService.verifyApiKey(apiKey);
      if (!isValid) {
        onError('Invalid API key. Please check and try again.');
        return;
      }

      await settingsService.updateApiKey(apiKey);
      setApiKey('');
      setHasKey(true);
      onSaved();
    } catch (error) {
      if (error instanceof Error) {
        onError(error.message);
      } else {
        onError('An unexpected error occurred while saving the API key.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    try {
      await openAIService.deleteApiKey();
      setHasKey(false);
      onSaved();
    } catch (error) {
      if (error instanceof Error) {
        onError(error.message);
      } else {
        onError('An unexpected error occurred while deleting the API key.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>OpenAI API Key</h2>
      {hasKey ? (
        <div>
          <p className={styles.successText}>✓ API key is set and verified</p>
          <button
            onClick={handleDelete}
            className={styles.dangerButton}
            disabled={isLoading}
            type="button"
          >
            Remove API Key
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your OpenAI API key"
            className={styles.input}
          />
          <button type="submit" disabled={isLoading || !apiKey} className={styles.button}>
            {isLoading ? 'Saving...' : 'Save API Key'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ApiKeyForm; 