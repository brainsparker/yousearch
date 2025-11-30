# YouSearch

> Open-source AI search engine powered by You.com's Search API

![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Quick Start

```bash
npm install
cp .env.example .env.local
# Add YOUR_API_KEY to .env.local
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Features

- **Real-time Web Search** - Access fresh data via You.com's Search API
- **Multiple Output Formats** - Visual results, JSON, and LLM-friendly text
- **Modern Stack** - Built with Next.js 15, React 18, and TypeScript
- **Production-Ready** - ESLint, Prettier, and testing configured
- **Developer-Friendly** - Clean codebase with comprehensive documentation

## Documentation

- [Getting Started](docs/GETTING_STARTED.md) - Complete setup guide
- [API Documentation](docs/API.md) - API endpoints and usage
- [Architecture Guide](docs/ARCHITECTURE.md) - System design and patterns
- [Deployment Guide](docs/DEPLOYMENT.md) - Deploy to production
- [Contributing Guidelines](docs/CONTRIBUTING.md) - How to contribute

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.3
- **UI Library**: React 18
- **Styling**: CSS Modules
- **Testing**: Vitest
- **Code Quality**: ESLint, Prettier, Husky

## API Endpoints

### Search

```bash
GET /api/search?q=your+query&format=json
```

### Health Check

```bash
GET /api/health
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## Environment Variables

Create a `.env.local` file:

```env
YOU_API_KEY=your_api_key_here
```

Get your API key at [You.com Platform](https://you.com/platform)

## Project Structure

```
yousearch/
├── app/                  # Next.js App Router
│   ├── api/             # API routes
│   ├── page.tsx         # Main page
│   └── layout.tsx       # Root layout
├── lib/                 # Utilities and API client
├── docs/                # Documentation
├── legacy/              # Archived Flask code
└── ...
```

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](docs/CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [You.com](https://you.com) for providing the Search API
- Built with Next.js, React, and TypeScript
- Inspired by the need for better LLM grounding

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/yousearch/issues)
- **API Key**: [You.com Platform](https://you.com/platform)
- **Documentation**: [You.com API Docs](https://documentation.you.com/)

---

Built with ❤️ for the AI community
