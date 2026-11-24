# YouSearch — Build Your Own Search Engine

> Fork it. Run it. No API key needed to start.

[![Deploy with Vercel](https://vercel.com/button)](<https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fyousearch&env=YOU_API_KEY&envDescription=You.com%20API%20key%20(free%20at%20you.com%2Fplatform)&project-name=yousearch>)

![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Quick Start

```bash
# 1. Clone & install
git clone https://github.com/yourusername/yousearch.git
cd yousearch && npm install

# 2. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and search. That's it.

With no API key, YouSearch runs on You.com's keyless free tier. Search and "Read page" both work out of the box. The free tier is rate limited (You.com documents 100 queries per day on its keyless MCP endpoint), so it is for trying things out, not for production traffic.

## Add Your API Key (Optional)

Add a key when you want higher limits or are deploying for real users:

1. Go to [you.com/platform](https://you.com/platform)
2. Sign up and generate an API key (new accounts start with free credits)
3. Add it to `.env.local` and restart the dev server:

```env
YOU_API_KEY=your_api_key_here
```

|           | No key (keyless)                             | With `YOU_API_KEY` (keyed)     |
| --------- | -------------------------------------------- | ------------------------------ |
| Search    | `GET api.you.com/v1/agents/search`           | `GET ydc-index.io/v1/search`   |
| Read page | `you-extract` tool on `api.you.com/mcp/free` | `POST ydc-index.io/v1/extract` |
| Limits    | Rate limited free tier                       | Your account's limits          |

`GET /api/health` reports which mode a deployment is in, and every search and extract response carries it in the `X-YouSearch-Mode` header.

## What's Inside

- **Zero-key start**: works without an API key on You.com's keyless free tier
- **Web + news search** with freshness, country, and SafeSearch filters
- **Read page**: open any result as clean Markdown, powered by the You.com Extract API (webpages and PDFs)
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

### Read a page as Markdown

```bash
# JSON: { url, title, markdown, extraction_source, mode }
curl "http://localhost:3000/api/extract?url=https://example.com"

# Plain Markdown, ready to paste into a prompt
curl "http://localhost:3000/api/extract?url=https://example.com&format=markdown"
```

### With filters

```bash
curl "http://localhost:3000/api/search?q=AI&freshness=week&country=US&safesearch=moderate"
```

### Response structure

```json
{
  "query": "latest AI news",
  "mode": "keyless",
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

"Read page" uses the [Extract API](https://you.com/docs/guides/extract), which takes one URL and returns the full page or PDF as Markdown. In the UI, click **Read page** on a result, or select it with `j`/`k` and press `r`.

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
│   ├── api/extract/route.ts   # Read-a-page endpoint (Extract API)
│   ├── page.tsx               # Main search page
│   ├── layout.tsx             # Root layout + metadata
│   └── globals.css            # Design tokens
├── components/
│   ├── search/                # SearchInput, SearchResults, SearchFilters
│   ├── results/               # ResultCard, ResultMeta
│   ├── ui/                    # Loading, EmptyState, ErrorBanner
│   └── layout/                # Header, ThemeToggle
└── lib/
    ├── you-search.ts          # You.com Search API client (keyed + keyless)
    ├── you-extract.ts         # You.com Extract API client (keyed + keyless)
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

Run `npm run build && npm start`. Set `YOU_API_KEY` as an environment variable for production traffic. Without it the deployment runs on the rate-limited keyless free tier, and every visitor shares that limit.

`/api/search` and `/api/extract` are open endpoints that spend your quota. If you deploy with a key, put your own auth or rate limiting in front of them.

## Tests

```bash
npm test
```

Unit tests cover both clients in keyed and keyless mode with `fetch` stubbed, so they need no network and no key. They use Node's built-in test runner and import the TypeScript sources directly, which needs Node 22.18 or newer.

## Learn More

- [You.com API Docs](https://you.com/docs): full API reference
- [Extract API guide](https://you.com/docs/guides/extract): parameters, errors, and pricing for page and PDF extraction
- [You.com MCP Server](https://you.com/docs/developer-resources/mcp-server): hosted MCP server, including the keyless endpoint this template falls back to

## License

MIT — see [LICENSE](LICENSE) for details.
