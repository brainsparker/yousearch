#!/usr/bin/env node

const http = require('http');

function makeHttpRequest(endpoint, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);

    const options = {
      hostname: '127.0.0.1',
      port: 3845,
      path: endpoint,
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
        // Try to parse SSE format
        if (body.includes('event: message') || body.includes('data: ')) {
          const lines = body.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                resolve(JSON.parse(line.substring(6)));
                return;
              } catch (e) {
                // Continue
              }
            }
          }
        }

        // Try regular JSON
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ raw: body, statusCode: res.statusCode });
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

async function testFigmaAPI() {
  console.log('Testing Figma MCP Server on port 3845\n');

  // Try different possible endpoints
  const endpoints = ['/mcp', '/', '/api', '/rpc'];

  for (const endpoint of endpoints) {
    console.log(`\n======= Testing endpoint: ${endpoint} =======`);

    try {
      // Try initialize
      console.log('\n1. Initialize request:');
      const initReq = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'test-client',
            version: '1.0.0'
          }
        }
      };

      const initResp = await makeHttpRequest(endpoint, initReq);
      console.log(JSON.stringify(initResp, null, 2));

      if (initResp.result || !initResp.error) {
        console.log('\n2. Tools list request:');
        const toolsResp = await makeHttpRequest(endpoint, {
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/list'
        });
        console.log(JSON.stringify(toolsResp, null, 2));

        if (toolsResp.result && toolsResp.result.tools) {
          console.log(`\n3. Found ${toolsResp.result.tools.length} tools:`);
          for (const tool of toolsResp.result.tools) {
            console.log(`\n   Tool: ${tool.name}`);
            console.log(`   Description: ${tool.description || 'N/A'}`);
            console.log(`   Input Schema:`);
            console.log(JSON.stringify(tool.inputSchema, null, 6));

            // Try to call the tool
            console.log(`\n   Calling ${tool.name}...`);
            const callResp = await makeHttpRequest(endpoint, {
              jsonrpc: '2.0',
              id: 10 + toolsResp.result.tools.indexOf(tool),
              method: 'tools/call',
              params: {
                name: tool.name,
                arguments: {}
              }
            });
            console.log(`   Response:`);
            console.log(JSON.stringify(callResp, null, 6));
          }
        }

        console.log('\n4. Resources list request:');
        const resourcesResp = await makeHttpRequest(endpoint, {
          jsonrpc: '2.0',
          id: 3,
          method: 'resources/list'
        });
        console.log(JSON.stringify(resourcesResp, null, 2));

        if (resourcesResp.result && resourcesResp.result.resources) {
          console.log(`\nFound ${resourcesResp.result.resources.length} resources:`);
          for (const resource of resourcesResp.result.resources) {
            console.log(`\n   URI: ${resource.uri}`);
            console.log(`   Name: ${resource.name || 'N/A'}`);
            console.log(`   Description: ${resource.description || 'N/A'}`);

            // Try to read the resource
            console.log(`\n   Reading resource...`);
            const readResp = await makeHttpRequest(endpoint, {
              jsonrpc: '2.0',
              id: 20 + resourcesResp.result.resources.indexOf(resource),
              method: 'resources/read',
              params: {
                uri: resource.uri
              }
            });
            console.log(`   Contents:`);
            console.log(JSON.stringify(readResp, null, 6));
          }
        }

        // This endpoint worked, so don't try others
        break;
      }
    } catch (error) {
      console.error(`Error with endpoint ${endpoint}:`, error.message);
    }
  }
}

testFigmaAPI().catch(console.error);
