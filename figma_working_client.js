#!/usr/bin/env node

const http = require('http');

const MCP_URL = 'http://127.0.0.1:3845/mcp';
let requestId = 0;
let sessionId = null;

function makeRequest(method, params = null) {
  return new Promise((resolve, reject) => {
    const message = {
      jsonrpc: '2.0',
      id: ++requestId,
      method: method
    };

    if (params !== null) {
      message.params = params;
    }

    const data = JSON.stringify(message);

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'Content-Length': data.length
    };

    // Include session ID if we have one
    if (sessionId) {
      headers['mcp-session-id'] = sessionId;
    }

    const options = {
      method: 'POST',
      headers: headers
    };

    const req = http.request(MCP_URL, options, (res) => {
      // Capture session ID from response headers
      if (res.headers['mcp-session-id']) {
        sessionId = res.headers['mcp-session-id'];
        console.log(`[Session ID captured: ${sessionId}]\n`);
      }

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

async function main() {
  try {
    console.log('='.repeat(70));
    console.log('FIGMA MCP CLIENT - EXTRACTING DESIGN SPECIFICATIONS');
    console.log('='.repeat(70));
    console.log();

    // Step 1: Initialize
    console.log('[1] Initializing connection to Figma MCP Server...\n');
    const initResult = await makeRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'figma-design-extractor',
        version: '1.0.0'
      }
    });

    if (!initResult.result) {
      console.error('ERROR: Initialization failed!');
      console.error(JSON.stringify(initResult, null, 2));
      return;
    }

    console.log('✓ Connection initialized successfully');
    console.log(`  Server: ${initResult.result.serverInfo.name}`);
    console.log(`  Version: ${initResult.result.serverInfo.version}`);
    console.log(`  Protocol: ${initResult.result.protocolVersion}`);
    console.log();

    // Step 2: List available tools
    console.log('[2] Fetching available tools...\n');
    const toolsResult = await makeRequest('tools/list', {});

    if (toolsResult.error) {
      console.error('ERROR:', toolsResult.error.message);
      return;
    }

    if (!toolsResult.result || !toolsResult.result.tools) {
      console.log('No tools available');
      return;
    }

    const tools = toolsResult.result.tools;
    console.log(`✓ Found ${tools.length} tool(s):\n`);

    tools.forEach((tool, idx) => {
      console.log(`  ${idx + 1}. ${tool.name}`);
      console.log(`     ${tool.description || 'No description'}`);
    });
    console.log();

    // Step 3: Call each tool to get design specifications
    console.log('[3] Extracting design specifications from Figma...\n');
    console.log('='.repeat(70));

    for (const tool of tools) {
      console.log();
      console.log(`CALLING TOOL: ${tool.name}`);
      console.log('-'.repeat(70));
      console.log();

      const result = await makeRequest('tools/call', {
        name: tool.name,
        arguments: {}
      });

      if (result.error) {
        console.log(`✗ Error: ${result.error.message}`);
      } else if (result.result) {
        console.log('✓ SUCCESS! Design specifications retrieved:');
        console.log();
        console.log(JSON.stringify(result.result, null, 2));
      } else {
        console.log('No data returned');
      }

      console.log();
    }

    // Step 4: List and read resources
    console.log('='.repeat(70));
    console.log('[4] Checking for available resources...\n');

    const resourcesResult = await makeRequest('resources/list', {});

    if (resourcesResult.error) {
      console.log(`✗ Error: ${resourcesResult.error.message}`);
    } else if (resourcesResult.result && resourcesResult.result.resources) {
      const resources = resourcesResult.result.resources;
      console.log(`✓ Found ${resources.length} resource(s):\n`);

      for (const resource of resources) {
        console.log(`RESOURCE: ${resource.name || resource.uri}`);
        console.log(`URI: ${resource.uri}`);
        console.log(`Description: ${resource.description || 'N/A'}`);
        console.log(`MIME Type: ${resource.mimeType || 'N/A'}`);
        console.log();

        console.log('Reading resource content...');
        const content = await makeRequest('resources/read', {
          uri: resource.uri
        });

        if (content.error) {
          console.log(`✗ Error: ${content.error.message}`);
        } else if (content.result) {
          console.log('✓ Content:');
          console.log(JSON.stringify(content.result, null, 2));
        }

        console.log();
        console.log('-'.repeat(70));
        console.log();
      }
    } else {
      console.log('No resources available');
    }

    console.log();
    console.log('='.repeat(70));
    console.log('EXTRACTION COMPLETE');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\nFATAL ERROR:', error.message);
    console.error(error);
  }
}

main();
