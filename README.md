# YouSearch — Build Your Own Search Engine

> Fork it. Add your API key. Deploy in 5 minutes.

[![Deploy with Vercel](https://vercel.com/button)](<https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fyousearch&env=YOU_API_KEY&envDescription=You.com%20API%20key%20(free%20at%20you.com%2Fplatform)&project-name=yousearch>)

![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Quick Start

```bash
# 1. Clone & install
git clone https://github.com/yourusername/yousearch.git
cd yousearch && npm install

# 2. Add your API key
cp .env.example .env.local
# Edit .env.local and add your key

# 3. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Get Your API Key

1. Go to [you.com/platform](https://you.com/platform)
2. Sign up and generate an API key — **$100 in free credits included**
3. Add to `.env.local`:

```env
YOU_API_KEY=your_api_key_here
```

## What's Inside

- **Web + news search** with freshness, country, and SafeSearch filters
- **Dark/light theme** with system preference detection
- **JSON + LLM-friendly text API** for AI integrations
- **TypeScript, Next.js 15** — zero external UI dependencies

## API Usage

### JSON format

```bash
curl "http://localhost:3000/api/search?q=latest+AI+news&format=json"
```

### LLM-friendly text

```bash
curl "http://localhost:3000/api/search?q=latest+AI+news&format=text"
```

### With filters

```bash
curl "http://localhost:3000/api/search?q=AI&freshness=week&country=US&safesearch=moderate"
```

### Response structure

```json
{
  "query": "latest AI news",
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
  },
  "metadata": {
    "search_uuid": "...",
    "query": "latest AI news",
    "latency": 342
  }
}
```

## You.com Search API Features Used

| Parameter    | What it does              | How the template uses it         |
| ------------ | ------------------------- | -------------------------------- |
| `query`      | Search query string       | Main search input                |
| `count`      | Number of results (1-100) | Configurable via API             |
| `freshness`  | Filter by time period     | Dropdown: day/week/month/year    |
| `country`    | ISO 3166 country code     | Dropdown: US, UK, CA, DE, FR, JP |
| `safesearch` | Content filtering level   | Dropdown: off/moderate/strict    |
| `offset`     | Pagination offset (0-9)   | Configurable via API             |

## Customization

### Theming

Edit CSS variables in `app/globals.css` — colors, spacing, shadows, and typography tokens.

### Branding

Update `components/layout/Header.tsx` to change the logo and navigation.

### Filters

Add or modify filter options in `components/search/SearchFilters.tsx`.

## Project Structure

```
yousearch/
├── app/
│   ├── api/search/route.ts    # Search API endpoint
│   ├── page.tsx               # Main search page
│   ├── layout.tsx             # Root layout + metadata
│   └── globals.css            # Design tokens
├── components/
│   ├── search/                # SearchInput, SearchResults, SearchFilters
│   ├── results/               # ResultCard, ResultMeta
│   ├── ui/                    # Loading, EmptyState, ErrorBanner
│   └── layout/                # Header, ThemeToggle
└── lib/
    ├── you-search.ts          # You.com API client
    ├── config.ts              # Environment config
    └── theme-provider.tsx     # Theme context
```

## Deploy

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](<https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fyousearch&env=YOU_API_KEY&envDescription=You.com%20API%20key%20(free%20at%20you.com%2Fplatform)&project-name=yousearch>)

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

### Any Node.js 18+ host

Set `YOU_API_KEY` as an environment variable. Run `npm run build && npm start`.

## Learn More

- [You.com API Docs](https://docs.you.com) — Full API reference
- [@youdotcom-oss/sdk](https://www.npmjs.com/package/@youdotcom-oss/sdk) — Official SDK
- [You.com MCP Server](https://github.com/nichochar/you-mcp) — Official MCP server for Claude

## License

MIT — see [LICENSE](LICENSE) for details.
