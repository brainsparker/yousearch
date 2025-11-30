# Contributing to YouSearch

Thank you for your interest in contributing to YouSearch! This guide will help you get started.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful and considerate in all interactions.

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/yousearch.git
cd yousearch

# Add upstream remote
git remote add upstream https://github.com/yourusername/yousearch.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

```bash
cp .env.example .env.local
# Add your YOU_API_KEY to .env.local
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your changes.

## Development Workflow

### Creating a Feature Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create a new feature branch
git checkout -b feature/your-feature-name
```

### Making Changes

1. **Write Code**: Make your changes following our code style guidelines
2. **Test Locally**: Ensure everything works
3. **Lint and Format**: Run code quality checks
4. **Commit**: Write clear, descriptive commit messages

### Before Committing

Run these checks:

```bash
# Format code
npm run format

# Check linting
npm run lint

# Type check
npm run type-check

# Run tests (when available)
npm test
```

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:

```
feat(search): add pagination to search results
fix(api): handle empty query parameter correctly
docs(readme): update installation instructions
refactor(components): extract SearchBox component
test(api): add unit tests for search endpoint
```

### Submitting a Pull Request

1. **Push Your Branch**

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request** on GitHub

3. **Fill Out the PR Template**
   - Describe your changes
   - Reference any related issues
   - Include screenshots for UI changes

4. **Wait for Review**
   - Address reviewer feedback
   - Keep your branch up to date

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Define proper types (avoid `any`)
- Use interfaces for object shapes
- Export types that are used by multiple files

**Good**:

```typescript
interface SearchBoxProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSubmit: () => void;
}

export function SearchBox({ query, onQueryChange, onSubmit }: SearchBoxProps) {
  // ...
}
```

**Bad**:

```typescript
export function SearchBox(props: any) {
  // ...
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused (< 200 lines)
- Extract reusable logic into custom hooks
- Use meaningful prop names

**Component Structure**:

```typescript
'use client'; // Only if client component

import { useState } from 'react';
import styles from './Component.module.css';

interface ComponentProps {
  // Props definition
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks
  const [state, setState] = useState();

  // Event handlers
  const handleClick = () => {
    // ...
  };

  // Render
  return (
    <div className={styles.container}>
      {/* JSX */}
    </div>
  );
}
```

### File Organization

```
component-name/
├── ComponentName.tsx       # Component implementation
├── ComponentName.module.css # Component styles
└── ComponentName.test.tsx  # Component tests
```

### Naming Conventions

- **Components**: PascalCase (`SearchBox.tsx`)
- **Utilities**: camelCase (`you-search.ts`)
- **Styles**: kebab-case (`search-box.module.css`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`SearchResult`, `APIResponse`)

### CSS/Styling

- Use CSS Modules for component styles
- Follow BEM-like naming in class names
- Use CSS variables for design tokens
- Keep selectors simple and flat

**Example**:

```css
/* search-box.module.css */
.container {
  display: flex;
  gap: var(--spacing-12);
}

.input {
  flex: 1;
  padding: var(--spacing-10);
}

.button {
  background: var(--primary-purple);
}
```

### Code Formatting

We use Prettier for automatic formatting:

```bash
npm run format
```

Husky will automatically format code on commit.

**Prettier Settings**:

- 2 spaces for indentation
- Single quotes
- Semicolons required
- 100 character line limit

### ESLint Rules

Key rules to follow:

- No `any` type (use proper types)
- No unused variables (prefix with `_` if intentional)
- Warn on console.log (use console.warn/error only)
- Prefer const over let

## Testing Guidelines

### Unit Tests

Test individual functions and utilities:

```typescript
import { describe, it, expect } from 'vitest';
import { formatDate } from './utils';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const result = formatDate('2024-01-01');
    expect(result).toBe('Jan 1, 2024');
  });
});
```

### Component Tests

Test React components:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBox } from './SearchBox';

describe('SearchBox', () => {
  it('calls onSubmit when form is submitted', () => {
    const onSubmit = vi.fn();
    render(<SearchBox query="" onQueryChange={() => {}} onSubmit={onSubmit} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onSubmit).toHaveBeenCalled();
  });
});
```

### Integration Tests

Test complete user flows:

```typescript
describe('Search Flow', () => {
  it('performs search and displays results', async () => {
    // Mock API
    // Render page
    // Enter query
    // Submit form
    // Wait for results
    // Assert results displayed
  });
});
```

### Test Coverage

- Aim for 70%+ coverage on critical paths
- All new features should include tests
- Bug fixes should include regression tests

## Documentation

### Code Documentation

Add JSDoc comments to:

- All exported functions
- All exported classes
- Complex logic that needs explanation

**Example**:

````typescript
/**
 * Searches the You.com API for the given query
 *
 * @param query - The search query string
 * @param numResults - Maximum number of results (default: 10)
 * @returns Promise resolving to search results
 * @throws Error if API request fails
 *
 * @example
 * ```typescript
 * const client = new YouSearchClient();
 * const results = await client.search('Next.js');
 * ```
 */
async search(query: string, numResults: number = 10): Promise<SearchResponse> {
  // ...
}
````

### README Updates

Update documentation when you:

- Add new features
- Change API endpoints
- Modify configuration
- Update dependencies

## Pull Request Checklist

Before submitting, ensure:

- [ ] Code follows style guidelines
- [ ] All tests pass (`npm test`)
- [ ] ESLint passes (`npm run lint`)
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] Code is formatted (`npm run format`)
- [ ] New features have tests
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] PR description is clear and complete

## Review Process

1. **Automated Checks**: CI runs tests, linting, type checking
2. **Code Review**: Maintainers review your code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, your PR will be merged

## Types of Contributions

### Bug Reports

When reporting bugs, include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (Node version, OS, browser)

### Feature Requests

When requesting features:

- Describe the problem you're trying to solve
- Explain your proposed solution
- Consider alternative approaches
- Discuss impact and trade-offs

### Code Contributions

We welcome:

- Bug fixes
- New features
- Performance improvements
- Documentation improvements
- Test coverage improvements
- Code refactoring

### Documentation

Help improve:

- README clarity
- Code comments
- API documentation
- Architecture guides
- Tutorial content

## Development Tips

### Hot Reload

Next.js supports hot reload. Changes to most files will automatically refresh.

### Debugging

Use Next.js built-in debugging:

```bash
# Debug mode
NODE_OPTIONS='--inspect' npm run dev
```

Then open `chrome://inspect` in Chrome.

### Environment Variables

Test with different environments:

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

### Check Package Sizes

```bash
npm run analyze  # (when configured)
```

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: File a GitHub Issue
- **Chat**: Join our community (link TBD)

## Recognition

Contributors are recognized in:

- GitHub contributors list
- Release notes
- Project documentation

Thank you for contributing to YouSearch! 🎉
