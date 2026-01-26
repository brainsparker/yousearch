/**
 * YouSearch MCP Server
 *
 * Provides a You.com search tool with rich UI for MCP-compliant hosts
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
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
 * Create and configure the MCP server
 */
export declare function createServer(): Server;
