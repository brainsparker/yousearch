/**
 * YouSearch MCP Server
 *
 * Provides a You.com search tool with rich UI for MCP-compliant hosts
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * Demo mode mock results
 */
function getMockResults(query) {
    return {
        results: {
            web: [
                {
                    title: `${query} - Wikipedia`,
                    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query.replace(/\s+/g, '_'))}`,
                    description: `This is a demo result for "${query}". Configure YOU_API_KEY for real search results from You.com.`,
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
                    description: `Comprehensive guide to ${query}. This is a mock result - set YOU_API_KEY for real results.`,
                    snippets: [`Everything you need to know about ${query}.`],
                    favicon_url: 'https://example.com/favicon.ico',
                    age: '2 hours ago',
                },
                {
                    title: `${query} Tutorial for Beginners`,
                    url: `https://tutorial.example.com/${encodeURIComponent(query)}`,
                    description: `Step-by-step tutorial on ${query}. Demo mode is active - real results require an API key.`,
                    snippets: [
                        `Getting started with ${query} is easier than you think.`,
                        `Follow along with practical examples.`,
                    ],
                    favicon_url: 'https://tutorial.example.com/favicon.ico',
                    age: '1 day ago',
                },
                {
                    title: `Latest News: ${query}`,
                    url: `https://news.example.com/topic/${encodeURIComponent(query)}`,
                    description: `Recent developments and news about ${query}. Running in demo mode without API key.`,
                    snippets: [`Breaking: New discoveries about ${query} announced today.`],
                    favicon_url: 'https://news.example.com/favicon.ico',
                    age: '30 minutes ago',
                },
                {
                    title: `${query} - Official Documentation`,
                    url: `https://docs.example.com/${encodeURIComponent(query)}`,
                    description: `Official documentation and reference for ${query}. Get a free API key at you.com/platform for real results.`,
                    snippets: [
                        `Full API reference for ${query}.`,
                        `Code examples and best practices included.`,
                    ],
                    favicon_url: 'https://docs.example.com/favicon.ico',
                    age: '1 week ago',
                },
            ],
            news: [
                {
                    title: `[DEMO] ${query} Makes Headlines`,
                    url: `https://news.example.com/${encodeURIComponent(query)}`,
                    description: `This is a demo news result. Set YOU_API_KEY environment variable for real news from You.com.`,
                    age: 'Demo mode',
                },
            ],
        },
    };
}
/**
 * You.com Search API client
 */
class YouSearchClient {
    static BASE_URL = 'https://ydc-index.io/v1/search';
    apiKey;
    demoMode;
    constructor(apiKey) {
        this.apiKey = apiKey || process.env.YOU_API_KEY || '';
        this.demoMode = !this.apiKey;
    }
    isDemoMode() {
        return this.demoMode;
    }
    async search(query, numResults = 10) {
        // Return mock results if no API key
        if (this.demoMode) {
            return getMockResults(query);
        }
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
    formatResultsForLLM(results) {
        const formatted = [];
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
let lastSearchResults = null;
let lastSearchQuery = '';
/**
 * Create and configure the MCP server
 */
export function createServer() {
    const server = new Server({
        name: 'yousearch',
        version: '1.0.0',
    }, {
        capabilities: {
            tools: {},
            resources: {},
        },
    });
    // Check if running in demo mode
    const demoMode = !process.env.YOU_API_KEY;
    // Register tools
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
            tools: [
                {
                    name: 'you_search',
                    description: demoMode
                        ? 'Search the web (DEMO MODE - returns mock results). Set YOU_API_KEY for real results from You.com.'
                        : 'Search the web using You.com Search API. Returns web results with titles, URLs, descriptions, and snippets.',
                    inputSchema: {
                        type: 'object',
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
        const args = request.params.arguments;
        const query = args.query;
        const limit = args.limit || 10;
        try {
            const client = new YouSearchClient();
            const results = await client.search(query, limit);
            // Store results for UI
            lastSearchResults = results;
            lastSearchQuery = query;
            // Format for LLM consumption
            let textContent = client.formatResultsForLLM(results);
            // Add demo mode notice
            if (client.isDemoMode()) {
                textContent =
                    '=== DEMO MODE ===\nNo API key configured. Showing mock results.\nGet a free API key at https://you.com/platform\n\n' +
                        textContent;
            }
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
                    demoMode: client.isDemoMode(),
                },
                isError: false,
            };
        }
        catch (error) {
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
            let htmlContent;
            try {
                htmlContent = fs.readFileSync(htmlPath, 'utf-8');
            }
            catch {
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
