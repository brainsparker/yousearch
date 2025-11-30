# Architecture Guide

This document describes the architecture, design patterns, and technical decisions in YouSearch.

## System Overview

YouSearch is a modern web application built with Next.js 15 that provides a search interface to the You.com API. It follows a client-server architecture with server-side API routes and client-side React components.

```
┌─────────────┐
│   Browser   │
│  (Client)   │
└──────┬──────┘
       │
       │ HTTP/HTTPS
       │
┌──────▼──────┐
│  Next.js    │
│  App Router │
├─────────────┤
│ API Routes  │◄────┐
└──────┬──────┘     │
       │            │
       │        ┌───▼────┐
       │        │ You.com│
       │        │  API   │
       │        └────────┘
       │
┌──────▼──────┐
│   React     │
│ Components  │
└─────────────┘
```

## Technology Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript 5.3
- **Styling**: CSS Modules (planned), currently vanilla CSS
- **State Management**: React Hooks (useState, useEffect)

### Backend

- **Runtime**: Node.js 18+
- **API Framework**: Next.js API Routes
- **HTTP Client**: Native Fetch API

### Development Tools

- **Linting**: ESLint with TypeScript plugin
- **Formatting**: Prettier
- **Git Hooks**: Husky + lint-staged
- **Testing**: Vitest (planned)

## Directory Structure

```
yousearch/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes (server-side)
│   │   ├── search/
│   │   │   └── route.ts          # Search endpoint (GET/POST)
│   │   └── health/
│   │       └── route.ts          # Health check endpoint
│   ├── page.tsx                  # Main search page (client component)
│   ├── layout.tsx                # Root layout with metadata
│   └── globals.css               # Global styles
│
├── lib/                          # Shared utilities and libraries
│   ├── you-search.ts             # You.com API client class
│   └── config.ts                 # Environment configuration
│
├── docs/                         # Documentation
│   ├── GETTING_STARTED.md
│   ├── ARCHITECTURE.md (this file)
│   ├── API.md
│   └── MIGRATION-GUIDE.md
│
├── legacy/                       # Archived Flask implementation
│   ├── flask/                    # Old Python backend
│   └── figma/                    # Design system files
│
├── .husky/                       # Git hooks
│   └── pre-commit                # Pre-commit hook
│
├── Configuration files
├── .eslintrc.json                # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── tsconfig.json                 # TypeScript configuration
├── next.config.js                # Next.js configuration
└── package.json                  # Dependencies and scripts
```

## Core Components

### 1. API Client (`lib/you-search.ts`)

The `YouSearchClient` class encapsulates all interactions with the You.com Search API.

**Responsibilities**:

- API authentication with API key
- HTTP request/response handling
- Error handling and retries
- Response formatting (JSON, LLM-friendly text)

**Key Methods**:

- `search(query, numResults)` - Performs search query
- `formatResultsForLLM(results)` - Formats results for AI consumption

### 2. Configuration (`lib/config.ts`)

Centralized configuration management for environment variables.

**Features**:

- Type-safe environment variable access
- Environment validation on startup
- Development/production mode detection

### 3. Search API Route (`app/api/search/route.ts`)

Server-side endpoint that handles search requests.

**Features**:

- GET and POST request handling
- Query parameter validation
- Multiple output formats (JSON, text)
- Error handling with proper HTTP status codes

**Request Flow**:

```
Client Request
    ↓
Parse query parameters
    ↓
Validate inputs
    ↓
Initialize YouSearchClient
    ↓
Call You.com API
    ↓
Format response
    ↓
Return to client
```

### 4. Health Check (`app/api/health/route.ts`)

Simple endpoint for monitoring and health checks.

### 5. Main Page (`app/page.tsx`)

Client-side React component with the search interface.

**Current Implementation** (392 lines - to be refactored):

- Search form with input and button
- Results display (visual and code views)
- Loading states (spinner and skeleton)
- Error handling and display
- Feature cards with example searches
- Floating search box for results page

**Planned Refactoring**:

- Extract into smaller components
- Move business logic to custom hooks
- Implement proper state management

## Data Flow

### Search Flow

1. **User Input**

   ```
   User enters query → SearchBox component → handleSearch()
   ```

2. **Client-Side Processing**

   ```
   Set loading state → Show skeleton loader → Fetch /api/search
   ```

3. **Server-Side Processing**

   ```
   API Route → Validate query → YouSearchClient → You.com API
   ```

4. **Response Handling**
   ```
   Parse JSON → Update state → Render results → Scroll to view
   ```

### Error Handling Flow

```
Error occurs
    ↓
Try/catch block
    ↓
Is it API error?
    ├─ Yes → Parse error response
    └─ No → Generic error handling
        ↓
    Set error state
        ↓
    Display error message to user
```

## Design Patterns

### 1. Client-Server Separation

- **Client Components**: Handle UI and user interactions
- **Server Components**: Handle data fetching and API calls
- **Benefits**: Better security (API key never exposed), improved performance

### 2. Environment Configuration Pattern

Centralized config with validation:

```typescript
export const config = {
  youApiKey: process.env.YOU_API_KEY,
  // ... other config
} as const;

export function validateEnv() {
  if (!config.youApiKey) {
    throw new Error('YOU_API_KEY is required');
  }
}
```

### 3. API Client Pattern

Encapsulation of external API interactions:

```typescript
class YouSearchClient {
  private apiKey: string;
  private static readonly BASE_URL = '...';

  constructor(apiKey: string) {}
  async search(query: string): Promise<SearchResponse> {}
}
```

## State Management

### Current Approach

Uses React's built-in state management:

- `useState` for local component state
- `useEffect` for side effects
- Props for component communication

### State Structure

```typescript
// Main page state
{
  searchQuery: string; // Current search query
  results: SearchAPIResponse | null; // Search results
  loading: boolean; // Loading indicator
  showSkeleton: boolean; // Skeleton loader
  error: string; // Error message
  currentView: 'visual' | 'code'; // View mode
  searchTime: number; // Performance metric
  hasSearched: boolean; // Has user searched
}
```

## Styling Architecture

### Current Approach

- Global CSS in `app/globals.css` (739 lines)
- CSS variables for design tokens
- BEM-like class naming convention

### Planned Migration to CSS Modules

```
styles/
├── variables.module.css      # Design tokens
├── layout.module.css         # Layout components
├── search.module.css         # Search components
├── results.module.css        # Results components
└── ui.module.css             # UI components
```

**Benefits**:

- Scoped styles prevent conflicts
- Better organization by feature
- Tree-shaking unused styles
- Type-safe class names

## API Design

### RESTful Principles

- **GET /api/search** - Retrieve search results
- **POST /api/search** - Alternative search method
- **GET /api/health** - Service health check

### Response Format

```typescript
{
  query: string;
  results: {
    results: {
      web?: SearchResult[];
      news?: SearchResult[];
    }
  }
}
```

### Error Format

```typescript
{
  error: string; // Error type
  message: string; // Human-readable message
  statusCode: number; // HTTP status code
  timestamp: string; // ISO timestamp
}
```

## Performance Considerations

### Current Optimizations

1. **Skeleton Loading**: Shows after 500ms to prevent flash
2. **Caching Disabled**: `revalidate: 0` for real-time data
3. **Client-Side Rendering**: Interactive UI components

### Planned Improvements

1. **Code Splitting**: Lazy load components
2. **Memoization**: React.memo for expensive components
3. **Caching Strategy**: Cache popular queries
4. **Image Optimization**: Next.js Image component for favicons
5. **Bundle Analysis**: Identify and reduce large dependencies

## Security

### Current Measures

1. **API Key Protection**: Stored in environment variables
2. **Server-Side API Calls**: API key never exposed to client
3. **Input Validation**: Query parameter validation

### Planned Improvements

1. **Rate Limiting**: Prevent API abuse
2. **Input Sanitization**: XSS prevention
3. **Content Security Policy**: HTTP security headers
4. **Error Boundaries**: Graceful error handling
5. **Dependency Scanning**: Automated security audits

## Testing Strategy (Planned)

### Unit Tests

- API client (`lib/you-search.ts`)
- Configuration (`lib/config.ts`)
- Utility functions

### Integration Tests

- API routes
- Component integration
- Search flow end-to-end

### Test Stack

- **Framework**: Vitest
- **Testing Library**: React Testing Library
- **Coverage**: 70%+ on critical paths

## Deployment Architecture

### Recommended: Vercel

```
GitHub Repository
    ↓
Automatic Deploy (on push to main)
    ↓
Vercel Edge Network
    ↓
Global CDN Distribution
```

### Environment Variables in Production

- Set via Vercel dashboard or CLI
- Separate values for preview/production
- Encrypted at rest

## Future Enhancements

### Phase 1: Refactoring (In Progress)

- Component extraction
- Custom hooks
- CSS Modules migration
- TypeScript strict mode

### Phase 2: Testing

- Vitest setup
- Unit test coverage
- Integration tests
- E2E tests (Playwright)

### Phase 3: Features

- Search history
- User preferences
- Dark mode
- Pagination
- Advanced filters

### Phase 4: Scale

- Caching layer (Redis)
- Rate limiting
- Analytics
- Monitoring (Sentry)

## Migration Notes

The project was migrated from Flask (Python) to Next.js (TypeScript). Key differences:

| Aspect     | Flask            | Next.js                 |
| ---------- | ---------------- | ----------------------- |
| Language   | Python 3.8+      | TypeScript 5.3          |
| Routing    | Blueprint-based  | File-based (App Router) |
| Templating | Jinja2           | React/JSX               |
| Styling    | Static CSS       | CSS/CSS Modules         |
| API Client | requests library | Fetch API               |

Legacy code is preserved in `legacy/` for reference.

## Conventions

### File Naming

- Components: PascalCase (e.g., `SearchBox.tsx`)
- Utilities: camelCase (e.g., `you-search.ts`)
- Styles: kebab-case (e.g., `search-box.module.css`)

### Code Style

- 2-space indentation
- Single quotes for strings
- Semicolons required
- 100-character line limit

### Git Workflow

- Feature branches: `feature/description`
- Bug fixes: `fix/description`
- Commits: Conventional Commits format

## Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [React Hooks Reference](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [You.com API Documentation](https://documentation.you.com/)
