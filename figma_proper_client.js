#!/usr/bin/env node

const http = require('http');

class FigmaMCPClient {
  constructor(url = 'http://127.0.0.1:3845/mcp') {
    this.url = new URL(url);
    this.requestId = 0;
    this.session = null;
    this.initialized = false;
  }

  async makeRequest(method, params = null) {
    const data = {
      jsonrpc: '2.0',
      id: ++this.requestId,
      method,
      ...(params && { params })
    };

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);

      const options = {
        hostname: this.url.hostname,
        port: this.url.port,
        path: this.url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Accept': 'application/json, text/event-stream'
        }
      };

      const req = http.request(options, (res) => {
        let body = '';

        res.on('data', (chunk) => {
          body += chunk.toString();
        });

        res.on('end', () => {
          // Parse SSE format
          if (body.includes('data: ')) {
            const lines = body.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const result = JSON.parse(line.substring(6));
                  resolve(result);
                  return;
                } catch (e) {
                  // Continue to next line
                }
              }
            }
          }

          // Try regular JSON
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

      req.write(postData);
      req.end();
    });
  }

  async initialize() {
    console.log('=== Initializing Figma MCP Server ===\n');

    const initResponse = await this.makeRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {
        roots: {
          listChanged: true
        },
        sampling: {}
      },
      clientInfo: {
        name: 'claude-code',
        version: '1.0.0'
      }
    });

    console.log('Init Response:');
    console.log(JSON.stringify(initResponse, null, 2));
    console.log();

    if (initResponse.result) {
      this.initialized = true;
      return initResponse;
    } else {
      throw new Error('Initialization failed: ' + JSON.stringify(initResponse.error));
    }
  }

  async listTools() {
    if (!this.initialized) {
      throw new Error('Client not initialized. Call initialize() first.');
    }

    console.log('=== Listing Available Tools ===\n');
    const response = await this.makeRequest('tools/list');

    console.log('Tools Response:');
    console.log(JSON.stringify(response, null, 2));
    console.log();

    return response;
  }

  async callTool(name, args = {}) {
    if (!this.initialized) {
      throw new Error('Client not initialized. Call initialize() first.');
    }

    console.log(`=== Calling Tool: ${name} ===\n`);
    console.log('Arguments:', JSON.stringify(args, null, 2));
    console.log();

    const response = await this.makeRequest('tools/call', {
      name,
      arguments: args
    });

    console.log('Tool Response:');
    console.log(JSON.stringify(response, null, 2));
    console.log();

    return response;
  }

  async listResources() {
    if (!this.initialized) {
      throw new Error('Client not initialized. Call initialize() first.');
    }

    console.log('=== Listing Available Resources ===\n');
    const response = await this.makeRequest('resources/list');

    console.log('Resources Response:');
    console.log(JSON.stringify(response, null, 2));
    console.log();

    return response;
  }

  async readResource(uri) {
    if (!this.initialized) {
      throw new Error('Client not initialized. Call initialize() first.');
    }

    console.log(`=== Reading Resource: ${uri} ===\n`);
    const response = await this.makeRequest('resources/read', { uri });

    console.log('Resource Content:');
    console.log(JSON.stringify(response, null, 2));
    console.log();

    return response;
  }
}

async function main() {
  const client = new FigmaMCPClient();

  try {
    // Initialize the connection
    await client.initialize();

    // List available tools
    const toolsResponse = await client.listTools();

    // If we have tools, call each one to get design specs
    if (toolsResponse.result && toolsResponse.result.tools) {
      const tools = toolsResponse.result.tools;

      console.log(`\n${'='.repeat(60)}`);
      console.log(`FOUND ${tools.length} TOOLS`);
      console.log('='.repeat(60) + '\n');

      for (const tool of tools) {
        console.log(`\nTool: ${tool.name}`);
        console.log(`Description: ${tool.description || 'No description'}`);

        if (tool.inputSchema) {
          console.log('Input Schema:');
          console.log(JSON.stringify(tool.inputSchema, null, 2));
        }

        console.log('\n' + '-'.repeat(60));

        // Try to call the tool
        try {
          const result = await client.callTool(tool.name, {});

          if (result.result) {
            console.log('\n SUCCESS! Tool returned data:');
            console.log(JSON.stringify(result.result, null, 2));
          } else if (result.error) {
            console.log('\n Tool returned error:', result.error.message);
          }
        } catch (error) {
          console.log('\n Error calling tool:', error.message);
        }

        console.log('\n');
      }
    }

    // List and read resources
    const resourcesResponse = await client.listResources();

    if (resourcesResponse.result && resourcesResponse.result.resources) {
      const resources = resourcesResponse.result.resources;

      console.log(`\n${'='.repeat(60)}`);
      console.log(`FOUND ${resources.length} RESOURCES`);
      console.log('='.repeat(60) + '\n');

      for (const resource of resources) {
        console.log(`\nResource URI: ${resource.uri}`);
        console.log(`Name: ${resource.name || 'N/A'}`);
        console.log(`Description: ${resource.description || 'N/A'}`);
        console.log(`MIME Type: ${resource.mimeType || 'N/A'}`);

        console.log('\n' + '-'.repeat(60));

        // Try to read the resource
        try {
          await client.readResource(resource.uri);
        } catch (error) {
          console.log('Error reading resource:', error.message);
        }

        console.log('\n');
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('FIGMA MCP SERVER EXPLORATION COMPLETE');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
  }
}

// Run the client
main();
