#!/usr/bin/env node
/**
 * YouSearch HTTP Server
 *
 * Simple REST API for web integration
 */

import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Search result types
 */
interface SearchResult {
  title: string;
  url: string;
  description?: string;
  snippets?: string[];
  favicon_url?: string;
  age?: string;
  page_age?: string;
}

interface SearchResponse {
  results: {
    web?: SearchResult[];
    news?: SearchResult[];
  };
}

/**
 * Demo mode mock results
 */
function getMockResults(query: string): SearchResponse {
  return {
    results: {
      web: [
        {
          title: `${query} - Wikipedia`,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query.replace(/\s+/g, '_'))}`,
          description: `This is a demo result for "${query}". Configure YOU_API_KEY for real search results.`,
          snippets: [
            `Demo snippet 1: Learn more about ${query} and related topics.`,
            `Demo snippet 2: This result is simulated for testing purposes.`,
          ],
          favicon_url: 'https://en.wikipedia.org/favicon.ico',
          age: 'Demo mode',
        },
        {
          title: `Understanding ${query} - A Complete Guide`,
          url: `https://example.com/guide/${encodeURIComponent(query)}`,
          description: `Comprehensive guide to ${query}. This is a mock result.`,
          snippets: [`Everything you need to know about ${query}.`],
          favicon_url: 'https://example.com/favicon.ico',
          age: '2 hours ago',
        },
        {
          title: `${query} Tutorial for Beginners`,
          url: `https://tutorial.example.com/${encodeURIComponent(query)}`,
          description: `Step-by-step tutorial on ${query}. Demo mode active.`,
          snippets: [`Getting started with ${query} is easier than you think.`],
          favicon_url: 'https://tutorial.example.com/favicon.ico',
          age: '1 day ago',
        },
        {
          title: `Latest News: ${query}`,
          url: `https://news.example.com/topic/${encodeURIComponent(query)}`,
          description: `Recent developments about ${query}.`,
          snippets: [`Breaking: New discoveries about ${query}.`],
          favicon_url: 'https://news.example.com/favicon.ico',
          age: '30 minutes ago',
        },
        {
          title: `${query} - Official Documentation`,
          url: `https://docs.example.com/${encodeURIComponent(query)}`,
          description: `Official documentation for ${query}.`,
          snippets: [`Full API reference for ${query}.`],
          favicon_url: 'https://docs.example.com/favicon.ico',
          age: '1 week ago',
        },
      ],
      news: [
        {
          title: `[DEMO] ${query} Makes Headlines`,
          url: `https://news.example.com/${encodeURIComponent(query)}`,
          description: `Demo news result. Set YOU_API_KEY for real news.`,
          age: 'Demo mode',
        },
      ],
    },
  };
}

/**
 * Search using You.com API or return mock results
 */
async function search(query: string): Promise<{ results: SearchResponse; demoMode: boolean }> {
  const apiKey = process.env.YOU_API_KEY;

  if (!apiKey) {
    return { results: getMockResults(query), demoMode: true };
  }

  const response = await fetch(
    `https://ydc-index.io/v1/search?query=${encodeURIComponent(query)}`,
    {
      headers: { 'X-API-Key': apiKey },
    }
  );

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return { results: await response.json(), demoMode: false };
}

/**
 * Format results as LLM-friendly text
 */
function formatResultsAsText(results: SearchResponse, demoMode: boolean): string {
  const formatted: string[] = [];

  if (demoMode) {
    formatted.push('=== DEMO MODE ===');
    formatted.push('No API key configured. Showing mock results.');
    formatted.push('Get a free API key at https://you.com/platform\n');
  }

  if (results.results?.web) {
    formatted.push('=== WEB SEARCH RESULTS ===\n');
    results.results.web.slice(0, 10).forEach((result, idx) => {
      formatted.push(`${idx + 1}. ${result.title || 'No title'}`);
      formatted.push(`   URL: ${result.url || ''}`);
      if (result.description) formatted.push(`   Description: ${result.description}`);
      if (result.snippets?.length) {
        formatted.push(`   Snippets:`);
        result.snippets.slice(0, 3).forEach((s) => formatted.push(`   - ${s}`));
      }
      formatted.push('');
    });
  }

  if (results.results?.news?.length) {
    formatted.push('\n=== NEWS RESULTS ===\n');
    results.results.news.slice(0, 5).forEach((result, idx) => {
      formatted.push(`${idx + 1}. ${result.title || 'No title'}`);
      formatted.push(`   URL: ${result.url || ''}`);
      if (result.description) formatted.push(`   Description: ${result.description}`);
      formatted.push('');
    });
  }

  return formatted.join('\n');
}

/**
 * CORS headers
 */
function setCorsHeaders(res: http.ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Send JSON response
 */
function sendJson(res: http.ServerResponse, data: unknown, status = 200) {
  setCorsHeaders(res);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

/**
 * Send text response
 */
function sendText(res: http.ServerResponse, text: string, status = 200) {
  setCorsHeaders(res);
  res.writeHead(status, { 'Content-Type': 'text/plain' });
  res.end(text);
}

/**
 * Send HTML response
 */
function sendHtml(res: http.ServerResponse, html: string, status = 200) {
  setCorsHeaders(res);
  res.writeHead(status, { 'Content-Type': 'text/html' });
  res.end(html);
}

/**
 * Create HTTP server
 */
function createHttpServer() {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const pathname = url.pathname;

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      setCorsHeaders(res);
      res.writeHead(204);
      res.end();
      return;
    }

    // Health check
    if (pathname === '/health' || pathname === '/api/health') {
      sendJson(res, {
        status: 'ok',
        demoMode: !process.env.YOU_API_KEY,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Search endpoint
    if (pathname === '/search' || pathname === '/api/search') {
      const query = url.searchParams.get('q') || url.searchParams.get('query');
      const format = url.searchParams.get('format') || 'json';

      if (!query) {
        sendJson(res, { error: 'Missing query parameter (q or query)' }, 400);
        return;
      }

      try {
        const { results, demoMode } = await search(query);

        if (format === 'text') {
          sendText(res, formatResultsAsText(results, demoMode));
        } else {
          sendJson(res, {
            query,
            demoMode,
            results,
          });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Search failed';
        sendJson(res, { error: message }, 500);
      }
      return;
    }

    // Serve UI at root
    if (pathname === '/' || pathname === '/index.html') {
      try {
        // Try dist first, then source
        let htmlPath = path.join(__dirname, 'mcp-app.html');
        if (!fs.existsSync(htmlPath)) {
          htmlPath = path.join(__dirname, '..', 'mcp-app.html');
        }

        // Read and modify HTML to work standalone
        let html = fs.readFileSync(htmlPath, 'utf-8');

        // Inject standalone script that doesn't require MCP host
        const standaloneScript = `
<script>
  // Override MCP app init for standalone mode
  window.STANDALONE_MODE = true;
  window.searchApi = async function(query) {
    const res = await fetch('/api/search?q=' + encodeURIComponent(query));
    return res.json();
  };
</script>`;
        html = html.replace('</head>', standaloneScript + '\n</head>');

        sendHtml(res, html);
      } catch {
        sendHtml(res, getDefaultHtml());
      }
      return;
    }

    // 404
    sendJson(res, { error: 'Not found' }, 404);
  });

  return server;
}

/**
 * Default HTML page when mcp-app.html not available
 */
function getDefaultHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YouSearch API</title>
  <style>
    :root {
      --bg: #0f0f0f;
      --text: #f5f5f5;
      --muted: #737373;
      --accent: #60a5fa;
      --border: #2a2a2a;
    }
    @media (prefers-color-scheme: light) {
      :root {
        --bg: #ffffff;
        --text: #1a1a1a;
        --muted: #6b7280;
        --accent: #3b82f6;
        --border: #e5e7eb;
      }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding: 2rem;
    }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { margin-bottom: 0.5rem; }
    .subtitle { color: var(--muted); margin-bottom: 2rem; }
    .search-box {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
    }
    input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg);
      color: var(--text);
      font-size: 1rem;
    }
    button {
      padding: 0.75rem 1.5rem;
      background: var(--accent);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
    }
    button:hover { opacity: 0.9; }
    .results { margin-top: 1rem; }
    .result {
      padding: 1rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    .result-title {
      color: var(--accent);
      text-decoration: none;
      font-weight: 600;
      display: block;
      margin-bottom: 0.25rem;
    }
    .result-title:hover { text-decoration: underline; }
    .result-url { color: var(--muted); font-size: 0.875rem; margin-bottom: 0.5rem; }
    .result-desc { color: var(--text); line-height: 1.5; }
    .demo-badge {
      display: inline-block;
      background: var(--accent);
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      margin-bottom: 1rem;
    }
    .api-info {
      margin-top: 2rem;
      padding: 1rem;
      background: var(--border);
      border-radius: 8px;
    }
    .api-info h3 { margin-bottom: 0.5rem; }
    .api-info code {
      display: block;
      padding: 0.5rem;
      background: var(--bg);
      border-radius: 4px;
      margin: 0.5rem 0;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>YouSearch</h1>
    <p class="subtitle">Search the web via REST API</p>

    <div class="search-box">
      <input type="text" id="query" placeholder="Search..." autofocus>
      <button onclick="doSearch()">Search</button>
    </div>

    <div id="results"></div>

    <div class="api-info">
      <h3>API Usage</h3>
      <code>GET /api/search?q=your+query</code>
      <code>GET /api/search?q=your+query&format=text</code>
      <code>GET /api/health</code>
    </div>
  </div>

  <script>
    const input = document.getElementById('query');
    const resultsDiv = document.getElementById('results');

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') doSearch();
    });

    async function doSearch() {
      const query = input.value.trim();
      if (!query) return;

      resultsDiv.innerHTML = '<p>Searching...</p>';

      try {
        const res = await fetch('/api/search?q=' + encodeURIComponent(query));
        const data = await res.json();

        let html = '';
        if (data.demoMode) {
          html += '<span class="demo-badge">DEMO MODE</span>';
        }

        const results = data.results?.results?.web || [];
        if (results.length === 0) {
          html += '<p>No results found.</p>';
        } else {
          results.forEach(r => {
            html += '<div class="result">';
            html += '<a href="' + escapeHtml(r.url) + '" target="_blank" class="result-title">' + escapeHtml(r.title) + '</a>';
            html += '<div class="result-url">' + escapeHtml(new URL(r.url).hostname) + '</div>';
            if (r.description) html += '<div class="result-desc">' + escapeHtml(r.description) + '</div>';
            html += '</div>';
          });
        }

        resultsDiv.innerHTML = html;
      } catch (err) {
        resultsDiv.innerHTML = '<p>Error: ' + err.message + '</p>';
      }
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  </script>
</body>
</html>`;
}

// Start server
const PORT = parseInt(process.env.PORT || '3001', 10);
const server = createHttpServer();

server.listen(PORT, () => {
  const demoMode = !process.env.YOU_API_KEY;
  console.log(`YouSearch HTTP server running at http://localhost:${PORT}`);
  if (demoMode) {
    console.log('Running in DEMO MODE (no API key)');
    console.log('Set YOU_API_KEY for real results: https://you.com/platform');
  }
  console.log('\nEndpoints:');
  console.log(`  GET /api/search?q=query     - Search (JSON)`);
  console.log(`  GET /api/search?q=query&format=text - Search (text)`);
  console.log(`  GET /api/health             - Health check`);
  console.log(`  GET /                       - Web UI`);
});
