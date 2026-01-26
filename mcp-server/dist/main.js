#!/usr/bin/env node
/**
 * YouSearch MCP Server - Entry Point
 *
 * Starts the MCP server with stdio transport for Claude Desktop integration
 */
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';
async function main() {
    const server = createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // Log to stderr so it doesn't interfere with stdio protocol
    console.error('YouSearch MCP server started');
}
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
