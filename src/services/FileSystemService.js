const { dialog } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const { FILE_SYSTEM_CONFIG } = require('../config/fileSystemConfig');

class FileSystemService {
  static async selectDirectory(panelId) {
    const config = FILE_SYSTEM_CONFIG.panelConfigs[panelId];
    if (!config || !config.enabled) {
      throw new Error(`File selection not enabled for panel: ${panelId}`);
    }
    const result = await dialog.showOpenDialog({
      properties: config.properties,
      filters: config.filters,
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  }

  static async getSubfolders(directoryPath, excludeFiles = []) {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });
    return entries
      .filter(
        (entry) =>
          entry.isDirectory() && !excludeFiles.includes(entry.name)
      )
      .map((entry) => entry.name);
  }

  static async getFiles(directoryPath, extensions = [], excludeFiles = []) {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });
    return entries
      .filter(
        (entry) =>
          entry.isFile() &&
          (extensions.length === 0 ||
            extensions.includes(path.extname(entry.name).substring(1))) &&
          !excludeFiles.includes(entry.name)
      )
      .map((entry) => entry.name);
  }

  static async readFile(filePath, encoding = 'utf8') {
    return fs.readFile(filePath, encoding);
  }

  static async writeFile(filePath, content, encoding = 'utf8') {
    await fs.writeFile(filePath, content, encoding);
  }
}

module.exports = FileSystemService; 