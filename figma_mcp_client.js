#!/usr/bin/env node

const http = require('http');
const { Agent } = require('http');

const MCP_URL = 'http://127.0.0.1:3845/mcp';

let requestId = 0;
const agent = new Agent({ keepAlive: true });

function makeRequest(method, params = null) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      jsonrpc: '2.0',
      id: ++requestId,
      method: method,
      ...(params && { params })
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Accept': 'application/json, text/event-stream',
        'Connection': 'keep-alive'
      },
      agent: agent
    };

    const req = http.request(MCP_URL, options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        // Parse SSE format
        if (body.includes('data: ')) {
          const lines = body.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonData = JSON.parse(line.substring(6));
                resolve(jsonData);
                return;
              } catch (e) {
                // Continue to next line
              }
            }
          }
        }

        // Try parsing as regular JSON
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ raw: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Helper to wait between requests
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  try {
    // Initialize connection
    console.log('=== Initializing MCP Connection ===');
    const initResult = await makeRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'claude-code-client',
        version: '1.0.0'
      }
    });
    console.log(JSON.stringify(initResult, null, 2));
    console.log();

    // Send initialized notification (no response expected)
    console.log('=== Sending initialized notification ===');
    const initializedNotification = await makeRequest('notifications/initialized');
    console.log(JSON.stringify(initializedNotification, null, 2));
    console.log();

    // Wait a bit for initialization
    await wait(100);

    // List tools
    console.log('=== Listing Available Tools ===');
    const toolsResult = await makeRequest('tools/list');
    console.log(JSON.stringify(toolsResult, null, 2));
    console.log();

    if (toolsResult.result && toolsResult.result.tools) {
      const tools = toolsResult.result.tools;
      console.log(`Found ${tools.length} tools:`);
      tools.forEach(tool => {
        console.log(`\n  - ${tool.name}`);
        console.log(`    Description: ${tool.description || 'No description'}`);
        if (tool.inputSchema) {
          console.log(`    Input Schema:`);
          console.log(JSON.stringify(tool.inputSchema, null, 6));
        }
      });

      // Call each tool to get design specs
      console.log('\n\n=== Calling Tools to Get Design Specifications ===');
      for (const tool of tools) {
        console.log(`\n--- Calling: ${tool.name} ---`);
        try {
          const result = await makeRequest('tools/call', {
            name: tool.name,
            arguments: {}
          });
          console.log(JSON.stringify(result, null, 2));
        } catch (error) {
          console.log(`Error calling ${tool.name}: ${error.message}`);
        }
      }
    }

    // List resources
    console.log('\n\n=== Listing Available Resources ===');
    const resourcesResult = await makeRequest('resources/list');
    console.log(JSON.stringify(resourcesResult, null, 2));

    if (resourcesResult.result && resourcesResult.result.resources) {
      const resources = resourcesResult.result.resources;
      console.log(`\nFound ${resources.length} resources:`);
      resources.forEach(resource => {
        console.log(`\n  - URI: ${resource.uri}`);
        console.log(`    Name: ${resource.name || 'N/A'}`);
        console.log(`    Description: ${resource.description || 'N/A'}`);
        console.log(`    MIME Type: ${resource.mimeType || 'N/A'}`);
      });

      // Try to read the first resource if available
      if (resources.length > 0) {
        console.log('\n\n=== Reading First Resource ===');
        try {
          const resourceData = await makeRequest('resources/read', {
            uri: resources[0].uri
          });
          console.log(JSON.stringify(resourceData, null, 2));
        } catch (error) {
          console.log(`Error reading resource: ${error.message}`);
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
