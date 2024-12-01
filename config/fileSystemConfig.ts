export const FILE_SYSTEM_CONFIG = {
  defaultFileSelection: {
    properties: ['openFile'] as const,
    filters: [
      { name: 'Text Files', extensions: ['txt', 'md', 'json'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  },
  panelConfigs: {
    left: {
      enabled: true,
      properties: ['openDirectory'] as const,
      filters: [],
      buttonText: 'Select Prompt Folder',
      encoding: 'utf8',
      excludeFiles: ['.DS_Store'],
    },
    right: {
      enabled: true,
      properties: ['openDirectory'] as const,
      filters: [],
      buttonText: 'Select Criteria Folder',
      encoding: 'utf8',
      excludeFiles: ['.DS_Store'],
    },
    center: {
      enabled: false,
    },
  },
}; 