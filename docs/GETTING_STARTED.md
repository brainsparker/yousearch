# Getting Started with YouSearch

This guide will help you set up and run YouSearch on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)
- **You.com API Key** ([Get one here](https://api.you.com/))

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/yousearch.git
cd yousearch
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, React, TypeScript, and development tools.

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your You.com API key:

```env
YOU_API_KEY=your_actual_api_key_here
NODE_ENV=development
```

**Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

### 4. Run the Development Server

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000).

## Project Structure

```
yousearch/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   │   ├── search/
│   │   │   └── route.ts    # Search endpoint
│   │   └── health/
│   │       └── route.ts    # Health check
│   ├── page.tsx            # Main search page
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── lib/                     # Utilities and shared code
│   ├── you-search.ts       # You.com API client
│   └── config.ts           # Configuration management
├── docs/                    # Documentation
├── legacy/                  # Archived Flask code (reference only)
├── .eslintrc.json          # ESLint configuration
├── .prettierrc             # Prettier configuration
├── tsconfig.json           # TypeScript configuration
├── next.config.js          # Next.js configuration
└── package.json            # Dependencies and scripts
```

## Available Commands

### Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

### Code Quality

```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check   # Run TypeScript type checking
```

### Testing

```bash
npm test             # Run tests (once Vitest is set up)
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
```

## Using the Application

### Web Interface

1. Open [http://localhost:3000](http://localhost:3000)
2. Enter your search query in the search box
3. Click the search button or press Enter
4. View results in Visual or Code format

### API Usage

#### Search Endpoint

```bash
# JSON format
curl "http://localhost:3000/api/search?q=Next.js+tutorials&format=json"

# Text format (LLM-friendly)
curl "http://localhost:3000/api/search?q=Next.js+tutorials&format=text"
```

#### POST Request

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Next.js tutorials", "format": "json"}'
```

#### Health Check

```bash
curl http://localhost:3000/api/health
```

## Configuration

### Environment Variables

- `YOU_API_KEY` - Your You.com API key (required)
- `NODE_ENV` - Environment: development, production, or test

### TypeScript Configuration

The project uses strict TypeScript settings. See `tsconfig.json` for details.

### ESLint & Prettier

Code quality is enforced through:

- ESLint for code linting
- Prettier for code formatting
- Husky for pre-commit hooks
- lint-staged for staged file processing

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
npm run dev -- -p 3001
```

### API Key Errors

If you see "API key is required":

1. Check that `.env.local` exists
2. Verify `YOU_API_KEY` is set correctly
3. Restart the development server

### TypeScript Errors

Run type checking to see all errors:

```bash
npm run type-check
```

### Module Not Found

If you see module errors after cloning:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- Read the [Architecture Guide](ARCHITECTURE.md) to understand the system
- Check out the [API Documentation](API.md) for endpoint details
- See [Contributing Guidelines](CONTRIBUTING.md) to contribute
- Review the [Deployment Guide](DEPLOYMENT.md) for production deployment

## Getting Help

- **Issues**: Report bugs on [GitHub Issues](https://github.com/yourusername/yousearch/issues)
- **API Documentation**: [You.com API Docs](https://documentation.you.com/)
- **Community**: Join discussions in GitHub Discussions

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [You.com API](https://api.you.com/)
