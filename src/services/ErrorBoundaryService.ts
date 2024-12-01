import { ErrorBoundaryService as IErrorBoundaryService } from '../types/electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import { NotificationService } from './NotificationService';

export class ErrorBoundaryService implements IErrorBoundaryService {
  private lastError: Error | null = null;
  private readonly maxLogSize = 5 * 1024 * 1024; // 5MB
  private readonly logRotationCount = 3;

  constructor(private readonly logDir: string) {
    this.initializeLogDirectory();
  }

  private async initializeLogDirectory(): Promise<void> {
    try {
      await fs.access(this.logDir);
    } catch {
      await fs.mkdir(this.logDir, { recursive: true });
    }
  }

  private getLogFilePath(index: number = 0): string {
    return path.join(this.logDir, `error${index ? `.${index}` : ''}.log`);
  }

  private async rotateLogFiles(): Promise<void> {
    try {
      const currentLogPath = this.getLogFilePath();
      const stats = await fs.stat(currentLogPath);

      if (stats.size >= this.maxLogSize) {
        // Rotate existing log files
        for (let i = this.logRotationCount - 1; i >= 0; i--) {
          const oldPath = this.getLogFilePath(i);
          const newPath = this.getLogFilePath(i + 1);

          try {
            await fs.access(oldPath);
            if (i === this.logRotationCount - 1) {
              await fs.unlink(oldPath);
            } else {
              await fs.rename(oldPath, newPath);
            }
          } catch {
            // File doesn't exist, continue
          }
        }
      }
    } catch {
      // If the current log file doesn't exist, no rotation needed
    }
  }

  private formatErrorLog(context: string, error: Error): string {
    return `[${new Date().toISOString()}] ${context}
Error: ${error.message}
Stack: ${error.stack || 'No stack trace'}
-------------------
`;
  }

  async handleError(context: string, error: Error): Promise<void> {
    this.lastError = error;

    try {
      await this.rotateLogFiles();
      
      const logEntry = this.formatErrorLog(context, error);
      await fs.appendFile(this.getLogFilePath(), logEntry, 'utf8');

      // If this is a critical error, we might want to notify the user
      if (this.isCriticalError(error)) {
        this.notifyCriticalError(context, error);
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
      console.error('Original error:', error);
    }
  }

  private isCriticalError(error: Error): boolean {
    // Define what constitutes a critical error
    const criticalPatterns = [
      'EACCES',
      'EPERM',
      'ENOSPC',
      'ERR_INSUFFICIENT_RESOURCES',
      'ERR_WORKER_OUT_OF_MEMORY',
      'OpenAI API Error',
      'API key',
    ];

    return criticalPatterns.some(pattern => 
      error.message.includes(pattern) || (error.stack || '').includes(pattern)
    );
  }

  private notifyCriticalError(context: string, error: Error): void {
    NotificationService.showError(`${context}: ${error.message}`);
    console.error('CRITICAL ERROR:', context, error);
  }

  getLastError(): Error | null {
    return this.lastError;
  }

  async getErrorLogs(): Promise<string[]> {
    const logs: string[] = [];
    
    for (let i = 0; i <= this.logRotationCount; i++) {
      try {
        const content = await fs.readFile(this.getLogFilePath(i), 'utf8');
        logs.push(content);
      } catch {
        // Skip if file doesn't exist
      }
    }

    return logs;
  }

  async clearErrorLogs(): Promise<void> {
    for (let i = 0; i <= this.logRotationCount; i++) {
      try {
        await fs.unlink(this.getLogFilePath(i));
      } catch {
        // Skip if file doesn't exist
      }
    }
    this.lastError = null;
  }
} 