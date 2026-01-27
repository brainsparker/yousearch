# YouSearch MCP Server

MCP (Model Context Protocol) server for You.com search with a rich, interactive UI that renders inline in MCP-compliant hosts like Claude Desktop.

## Features

- **Web Search Tool**: Search the web using You.com's Search API
- **Demo Mode**: Works without API key using mock results for testing
- **Rich UI**: Interactive search results view with follow-up search capability
- **Dark/Light Theme**: Automatically adapts to host theme
- **Result Cards**: Traditional search layout with favicons, reading time estimates, and preview toggles

## Setup

### 1. Install Dependencies

```bash
cd mcp-server
npm install
```

### 2. Build

```bash
npm run build
```

### 3. Configure Claude Desktop

Add to your Claude Desktop MCP configuration (`~/.config/claude-desktop/mcp.json` on macOS/Linux or `%APPDATA%\Claude\mcp.json` on Windows):

**Without API key (demo mode):**

```json
{
  "mcpServers": {
    "yousearch": {
      "command": "node",
      "args": ["/path/to/yousearch/mcp-server/dist/main.js"]
    }
  }
}
```

**With API key (real results):**

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

Replace `/path/to/yousearch` with the actual path to your YouSearch project directory.

### 4. Get a You.com API Key (Optional)

For real search results:

1. Visit [you.com/platform](https://you.com/platform)
2. Sign up or log in
3. Create an API key
4. Add it to your MCP configuration

Without an API key, the server runs in **demo mode** with mock results - perfect for testing the UI and integration.

## Usage

### Claude Desktop (MCP)

Once configured, you can use the `you_search` tool in Claude Desktop:

```
Search for "latest React documentation"
```

Claude will display the search results in an interactive UI within the conversation.

### Web / REST API

Start the HTTP server for web integration:

```bash
npm run start:http
```

The server runs at `http://localhost:3001` by default (set `PORT` env var to change).

**Endpoints:**

```bash
# Search (JSON response)
curl "http://localhost:3001/api/search?q=react+hooks"

# Search (text response for LLMs)
curl "http://localhost:3001/api/search?q=react+hooks&format=text"

# Health check
curl "http://localhost:3001/api/health"

# Web UI
open http://localhost:3001
```

**Response format:**

```json
{
  "query": "react hooks",
  "demoMode": false,
  "results": {
    "results": {
      "web": [
        {
          "title": "React Hooks Documentation",
          "url": "https://react.dev/reference/react",
          "description": "...",
          "snippets": ["..."],
          "favicon_url": "...",
          "age": "2 hours ago"
        }
      ],
      "news": []
    }
  }
}
```

**With API key:**

```bash
YOU_API_KEY=your-key npm run start:http
```

## Development

### Build Commands

- `npm run build` - Build both server and UI
- `npm run build:server` - Build server TypeScript only
- `npm run build:ui` - Build UI with Vite
- `npm run dev` - Watch mode for MCP server
- `npm run dev:http` - Watch mode for HTTP server
- `npm run start` - Start MCP server (stdio)
- `npm run start:http` - Start HTTP server (REST API)

### Project Structure

```
mcp-server/
├── server.ts           # MCP server with tool + resource registration
├── main.ts             # MCP entry point (stdio transport)
├── http-server.ts      # HTTP/REST API server
├── mcp-app.html        # HTML shell for UI
├── src/
│   ├── mcp-app.ts      # View code (App SDK connection)
│   ├── search-ui.ts    # Search results rendering logic
│   └── styles.css      # Search results styling
└── dist/               # Build output
```

## Tool Schema

### `you_search`

Search the web using You.com Search API.

**Input:**

```json
{
  "query": "string (required) - The search query",
  "limit": "number (optional) - Maximum results (default: 10)"
}
```

**Output:**

- Text content formatted for LLM consumption
- Rich UI resource for interactive display

## License

MIT
