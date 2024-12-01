import { FileSystemService } from '../../services/FileSystemService';
import { ContentCombinerService } from '../../services/ContentCombinerService';
import { OpenAIService } from '../../services/OpenAIService';
import * as path from 'path';
import * as os from 'os';

jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Test response' } }]
        })
      }
    }
  }))
}));

describe('Application Integration Tests', () => {
  let fileSystemService: FileSystemService;
  let contentCombinerService: ContentCombinerService;
  let openAIService: OpenAIService;
  const mockAppDataPath = path.join(os.tmpdir(), 'test-writing-app');

  beforeEach(() => {
    jest.clearAllMocks();
    fileSystemService = new FileSystemService(mockAppDataPath);
    contentCombinerService = new ContentCombinerService();
    openAIService = new OpenAIService();
    
    // Reset document mock for each test
    (global.document.getElementById as jest.Mock).mockReturnValue({
      textContent: 'test content'
    });
  });

  test('full workflow', async () => {
    // Test folder selection
    const folderResult = await fileSystemService.selectAndReadDirectory('left');
    expect(folderResult).toEqual({
      directoryPath: '/mock/path',
      contents: ['file1.txt', 'file2.md']
    });

    // Test content combination
    const combinedContent = await contentCombinerService.getAllDisplayContents();
    expect(combinedContent).toBeDefined();
    expect(combinedContent).toContain('test content');

    // Test AI interaction
    await openAIService.setApiKey('test-key');
    const aiResponse = await openAIService.sendRequest('Test prompt');
    expect(aiResponse).toBe('Test response');
  });
}); 