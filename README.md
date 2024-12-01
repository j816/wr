# AI-Assisted Writing App

A powerful Electron-based desktop application that enhances your writing process with AI assistance, writing prompts, and automated feedback.

## Features

- **Writing Prompts**: Get inspiration from organized prompt collections
- **AI Assistant**: Real-time writing assistance and suggestions
- **AI Feedback**: Submit your writing for comprehensive AI evaluation
- **Auto-save**: Never lose your work with automatic saving
- **Cross-platform**: Works on Windows, macOS, and Linux

## Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd ai-writing-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your OpenAI API key:
```env
OPENAI_API_KEY=your_api_key_here
```

4. Start the application:
```bash
npm start
```

## Development Setup

1. Install development dependencies:
```bash
npm install --save-dev
```

2. Run in development mode:
```bash
npm run dev
```

3. Run tests:
```bash
npm test
```

## Project Structure

```
src/
├── components/          # React components
│   ├── common/         # Shared components
│   └── writing-prompts/# Writing prompts components
├── services/           # Backend services
│   ├── OpenAIService   # OpenAI integration
│   ├── AutoSave       # Auto-save functionality
│   └── FileSystem     # File system operations
├── config/            # Configuration files
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── __tests__/         # Test files
```

## Architecture

### Main Process (`src/main.ts`)
- Handles window management
- IPC communication
- File system operations
- OpenAI API integration

### Renderer Process
- React-based UI components
- State management
- User interactions
- Real-time updates

### Services
- **OpenAIService**: Manages AI interactions
- **AutoSaveService**: Handles automatic saving
- **FileSystemService**: File operations
- **PanelStateService**: UI panel management
- **ErrorBoundaryService**: Error handling

## Features Documentation

### Writing Prompts
- Select prompt folders
- View random prompts
- Organize prompts by category
- Use prompts in writing

### AI Assistant
- Real-time chat interface
- Context-aware responses
- Chat history management
- Markdown support

### Text Editor
- Auto-save every 30 seconds
- Word count
- File management
- Multiple format support

### AI Feedback
- Customizable evaluation criteria
- Detailed feedback
- Progress tracking
- Export options

## Configuration

### Panel Configuration
```typescript
// src/config/panelConfig.ts
export const PanelConfig = {
  left: {
    minWidth: 200,
    maxWidth: 400
  },
  right: {
    minWidth: 200,
    maxWidth: 400
  }
};
```

### OpenAI Configuration
```typescript
// src/config/openaiConfig.ts
export const OpenAIConfig = {
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000
};
```

## Error Handling

The application implements comprehensive error handling:
- API failures
- File system errors
- UI component errors
- Network issues

## Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### Coverage Reports
```bash
npm run test:coverage
```

## Building

### For Development
```bash
npm run build:dev
```

### For Production
```bash
npm run build:prod
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## Acknowledgments

- OpenAI for their powerful API
- Electron community
- React community
- All contributors 