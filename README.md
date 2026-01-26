# YouSearch

**Open-source search engine for humans and AI** — Real-time web results through a clean interface and LLM-ready API.

![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Why YouSearch?

| For Humans                        | For AI/LLMs                          | For Developers                  |
| --------------------------------- | ------------------------------------ | ------------------------------- |
| Clean, distraction-free search UI | Structured results for RAG pipelines | Simple REST API, no SDK needed  |
| Dark/light theme support          | LLM-optimized text format            | Self-hostable, full control     |
| Search history navigation         | Source URLs for citations            | TypeScript + Next.js 15         |
| Result previews and snippets      | Fresh, real-time data                | Production-ready out of the box |

## Quick Start

```bash
git clone https://github.com/yourusername/yousearch.git
cd yousearch
npm install
cp .env.example .env.local
# Add your API key to .env.local
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Get Your API Key

1. Go to [You.com Platform](https://you.com/platform)
2. Sign up and generate an API key
3. Add it to `.env.local`:

```env
YOU_API_KEY=your_api_key_here
```

## API Usage

### Search (JSON format)

```bash
curl "http://localhost:3000/api/search?q=latest+AI+news&format=json"
```

### Search (LLM-friendly text)

```bash
curl "http://localhost:3000/api/search?q=latest+AI+news&format=text"
```

### Response Structure

```json
{
  "query": "latest AI news",
  "results": {
    "results": {
      "web": [
        {
          "title": "Article Title",
          "url": "https://example.com/article",
          "description": "Article description...",
          "snippets": ["Relevant text excerpts..."],
          "favicon_url": "https://example.com/favicon.ico",
          "age": "2 hours ago"
        }
      ],
      "news": []
    }
  }
}
```

### Health Check

```bash
curl "http://localhost:3000/api/health"
```

## Features

### Search Interface

- **Real-time results** — Live data from You.com's search index
- **Rich result cards** — Favicons, reading time estimates, freshness badges
- **Search history** — Navigate between previous searches in your session
- **Result previews** — Expand results to see content snippets inline
- **Follow-up questions** — Ask contextual follow-up queries

### API Capabilities

- **Multiple formats** — JSON for parsing, text for LLM prompts
- **GET and POST** — Flexible request methods
- **Query parameters** — Support for `q` or `query` params
- **Error handling** — Clear error messages with appropriate status codes

### Developer Experience

- **TypeScript strict mode** — Full type safety
- **ESLint + Prettier** — Code quality enforced
- **Husky pre-commit** — Automatic formatting on commit
- **Modular architecture** — Clean component separation

## Project Structure

```
yousearch/
├── app/
│   ├── api/
│   │   ├── search/route.ts    # Search endpoint
│   │   └── health/route.ts    # Health check
│   ├── page.tsx               # Main search page
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Design tokens
├── components/
│   ├── search/                # Search UI components
│   ├── results/               # Result display components
│   ├── ui/                    # Shared UI components
│   └── layout/                # Header, theme toggle
├── lib/
│   ├── you-search.ts          # API client
│   ├── config.ts              # Environment config
│   └── theme-provider.tsx     # Theme context
└── docs/                      # Documentation
```

## Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Run production build
npm run lint         # Check code with ESLint
npm run format       # Format code with Prettier
npm run type-check   # Run TypeScript type checking
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add `YOU_API_KEY` environment variable
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Other Platforms

Any platform supporting Node.js 18+ works. Set `YOU_API_KEY` as environment variable.

## MCP Server (Claude Desktop)

YouSearch includes an MCP server for integration with Claude Desktop and other MCP-compliant hosts.

### Quick Setup

```bash
cd mcp-server
npm install
npm run build
```

### Configure Claude Desktop

Add to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "yousearch": {
      "command": "node",
      "args": ["/path/to/yousearch/mcp-server/dist/main.js"],
      "env": {
        "YOU_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Then use the `you_search` tool in Claude Desktop to search the web with rich, interactive results.

See [mcp-server/README.md](mcp-server/README.md) for full documentation.

## Use Cases

### RAG (Retrieval-Augmented Generation)

Fetch real-time web results to ground LLM responses with current information.

```python
import requests

def search_for_context(query):
    response = requests.get(
        "https://your-yousearch.com/api/search",
        params={"q": query, "format": "text"}
    )
    return response.text

context = search_for_context("latest developments in quantum computing")
# Use context in your LLM prompt
```

### Research Agents

Build autonomous agents that search the web for information.

### Custom Search Interfaces

Fork and customize the UI for your organization's needs.

## Documentation

- [Getting Started](docs/GETTING_STARTED.md) — Complete setup guide
- [Architecture](docs/ARCHITECTURE.md) — System design
- [API Reference](docs/API.md) — Endpoint documentation
- [Contributing](docs/CONTRIBUTING.md) — How to contribute
- [Alignment](ALIGNMENT.md) — Project goals and values

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes following code style
4. Run: `npm run format && npm run lint && npm run type-check`
5. Commit and push
6. Open a Pull Request

## License

MIT License — see [LICENSE](LICENSE) for details.

## Acknowledgments

- [You.com](https://you.com) for the Search API
- Built with [Next.js](https://nextjs.org), [React](https://react.dev), and [TypeScript](https://typescriptlang.org)

---

**Questions?** Open an [issue](https://github.com/yourusername/yousearch/issues) or check the [documentation](docs/).
