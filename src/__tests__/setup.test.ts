import { dialog } from 'electron';
import * as fs from 'fs/promises';

describe('Setup', () => {
  test('electron mocks are properly configured', () => {
    expect(dialog.showOpenDialog).toBeDefined();
    expect(fs.readdir).toBeDefined();
  });
}); 