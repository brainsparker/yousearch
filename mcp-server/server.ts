/**
 * YouSearch MCP Server
 *
 * Provides a You.com search tool with rich UI for MCP-compliant hosts
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Individual search result item
 */
export interface SearchResult {
  title: string;
  url: string;
  description?: string;
  snippets?: string[];
  favicon_url?: string;
  age?: string;
  page_age?: string;
  thumbnail_url?: string;
}

/**
 * Search API response structure
 */
export interface SearchResponse {
  results: {
    web?: SearchResult[];
    news?: SearchResult[];
  };
}

/**
 * You.com Search API client
 */
class YouSearchClient {
  private static readonly BASE_URL = 'https://ydc-index.io/v1/search';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.YOU_API_KEY || '';
    if (!this.apiKey) {
      throw new Error(
        'API key is required. Set YOU_API_KEY environment variable or pass api_key parameter'
      );
    }
  }

  async search(query: string, numResults: number = 10): Promise<SearchResponse> {
    const headers = {
      'X-API-Key': this.apiKey,
    };

    const params = new URLSearchParams({
      query,
    });

    const response = await fetch(`${YouSearchClient.BASE_URL}?${params.toString()}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  }

  formatResultsForLLM(results: SearchResponse): string {
    const formatted: string[] = [];

    if (results.results?.web) {
      const webResults = results.results.web;
      formatted.push('=== WEB SEARCH RESULTS ===\n');

      webResults.slice(0, 10).forEach((result, idx) => {
        const title = result.title || 'No title';
        const url = result.url || '';
        const description = result.description || '';
        const snippets = result.snippets || [];

        formatted.push(`${idx + 1}. ${title}`);
        formatted.push(`   URL: ${url}`);
        if (description) {
          formatted.push(`   Description: ${description}`);
        }
        if (snippets.length > 0) {
          formatted.push(`   Snippets:`);
          snippets.slice(0, 3).forEach((snippet) => {
            formatted.push(`   - ${snippet}`);
          });
        }
        formatted.push('');
      });
    }

    if (results.results?.news && results.results.news.length > 0) {
      const newsResults = results.results.news;
      formatted.push('\n=== NEWS RESULTS ===\n');

      newsResults.slice(0, 5).forEach((result, idx) => {
        const title = result.title || 'No title';
        const url = result.url || '';
        const description = result.description || '';

        formatted.push(`${idx + 1}. ${title}`);
        formatted.push(`   URL: ${url}`);
        if (description) {
          formatted.push(`   Description: ${description}`);
        }
        formatted.push('');
      });
    }

    return formatted.join('\n');
  }
}

// Store last search results for UI
let lastSearchResults: SearchResponse | null = null;
let lastSearchQuery: string = '';

/**
 * Create and configure the MCP server
 */
export function createServer(): Server {
  const server = new Server(
    {
      name: 'yousearch',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // Register tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'you_search',
          description:
            'Search the web using You.com Search API. Returns web results with titles, URLs, descriptions, and snippets.',
          inputSchema: {
            type: 'object' as const,
            properties: {
              query: {
                type: 'string',
                description: 'The search query',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results to return (default: 10)',
                default: 10,
              },
            },
            required: ['query'],
          },
        },
      ],
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name !== 'you_search') {
      throw new Error(`Unknown tool: ${request.params.name}`);
    }

    const args = request.params.arguments as { query: string; limit?: number };
    const query = args.query;
    const limit = args.limit || 10;

    try {
      const client = new YouSearchClient();
      const results = await client.search(query, limit);

      // Store results for UI
      lastSearchResults = results;
      lastSearchQuery = query;

      // Format for LLM consumption
      const textContent = client.formatResultsForLLM(results);

      // Count results
      const webCount = results.results?.web?.length || 0;
      const newsCount = results.results?.news?.length || 0;

      return {
        content: [
          {
            type: 'text',
            text: textContent,
          },
        ],
        _meta: {
          ui: {
            resourceUri: 'ui://yousearch/results.html',
          },
          resultCount: {
            web: webCount,
            news: newsCount,
          },
        },
        isError: false,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [
          {
            type: 'text',
            text: `Error searching You.com: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  });

  // Register resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        {
          uri: 'ui://yousearch/results.html',
          name: 'YouSearch Results UI',
          description: 'Interactive search results view',
          mimeType: 'text/html;profile=mcp-app',
        },
      ],
    };
  });

  // Handle resource reads
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    if (request.params.uri === 'ui://yousearch/results.html') {
      // Read the bundled HTML file
      const htmlPath = path.join(__dirname, 'mcp-app.html');
      let htmlContent: string;

      try {
        htmlContent = fs.readFileSync(htmlPath, 'utf-8');
      } catch {
        // Fallback to source if dist doesn't exist (dev mode)
        const srcPath = path.join(__dirname, '..', 'mcp-app.html');
        htmlContent = fs.readFileSync(srcPath, 'utf-8');
      }

      return {
        contents: [
          {
            uri: request.params.uri,
            mimeType: 'text/html;profile=mcp-app',
            text: htmlContent,
          },
        ],
      };
    }

    // Resource for getting current results (for UI to fetch)
    if (request.params.uri === 'ui://yousearch/results.json') {
      return {
        contents: [
          {
            uri: request.params.uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              query: lastSearchQuery,
              results: lastSearchResults,
            }),
          },
        ],
      };
    }

    throw new Error(`Unknown resource: ${request.params.uri}`);
  });

  return server;
}
