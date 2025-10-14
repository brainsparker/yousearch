# YouSearch - Quick Start Guide

Your AI search engine is now up and running!

## Current Status

✅ API Key configured and working
✅ Flask server running on http://localhost:5001
✅ All endpoints tested and functional

## Access Your Search Engine

### Web Interface
Open your browser and go to:
```
http://localhost:5001
```

Try searching for anything! You can switch between three output formats:
- **Web View**: Clean, formatted results with snippets
- **JSON**: Raw API response
- **LLM Format**: Text optimized for AI agents

### API Endpoints

#### Search (Web UI)
```bash
# Open in browser
open http://localhost:5001
```

#### Search (JSON API)
```bash
curl "http://localhost:5001/search?q=your+search+query"
```

#### Search (LLM Format)
```bash
curl "http://localhost:5001/search?q=artificial+intelligence&format=text"
```

#### Search (POST with JSON)
```bash
curl -X POST http://localhost:5001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "python tutorials"}'
```

#### Health Check
```bash
curl http://localhost:5001/health
```

### Python Client

Use the API client directly in your Python code:

```python
from you_search import YouSearchClient

# Initialize client (automatically loads API key from .env)
client = YouSearchClient()

# Perform a search
results = client.search("latest AI developments")

# Get LLM-friendly formatted output
formatted = client.format_results_for_llm(results)
print(formatted)

# Or work with raw JSON
import json
print(json.dumps(results, indent=2))
```

## Example Searches to Try

1. **Current Events**: "latest news on AI"
2. **Technical Queries**: "how to deploy Flask applications"
3. **Research**: "climate change statistics 2025"
4. **Programming Help**: "python pandas tutorial"
5. **General Knowledge**: "history of machine learning"

## Stopping the Server

To stop the Flask server:
1. Go to the terminal where the server is running
2. Press `CTRL + C`

## Restarting the Server

```bash
python3 app.py
```

The server will start on port 5001 by default. To use a different port:

```bash
PORT=8000 python3 app.py
```

## Files Overview

- `app.py` - Flask web application
- `you_search.py` - You.com API client
- `templates/index.html` - Search interface
- `static/css/style.css` - Styling
- `static/js/app.js` - Frontend logic
- `.env` - Your API key (keep this secure!)

## Troubleshooting

### Port Already in Use
If you see "Address already in use", either:
- Stop the other process using port 5001
- Change the port: `PORT=8080 python3 app.py`

### API Key Issues
If searches fail:
- Check your `.env` file has the correct API key
- Verify the key at https://you.com/platform/

### Server Not Responding
- Check the server is running: `curl http://localhost:5001/health`
- Look for error messages in the terminal

## Next Steps

1. Customize the UI in `templates/index.html` and `static/css/style.css`
2. Add new features to `app.py` (caching, rate limiting, etc.)
3. Deploy to production (see README.md for deployment options)
4. Integrate with your AI applications

## Support

- Full documentation: See `README.md`
- You.com API Docs: https://documentation.you.com/
- Report issues: Create a GitHub issue

---

Happy searching! 🔍
