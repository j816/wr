# Development Guide

## Overview

This document provides guidelines and best practices for developing the AI-Assisted Writing App. It covers code organization, development workflow, testing practices, and common patterns used throughout the codebase.

## Development Environment

### Prerequisites

1. Node.js 16.x or higher
2. npm 7.x or higher
3. Git
4. VS Code (recommended)
   - Extensions:
     - ESLint
     - Prettier
     - TypeScript and JavaScript Language Features
     - Electron Developer Tools

### Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd ai-writing-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a development environment file:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── components/          # React components
│   ├── common/         # Shared components
│   └── writing-prompts/# Writing prompts components
├── services/           # Backend services
├── config/            # Configuration files
├── types/             # TypeScript definitions
├── utils/             # Utility functions
└── __tests__/         # Test files
```

### Key Directories

- **components/**: React components organized by feature
- **services/**: Backend services for core functionality
- **config/**: Configuration files and constants
- **types/**: TypeScript type definitions and interfaces
- **utils/**: Shared utility functions
- **__tests__/**: Test files matching the source structure

## Architecture

### Main Process

The main process (`src/main.ts`) handles:
- Window management
- IPC communication
- File system operations
- OpenAI API integration

Key responsibilities:
1. Application lifecycle management
2. Window creation and management
3. IPC handler registration
4. Service initialization

### Renderer Process

The renderer process handles:
- UI rendering
- User interactions
- State management
- IPC communication with main process

Components are organized by feature and follow these patterns:
1. Container/Presenter pattern
2. React hooks for state and effects
3. TypeScript for type safety
4. Proper error boundaries

## Development Workflow

### 1. Feature Development

1. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Implement the feature following these steps:
   - Add types/interfaces
   - Implement services
   - Create UI components
   - Add tests
   - Update documentation

3. Run tests:
```bash
npm test
```

4. Submit a pull request

### 2. Code Style

- Follow the TypeScript style guide
- Use ESLint and Prettier
- Write meaningful commit messages
- Document public APIs and complex logic

### 3. Testing

#### Unit Tests

- Test individual components and services
- Use Jest and React Testing Library
- Follow the AAA pattern (Arrange, Act, Assert)

Example:
```typescript
describe('OpenAIService', () => {
  it('should store API key securely', async () => {
    // Arrange
    const service = new OpenAIService();
    const apiKey = 'test-key';

    // Act
    await service.setApiKey(apiKey);

    // Assert
    const storedKey = await service.getStoredApiKey();
    expect(storedKey).toBe(apiKey);
  });
});
```

#### Integration Tests

- Test component interactions
- Test IPC communication
- Test file system operations

### 4. Error Handling

Follow these principles for error handling:

1. Use TypeScript for compile-time error prevention
2. Implement proper error boundaries
3. Log errors with context
4. Provide user-friendly error messages

Example:
```typescript
try {
  await this.openai.chat.completions.create({/*...*/});
} catch (error) {
  console.error('OpenAI API error:', error);
  throw new Error('Failed to get AI response. Please try again.');
}
```

## Common Patterns

### 1. Service Pattern

Services handle core business logic and external interactions:

```typescript
export class SomeService {
  constructor(private deps: Dependencies) {}

  async doSomething(): Promise<Result> {
    // Implementation
  }
}
```

### 2. React Patterns

Use functional components and hooks:

```typescript
const MyComponent: React.FC<Props> = ({ prop }) => {
  const [state, setState] = useState<State>(initialState);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);

  return <div>{/* JSX */}</div>;
};
```

### 3. Error Boundaries

Implement error boundaries for component error handling:

```typescript
class ErrorBoundary extends React.Component<Props, State> {
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Handle error
  }

  render() {
    if (this.state.hasError) {
      return <ErrorView error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

## Performance Considerations

1. **Bundle Size**
   - Use code splitting
   - Lazy load components
   - Optimize dependencies

2. **Memory Management**
   - Clean up resources
   - Unsubscribe from events
   - Clear intervals/timeouts

3. **File System Operations**
   - Use async operations
   - Implement proper cleanup
   - Handle large files efficiently

## Debugging

1. **Renderer Process**
   - Use React Developer Tools
   - Console logging
   - React Error Boundary

2. **Main Process**
   - Use `--inspect` flag
   - Console logging
   - Process monitoring

3. **IPC Communication**
   - Debug IPC messages
   - Monitor event flow
   - Check message payload

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow code style guidelines
4. Add tests
5. Update documentation
6. Submit a pull request

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs) 