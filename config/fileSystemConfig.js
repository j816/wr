"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FILE_SYSTEM_CONFIG = void 0;
exports.FILE_SYSTEM_CONFIG = {
    defaultFileSelection: {
        properties: ['openFile'],
        filters: [
            { name: 'Text Files', extensions: ['txt', 'md', 'json'] },
            { name: 'All Files', extensions: ['*'] },
        ],
    },
    panelConfigs: {
        left: {
            enabled: true,
            properties: ['openDirectory'],
            filters: [],
            buttonText: 'Select Prompt Folder',
            encoding: 'utf8',
            excludeFiles: ['.DS_Store'],
        },
        right: {
            enabled: true,
            properties: ['openDirectory'],
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
//# sourceMappingURL=fileSystemConfig.js.map