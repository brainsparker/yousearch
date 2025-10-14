#!/usr/bin/env python3
import requests
import json
import re

MCP_URL = "http://127.0.0.1:3845/mcp"

def parse_sse_response(text):
    """Parse Server-Sent Events format"""
    # Extract JSON from SSE format
    if "data: " in text:
        for line in text.split('\n'):
            if line.startswith('data: '):
                return json.loads(line[6:])
    # Try parsing as regular JSON
    try:
        return json.loads(text)
    except:
        return None

def make_session_request(method, params=None, request_id=1):
    """Make a single request with a new session"""
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream"
    }

    # First, initialize
    init_payload = {
        "jsonrpc": "2.0",
        "id": 0,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {
                "name": "claude-code",
                "version": "1.0.0"
            }
        }
    }

    session = requests.Session()
    init_response = session.post(MCP_URL, json=init_payload, headers=headers)
    print(f"Init response status: {init_response.status_code}")

    # Now make the actual request
    payload = {
        "jsonrpc": "2.0",
        "id": request_id,
        "method": method
    }
    if params:
        payload["params"] = params

    response = session.post(MCP_URL, json=payload, headers=headers)
    return response.text, session

# Get tools list
print("=== Fetching Available Tools ===")
tools_response, tools_session = make_session_request("tools/list", request_id=1)
print(tools_response)
print()

tools_json = parse_sse_response(tools_response)
if tools_json and "result" in tools_json:
    tools = tools_json.get("result", {}).get("tools", [])
    print(f"\nFound {len(tools)} tools:")
    for tool in tools:
        print(f"\n  Name: {tool['name']}")
        print(f"  Description: {tool.get('description', 'No description')}")
        if 'inputSchema' in tool:
            print(f"  Input schema: {json.dumps(tool['inputSchema'], indent=4)}")

    # Try to call relevant tools
    print("\n=== Attempting to Get Design Specifications ===")
    for tool in tools:
        tool_name = tool['name']
        print(f"\n--- Calling: {tool_name} ---")

        # Prepare arguments based on the tool
        args = {}

        tool_call_response, _ = make_session_request("tools/call", {
            "name": tool_name,
            "arguments": args
        }, request_id=2)

        print(tool_call_response)

        # Parse and display the result
        result_json = parse_sse_response(tool_call_response)
        if result_json:
            print("\nParsed result:")
            print(json.dumps(result_json, indent=2))

# Try resources
print("\n\n=== Fetching Available Resources ===")
resources_response, _ = make_session_request("resources/list", request_id=3)
print(resources_response)

resources_json = parse_sse_response(resources_response)
if resources_json and "result" in resources_json:
    resources = resources_json.get("result", {}).get("resources", [])
    print(f"\nFound {len(resources)} resources:")
    for resource in resources:
        print(f"\n  URI: {resource.get('uri', 'N/A')}")
        print(f"  Name: {resource.get('name', 'N/A')}")
        print(f"  Description: {resource.get('description', 'N/A')}")
        print(f"  MIME Type: {resource.get('mimeType', 'N/A')}")
