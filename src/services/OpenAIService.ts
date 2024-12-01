/**
 * Service for managing OpenAI API interactions and API key management.
 * This service provides a secure way to store and manage OpenAI API keys,
 * and handles all communication with the OpenAI API.
 * 
 * @implements {IOpenAIService}
 */
import { OpenAIService as IOpenAIService } from '../types/electron';
import OpenAI from 'openai';
import type { ChatCompletionChunk } from 'openai/resources/chat/completions';
import * as keytar from 'keytar';
import { ProgressCallback } from '../types/panels';
import { OpenAIConfig } from '../../config/openaiConfig';

/** Name of the service for keytar storage */
const SERVICE_NAME = 'ElectronAIWriter';
/** Account name for keytar storage */
const ACCOUNT_NAME = 'openai-api-key';

/**
 * Implementation of the OpenAI service interface.
 * Handles API key management and OpenAI API interactions.
 */
export class OpenAIService implements IOpenAIService {
  /** Instance of OpenAI API client */
  private openai: OpenAI | null = null;

  /**
   * Creates an instance of OpenAIService.
   * Automatically attempts to initialize using a stored API key.
   */
  constructor() {
    this.initializeFromStoredKey();
  }

  /**
   * Initializes the service using a stored API key.
   * @private
   * @returns {Promise<void>}
   */
  private async initializeFromStoredKey(): Promise<void> {
    const apiKey = await this.getStoredApiKey();
    if (apiKey) {
      this.initialize(apiKey);
    }
  }

  /**
   * Initializes the OpenAI client with the provided API key.
   * @private
   * @param {string} apiKey - The OpenAI API key
   */
  private initialize(apiKey: string): void {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Securely stores the API key and initializes the service.
   * Uses the system's secure credential storage.
   * 
   * @param {string} apiKey - The OpenAI API key to store
   * @throws {Error} If the API key cannot be saved
   * @returns {Promise<void>}
   */
  async setApiKey(apiKey: string): Promise<void> {
    try {
      await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, apiKey);
      this.initialize(apiKey);
    } catch (error) {
      console.error('Error saving API key:', error);
      throw error;
    }
  }

  /**
   * Retrieves the stored API key from secure storage.
   * @returns {Promise<string | null>} The stored API key or null if not found
   */
  async getStoredApiKey(): Promise<string | null> {
    try {
      return await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
    } catch (error) {
      console.error('Error getting stored API key:', error);
      return null;
    }
  }

  /**
   * Deletes the stored API key and cleans up the service instance.
   * @returns {Promise<boolean>} True if the key was successfully deleted
   */
  async deleteApiKey(): Promise<boolean> {
    try {
      await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
      this.openai = null;
      return true;
    } catch (error) {
      console.error('Error deleting API key:', error);
      return false;
    }
  }

  /**
   * Sends a chat completion request to the OpenAI API.
   * 
   * @param {Array<{role: string, content: string}>} messages - The conversation messages
   * @returns {Promise<string>} The AI's response
   * @throws {Error} If the API request fails or the client is not initialized
   */
  async getChatCompletion(messages: Array<{role: string, content: string}>): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI client is not initialized. Please set an API key first.');
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      });

      if (!('choices' in response)) {
        throw new Error('Invalid response format from OpenAI API');
      }

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error getting chat completion:', error);
      throw error;
    }
  }

  /**
   * Verifies if an API key is valid by making a test request
   * @param {string} apiKey - The API key to verify
   * @returns {Promise<boolean>} True if the key is valid
   */
  async verifyApiKey(apiKey: string): Promise<boolean> {
    try {
      const testOpenAI = new OpenAI({ apiKey });
      await testOpenAI.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Sends a request to the OpenAI API
   * @param {string} prompt - The prompt to send
   * @returns {Promise<string>} The response from the API
   */
  async sendRequest(prompt: string): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }]
    });

    if ('choices' in response) {
      return response.choices[0]?.message?.content || '';
    }

    throw new Error('Invalid response format from OpenAI API');
  }

  /**
   * Sends a streaming request to the OpenAI API
   * @param {string} prompt - The prompt to send
   * @returns {AsyncIterableIterator<string>} Stream of responses
   */
  async *sendStreamingRequest(prompt: string): AsyncIterableIterator<string> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const stream = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      stream: true
    }) as AsyncIterable<ChatCompletionChunk>;

    if (Symbol.asyncIterator in stream) {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } else {
      throw new Error('Stream response not supported');
    }
  }

  /**
   * Sends a request to OpenAI with progress tracking
   * @param prompt The prompt to send
   * @param onProgress Callback for progress updates
   */
  async sendRequestWithProgress(
    prompt: string,
    onProgress: ProgressCallback
  ): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      onProgress({ isLoading: true, progress: 0, status: 'Initializing request...' });

      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        stream: true
      }) as AsyncIterable<ChatCompletionChunk>;

      let fullResponse = '';
      let tokenCount = 0;
      const estimatedTokens = Math.ceil(prompt.length / 4);

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
        tokenCount += content.length;

        const progress = Math.min(Math.round((tokenCount / estimatedTokens) * 100), 99);
        onProgress({
          isLoading: true,
          progress,
          status: `Generating response... ${progress}%`
        });
      }

      onProgress({ isLoading: false, progress: 100, status: 'Complete' });
      return fullResponse;

    } catch (error) {
      onProgress({ isLoading: false, progress: 0, status: 'Error' });
      console.error('Error in OpenAI request:', error);
      throw error;
    }
  }

  async sendChatCompletion(messages: Array<{ role: string; content: string }>): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }
    try {
      const response = await this.openai.chat.completions.create({
        ...OpenAIConfig.defaultParams,
        messages: [OpenAIConfig.systemMessage, ...messages],
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error in OpenAI chat completion:', error);
      throw new Error('Failed to get response from OpenAI API');
    }
  }
} 