import * as keytar from 'keytar';

export class ApiKeyService {
  private static readonly SERVICE_NAME = 'WritingAssistant';
  private static readonly ACCOUNT_NAME = 'openai-api-key';

  async saveApiKey(apiKey: string): Promise<void> {
    await keytar.setPassword(ApiKeyService.SERVICE_NAME, ApiKeyService.ACCOUNT_NAME, apiKey);
  }

  async getApiKey(): Promise<string | null> {
    return await keytar.getPassword(ApiKeyService.SERVICE_NAME, ApiKeyService.ACCOUNT_NAME);
  }

  async deleteApiKey(): Promise<boolean> {
    return await keytar.deletePassword(ApiKeyService.SERVICE_NAME, ApiKeyService.ACCOUNT_NAME);
  }
} 