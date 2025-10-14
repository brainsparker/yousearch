#!/usr/bin/env node

const http = require('http');
const { Agent } = require('http');

const MCP_URL = 'http://127.0.0.1:3845/mcp';

let requestId = 0;
const agent = new Agent({ keepAlive: true, maxSockets: 1 });

function makeRequest(method, params = null, isNotification = false) {
  return new Promise((resolve, reject) => {
    const message = {
      jsonrpc: '2.0',
      method: method
    };

    // Notifications don't have an ID
    if (!isNotification) {
      message.id = ++requestId;
    }

    // Add params if provided
    if (params !== null) {
      message.params = params;
    }

    const data = JSON.stringify(message);

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
          // For notifications, an empty response is OK
          if (isNotification) {
            resolve({ notification: 'sent' });
          } else {
            resolve({ raw: body });
          }
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

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  try {
    console.log('=== Step 1: Initialize Connection ===\n');
    const initResult = await makeRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {
        roots: {
          listChanged: true
        }
      },
      clientInfo: {
        name: 'figma-client',
        version: '1.0.0'
      }
    });
    console.log('Init response:', JSON.stringify(initResult, null, 2));
    console.log();

    if (!initResult.result) {
      console.error('Initialization failed!');
      return;
    }

    // Send initialized notification (important: this is a notification, not a request)
    console.log('=== Step 2: Send initialized Notification ===\n');
    await makeRequest('notifications/initialized', {}, true);
    console.log('Notification sent');
    console.log();

    await wait(200);

    // Now list tools
    console.log('=== Step 3: List Available Tools ===\n');
    const toolsResult = await makeRequest('tools/list', {});
    console.log('Tools response:', JSON.stringify(toolsResult, null, 2));
    console.log();

    if (toolsResult.result && toolsResult.result.tools) {
      const tools = toolsResult.result.tools;
      console.log(`\n${'='.repeat(70)}`);
      console.log(`FOUND ${tools.length} TOOL(S)`);
      console.log('='.repeat(70) + '\n');

      for (const tool of tools) {
        console.log(`\nTool: ${tool.name}`);
        console.log(`Description: ${tool.description || 'No description'}`);
        if (tool.inputSchema) {
          console.log('Input Schema:', JSON.stringify(tool.inputSchema, null, 2));
        }

        console.log(`\n--- Calling ${tool.name} ---`);
        const result = await makeRequest('tools/call', {
          name: tool.name,
          arguments: {}
        });

        if (result.result) {
          console.log('\nSUCCESS! Design specifications:');
          console.log(JSON.stringify(result.result, null, 2));
        } else if (result.error) {
          console.log('\nError:', result.error.message);
        }

        await wait(100);
      }
    }

    // List resources
    console.log('\n\n=== Step 4: List Available Resources ===\n');
    const resourcesResult = await makeRequest('resources/list', {});
    console.log('Resources response:', JSON.stringify(resourcesResult, null, 2));
    console.log();

    if (resourcesResult.result && resourcesResult.result.resources) {
      const resources = resourcesResult.result.resources;
      console.log(`\n${'='.repeat(70)}`);
      console.log(`FOUND ${resources.length} RESOURCE(S)`);
      console.log('='.repeat(70) + '\n');

      for (const resource of resources) {
        console.log(`\nResource: ${resource.name || resource.uri}`);
        console.log(`URI: ${resource.uri}`);
        console.log(`Description: ${resource.description || 'No description'}`);
        console.log(`MIME Type: ${resource.mimeType || 'N/A'}`);

        console.log(`\n--- Reading ${resource.uri} ---`);
        const content = await makeRequest('resources/read', {
          uri: resource.uri
        });

        if (content.result) {
          console.log('\nSUCCESS! Resource content:');
          console.log(JSON.stringify(content.result, null, 2));
        } else if (content.error) {
          console.log('\nError:', content.error.message);
        }

        await wait(100);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('COMPLETE');
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    // Clean up the agent
    agent.destroy();
  }
}

main();
