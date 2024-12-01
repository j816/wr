import { OpenAIService } from './OpenAIService';
import { FileSystemService } from './FileSystemService';
import { AutoSaveService } from './AutoSaveService';
import { PanelStateService } from './PanelStateService';
import { ChatHistoryService } from './ChatHistoryService';
import { WordCountService } from './WordCountService';
import { PromptService } from './PromptService';
import { ErrorBoundaryService } from './ErrorBoundaryService';
import * as path from 'path';
import { app } from 'electron';

class ServiceManager {
  private static instance: ServiceManager;
  private services: Map<string, any> = new Map();

  private constructor() {
    const userDataPath = app.getPath('userData');
    const tempPath = app.getPath('temp');
    const logsPath = app.getPath('logs');

    this.services.set('openai', new OpenAIService());
    this.services.set('fileSystem', new FileSystemService());
    this.services.set('autoSave', new AutoSaveService(tempPath));
    this.services.set('panelState', new PanelStateService(userDataPath));
    this.services.set('chatHistory', new ChatHistoryService());
    this.services.set('wordCount', new WordCountService());
    this.services.set('prompt', new PromptService(userDataPath));
    this.services.set('errorBoundary', new ErrorBoundaryService(logsPath));
  }

  public static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager();
    }
    return ServiceManager.instance;
  }

  public getService(serviceName: string): any {
    const service = this.services.get(serviceName);
    if (!service) {
      const error = new Error(`Service ${serviceName} not found`);
      this.handleServiceError(serviceName, error);
      throw error;
    }
    return service;
  }

  public handleServiceError(serviceName: string, error: Error): void {
    const errorBoundary = this.getService('errorBoundary');
    errorBoundary.handleError(`Service: ${serviceName}`, error);
  }
}

export default ServiceManager; 