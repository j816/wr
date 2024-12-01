import { OpenAIService } from '../../services/OpenAIService';
import * as keytar from 'keytar';
import { jest } from '@jest/globals';
import type { ChatCompletion } from 'openai/resources/chat/completions';

// Mock keytar with proper types
jest.mock('keytar', () => {
  const mock = {
    setPassword: jest.fn(),
    getPassword: jest.fn()
  };
  mock.setPassword.mockImplementation(() => Promise.resolve());
  mock.getPassword.mockImplementation(() => Promise.resolve('mock-api-key'));
  return mock;
});

// Mock OpenAI with correct types
jest.mock('openai', () => {
  const mockMessage = {
    role: 'assistant',
    content: 'Test response',
    refusal: null
  };

  const mockResponse = {
    id: 'mock-id',
    object: 'chat.completion',
    created: Date.now(),
    model: 'gpt-4',
    choices: [{
      message: mockMessage,
      index: 0,
      finish_reason: 'stop'
    }]
  };

  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockImplementation(() => Promise.resolve(mockResponse))
        }
      }
    }))
  };
});

describe('OpenAIService', () => {
  let service: OpenAIService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OpenAIService();
  });

  describe('setApiKey', () => {
    it('should store API key securely', async () => {
      const mockSetPassword = keytar.setPassword as jest.Mock;
      await service.setApiKey('test-api-key');
      expect(mockSetPassword).toHaveBeenCalledWith(
        'electron-writing-assistant',
        'openai-api',
        'test-api-key'
      );
    });
  });

  describe('sendRequest', () => {
    it('should send request and return response', async () => {
      await service.setApiKey('test-key');
      const response = await service.sendRequest('Test prompt');
      expect(response).toBe('Test response');
    });
  });
}); 