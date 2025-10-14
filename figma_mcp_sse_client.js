#!/usr/bin/env node

const http = require('http');
const { URL } = require('url');

const MCP_URL = 'http://127.0.0.1:3845/mcp';
const url = new URL(MCP_URL);

let requestId = 0;
const pendingRequests = new Map();

// Create a persistent connection for SSE
const options = {
  hostname: url.hostname,
  port: url.port,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  }
};

let responseBuffer = '';
let currentConnection = null;

function sendMessage(message) {
  if (!currentConnection) {
    throw new Error('Not connected');
  }
  currentConnection.write(JSON.stringify(message) + '\n');
}

function connect() {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log('Connected to MCP server');
      console.log('Status:', res.statusCode);
      console.log('Headers:', JSON.stringify(res.headers, null, 2));
      console.log();

      res.setEncoding('utf8');

      res.on('data', (chunk) => {
        responseBuffer += chunk;

        // Process complete SSE messages
        const lines = responseBuffer.split('\n');
        responseBuffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            try {
              const message = JSON.parse(data);
              console.log('Received:', JSON.stringify(message, null, 2));
              console.log();

              // Resolve pending request
              if (message.id && pendingRequests.has(message.id)) {
                const resolver = pendingRequests.get(message.id);
                pendingRequests.delete(message.id);
                resolver(message);
              }
            } catch (e) {
              console.error('Failed to parse message:', data);
            }
          } else if (line.startsWith('event: ')) {
            console.log('Event:', line.substring(7));
          } else if (line.trim()) {
            console.log('Line:', line);
          }
        }
      });

      res.on('end', () => {
        console.log('Connection closed');
        currentConnection = null;
      });

      res.on('error', (error) => {
        console.error('Response error:', error);
        reject(error);
      });

      resolve(req);
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });

    currentConnection = req;
  });
}

function makeRequest(method, params = null) {
  return new Promise((resolve, reject) => {
    const id = ++requestId;
    const message = {
      jsonrpc: '2.0',
      id: id,
      method: method,
      ...(params && { params })
    };

    pendingRequests.set(id, resolve);

    console.log('Sending:', JSON.stringify(message, null, 2));
    console.log();

    try {
      sendMessage(message);
    } catch (error) {
      pendingRequests.delete(id);
      reject(error);
    }

    // Timeout after 10 seconds
    setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        reject(new Error('Request timeout'));
      }
    }, 10000);
  });
}

async function main() {
  try {
    // Connect to server
    await connect();

    // Wait a bit for connection
    await new Promise(resolve => setTimeout(resolve, 500));

    // Initialize
    console.log('=== Initializing ===');
    const initResult = await makeRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'claude-code-sse',
        version: '1.0.0'
      }
    });

    // List tools
    console.log('=== Listing Tools ===');
    const toolsResult = await makeRequest('tools/list');

    if (toolsResult.result && toolsResult.result.tools) {
      const tools = toolsResult.result.tools;
      console.log(`\nFound ${tools.length} tools:`);
      for (const tool of tools) {
        console.log(`\n  - ${tool.name}: ${tool.description || 'No description'}`);

        // Call the tool
        console.log(`    Calling ${tool.name}...`);
        const result = await makeRequest('tools/call', {
          name: tool.name,
          arguments: {}
        });
        console.log(`    Result:`, JSON.stringify(result, null, 4));
      }
    }

    // List resources
    console.log('\n=== Listing Resources ===');
    const resourcesResult = await makeRequest('resources/list');

    if (resourcesResult.result && resourcesResult.result.resources) {
      const resources = resourcesResult.result.resources;
      console.log(`\nFound ${resources.length} resources:`);
      for (const resource of resources) {
        console.log(`\n  - ${resource.uri}`);
        console.log(`    Name: ${resource.name || 'N/A'}`);
        console.log(`    Description: ${resource.description || 'N/A'}`);
      }
    }

    // Close connection
    if (currentConnection) {
      currentConnection.end();
    }

  } catch (error) {
    console.error('Error:', error);
    if (currentConnection) {
      currentConnection.destroy();
    }
  }
}

main();
