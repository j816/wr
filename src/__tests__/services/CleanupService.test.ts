import { CleanupService } from '../../services/CleanupService';
import * as fs from 'fs/promises';
import * as path from 'path';
import { jest } from '@jest/globals';

describe('CleanupService', () => {
  let cleanupService: CleanupService;
  const mockTempDir = '/mock/temp/dir';

  beforeEach(() => {
    cleanupService = new CleanupService(mockTempDir);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('cleanupTempFiles removes old files', async () => {
    const mockFiles = ['old.txt', 'new.txt'];
    const mockStats = {
      old: { mtimeMs: Date.now() - 25 * 60 * 60 * 1000 }, // 25 hours old
      new: { mtimeMs: Date.now() - 1 * 60 * 60 * 1000 }   // 1 hour old
    };

    jest.spyOn(fs, 'readdir').mockResolvedValue(mockFiles as any);
    jest.spyOn(fs, 'stat').mockImplementation((filePath: string | Buffer | URL) => {
      const fileName = path.basename(filePath.toString());
      const fileKey = fileName.split('.')[0] as keyof typeof mockStats;
      return Promise.resolve(mockStats[fileKey] as any);
    });
    const unlinkSpy = jest.spyOn(fs, 'unlink').mockResolvedValue(undefined);

    await cleanupService.cleanupTempFiles();

    expect(unlinkSpy).toHaveBeenCalledWith(path.join(mockTempDir, 'old.txt'));
    expect(unlinkSpy).not.toHaveBeenCalledWith(path.join(mockTempDir, 'new.txt'));
  });

  test('scheduleCleanup sets up interval', () => {
    const cleanupSpy = jest.spyOn(cleanupService, 'cleanupTempFiles');
    
    cleanupService.scheduleCleanup(1000); // 1 second interval for testing
    jest.advanceTimersByTime(3000); // Advance 3 seconds

    expect(cleanupSpy).toHaveBeenCalledTimes(3);
  });
}); 