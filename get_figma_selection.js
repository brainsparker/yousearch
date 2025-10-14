#!/usr/bin/env node

const http = require('http');

class FigmaSessionClient {
  constructor(url = 'http://127.0.0.1:3845/mcp') {
    this.url = new URL(url);
    this.requestId = 0;
    this.cookies = [];
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

      const headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Accept': 'application/json, text/event-stream'
      };

      // Include cookies if we have them
      if (this.cookies.length > 0) {
        headers['Cookie'] = this.cookies.join('; ');
      }

      const options = {
        hostname: this.url.hostname,
        port: this.url.port,
        path: this.url.pathname,
        method: 'POST',
        headers
      };

      const req = http.request(options, (res) => {
        // Save cookies from response
        if (res.headers['set-cookie']) {
          const newCookies = res.headers['set-cookie'].map(cookie =>
            cookie.split(';')[0]
          );
          this.cookies = [...this.cookies, ...newCookies];
        }

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

    if (!initResponse.result) {
      throw new Error('Initialization failed: ' + JSON.stringify(initResponse.error));
    }

    return initResponse;
  }

  async listTools() {
    return await this.makeRequest('tools/list');
  }

  async callTool(name, args = {}) {
    return await this.makeRequest('tools/call', {
      name,
      arguments: args
    });
  }

  async listResources() {
    return await this.makeRequest('resources/list');
  }

  async readResource(uri) {
    return await this.makeRequest('resources/read', { uri });
  }
}

async function main() {
  const client = new FigmaSessionClient();

  try {
    console.log('Initializing connection to Figma MCP Server...\n');
    await client.initialize();

    console.log('Fetching available tools...\n');
    const toolsResponse = await client.listTools();

    if (toolsResponse.result && toolsResponse.result.tools) {
      const tools = toolsResponse.result.tools;
      console.log(`Found ${tools.length} tool(s)\n`);

      for (const tool of tools) {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`TOOL: ${tool.name}`);
        console.log(`Description: ${tool.description || 'No description'}`);
        console.log('='.repeat(70));

        // Call the tool
        const result = await client.callTool(tool.name, {});

        if (result.result) {
          console.log('\nRESULT:');
          console.log(JSON.stringify(result.result, null, 2));
        } else if (result.error) {
          console.log('\nERROR:', result.error.message);
        }
      }
    } else if (toolsResponse.error) {
      console.log('Error listing tools:', toolsResponse.error.message);
    }

    console.log('\n\nFetching available resources...\n');
    const resourcesResponse = await client.listResources();

    if (resourcesResponse.result && resourcesResponse.result.resources) {
      const resources = resourcesResponse.result.resources;
      console.log(`Found ${resources.length} resource(s)\n`);

      for (const resource of resources) {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`RESOURCE: ${resource.name || resource.uri}`);
        console.log(`URI: ${resource.uri}`);
        console.log(`Description: ${resource.description || 'No description'}`);
        console.log('='.repeat(70));

        // Read the resource
        const content = await client.readResource(resource.uri);

        if (content.result) {
          console.log('\nCONTENT:');
          console.log(JSON.stringify(content.result, null, 2));
        } else if (content.error) {
          console.log('\nERROR:', content.error.message);
        }
      }
    } else if (resourcesResponse.error) {
      console.log('Error listing resources:', resourcesResponse.error.message);
    }

  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

main();
