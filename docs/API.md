# API Reference

YouSearch provides a simple REST API for web search. All endpoints return JSON unless otherwise specified.

## Base URL

```
http://localhost:3000/api
```

For production, replace with your deployment URL.

---

## Endpoints

### Search

Perform a web search query.

#### GET /api/search

**Query Parameters**

| Parameter | Type   | Required | Description                                         |
| --------- | ------ | -------- | --------------------------------------------------- |
| `q`       | string | Yes      | Search query (alias: `query`)                       |
| `format`  | string | No       | Response format: `json` (default), `text`, or `llm` |

**Example Request**

```bash
curl "http://localhost:3000/api/search?q=typescript+tutorials&format=json"
```

**Example Response (JSON)**

```json
{
  "query": "typescript tutorials",
  "results": {
    "results": {
      "web": [
        {
          "title": "TypeScript: JavaScript With Syntax For Types",
          "url": "https://www.typescriptlang.org/",
          "description": "TypeScript extends JavaScript by adding types...",
          "snippets": [
            "TypeScript is a strongly typed programming language...",
            "Get started with TypeScript in 5 minutes..."
          ],
          "favicon_url": "https://www.typescriptlang.org/favicon.ico",
          "age": "2 hours ago",
          "page_age": "2025-01-14T10:30:00Z"
        }
      ],
      "news": []
    }
  }
}
```

**Example Response (Text/LLM)**

```text
=== WEB SEARCH RESULTS ===

1. TypeScript: JavaScript With Syntax For Types
   URL: https://www.typescriptlang.org/
   Description: TypeScript extends JavaScript by adding types...
   Snippets:
   - TypeScript is a strongly typed programming language...
   - Get started with TypeScript in 5 minutes...

2. TypeScript Tutorial
   URL: https://www.w3schools.com/typescript/
   Description: Learn TypeScript step by step...
```

---

#### POST /api/search

Same functionality as GET, but accepts parameters in the request body.

**Request Body**

```json
{
  "query": "typescript tutorials",
  "format": "json"
}
```

Alternative field name `q` is also supported:

```json
{
  "q": "typescript tutorials",
  "format": "text"
}
```

**Example Request**

```bash
curl -X POST "http://localhost:3000/api/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "typescript tutorials", "format": "json"}'
```

---

### Health Check

Check if the service is running.

#### GET /api/health

**Example Request**

```bash
curl "http://localhost:3000/api/health"
```

**Example Response**

```json
{
  "status": "healthy",
  "service": "YouSearch",
  "api": "You.com Search API"
}
```

---

## Response Formats

### JSON (default)

Structured data with full metadata. Best for programmatic access.

```bash
/api/search?q=query&format=json
```

### Text / LLM

Plain text optimized for LLM prompts. Returns `text/plain` content type.

```bash
/api/search?q=query&format=text
/api/search?q=query&format=llm
```

---

## Error Responses

All errors return JSON with `error` and `message` fields.

### 400 Bad Request

Missing required parameters.

```json
{
  "error": "No query provided",
  "message": "Please provide a search query using the \"q\" or \"query\" parameter"
}
```

### 500 Internal Server Error

API configuration or request failure.

```json
{
  "error": "Configuration error",
  "message": "API key is required. Set YOU_API_KEY environment variable..."
}
```

```json
{
  "error": "Search failed",
  "message": "Error querying You.com API: Network error"
}
```

---

## Result Object Schema

Each search result contains:

| Field           | Type      | Description                          |
| --------------- | --------- | ------------------------------------ |
| `title`         | string    | Page title                           |
| `url`           | string    | Full URL to the page                 |
| `description`   | string?   | Page description or excerpt          |
| `snippets`      | string[]? | Relevant text excerpts from the page |
| `favicon_url`   | string?   | URL to the site's favicon            |
| `age`           | string?   | Relative time (e.g., "2 hours ago")  |
| `page_age`      | string?   | ISO 8601 timestamp                   |
| `thumbnail_url` | string?   | Preview image URL                    |

---

## Usage Examples

### JavaScript/TypeScript

```typescript
// Fetch JSON results
const response = await fetch('/api/search?q=react+hooks');
const data = await response.json();
console.log(data.results.results.web);

// Fetch LLM-friendly text
const textResponse = await fetch('/api/search?q=react+hooks&format=text');
const text = await textResponse.text();
```

### Python

```python
import requests

# JSON format
response = requests.get(
    "http://localhost:3000/api/search",
    params={"q": "machine learning", "format": "json"}
)
results = response.json()

# LLM format for RAG
response = requests.get(
    "http://localhost:3000/api/search",
    params={"q": "machine learning", "format": "text"}
)
context = response.text
```

### cURL

```bash
# Basic search
curl "http://localhost:3000/api/search?q=hello+world"

# LLM format
curl "http://localhost:3000/api/search?q=hello+world&format=llm"

# POST request
curl -X POST "http://localhost:3000/api/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "hello world"}'
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production deployments, consider adding rate limiting middleware to prevent abuse.

---

## CORS

The API allows cross-origin requests by default through Next.js. For production, configure appropriate CORS headers in `next.config.js` if needed.
