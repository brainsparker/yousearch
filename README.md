# YouSearch

An open source AI search engine powered by [You.com's Search API](https://you.com/web-search-api). Built for AI agents and people, YouSearch provides real-time web data with LLM-friendly formatting.

![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/flask-3.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

- **Real-time Web Search**: Access fresh, accurate web data via You.com's API
- **LLM-Friendly Output**: Get results formatted for AI consumption
- **Multiple Output Formats**: Web UI, JSON API, and text format
- **Clean Interface**: Simple, intuitive search experience
- **Open Source**: MIT licensed, easy to customize and extend
- **API & Web UI**: Use via browser or programmatically

## Demo

Try searching for anything - the results include:
- Web results with titles, URLs, descriptions, and snippets
- News results (when relevant)
- Source URLs for verification
- Structured data perfect for LLMs

## Quick Start

### Prerequisites

- Python 3.8 or higher
- A You.com API key ([Get one here](https://api.you.com/))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/yousearch.git
cd yousearch
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up your API key:
```bash
cp .env.example .env
# Edit .env and add your YOU_API_KEY
```

4. Run the application:
```bash
python app.py
```

5. Open your browser to `http://localhost:5000`

## Usage

### Web Interface

1. Navigate to `http://localhost:5000`
2. Enter your search query
3. Choose output format:
   - **Web View**: Beautiful, formatted results
   - **JSON**: Raw API response
   - **LLM Format**: Text optimized for AI agents

### API Endpoints

#### Search (GET)
```bash
curl "http://localhost:5000/search?q=latest+AI+developments"
```

#### Search (POST)
```bash
curl -X POST http://localhost:5000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "latest AI developments"}'
```

#### LLM-Friendly Format
```bash
curl "http://localhost:5000/search?q=python+tutorials&format=text"
```

#### JSON Response
```bash
curl "http://localhost:5000/search?q=climate+change&format=json"
```

#### Health Check
```bash
curl http://localhost:5000/health
```

### Python Client

Use the `YouSearchClient` directly in your Python code:

```python
from you_search import YouSearchClient

# Initialize client
client = YouSearchClient()

# Perform search
results = client.search("latest AI news")

# Get LLM-friendly formatted output
formatted = client.format_results_for_llm(results)
print(formatted)
```

## API Response Format

### Web Results Structure
```json
{
  "query": "your search query",
  "results": {
    "results": {
      "web": [
        {
          "title": "Result Title",
          "url": "https://example.com",
          "description": "Brief description",
          "snippets": [
            "Relevant text snippet from the page..."
          ]
        }
      ],
      "news": [
        {
          "title": "News Title",
          "url": "https://news-source.com",
          "description": "News description"
        }
      ]
    }
  }
}
```

### LLM Format Output
```
=== WEB SEARCH RESULTS ===

1. Result Title
   URL: https://example.com
   Description: Brief description
   Snippets:
   - Relevant text snippet from the page...

=== NEWS RESULTS ===

1. Breaking News Title
   URL: https://news-source.com
   Description: News article description
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
YOU_API_KEY=your_api_key_here
```

### Customization

- **Port**: Change the port in `app.py` (default: 5000)
- **Styling**: Modify `static/css/style.css`
- **UI Logic**: Edit `static/js/app.js`
- **API Client**: Customize `you_search.py`

## Project Structure

```
yousearch/
├── app.py                 # Flask application
├── you_search.py         # You.com API client
├── requirements.txt      # Python dependencies
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
├── templates/
│   └── index.html       # Main UI template
└── static/
    ├── css/
    │   └── style.css    # Styles
    └── js/
        └── app.js       # Frontend JavaScript
```

## Deployment

### Local Development
```bash
python app.py
```

### Production (Gunicorn)
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Docker
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

### Environment Variables for Production
- `YOU_API_KEY`: Your You.com API key (required)
- `FLASK_ENV`: Set to `production`
- `PORT`: Server port (default: 5000)

## Use Cases

### For Developers
- Build AI assistants with real-time web access
- Create custom search interfaces
- Integrate search into applications
- Test LLM grounding strategies

### For AI Agents
- Get current information not in training data
- Verify facts with source URLs
- Access structured, clean search results
- Parse easily with LLM-friendly format

### For Researchers
- Study search result quality
- Compare search APIs
- Analyze web content freshness
- Build evaluation datasets

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [You.com](https://you.com) for providing the Search API
- Built with Flask, Python, and modern web technologies
- Inspired by the need for better LLM grounding

## Support

- Report bugs: [GitHub Issues](https://github.com/yourusername/yousearch/issues)
- Get an API key: [You.com API](https://api.you.com/)
- Documentation: [You.com API Docs](https://documentation.you.com/)

## Roadmap

- [ ] Add caching for frequent queries
- [ ] Implement rate limiting
- [ ] Add more output formats (Markdown, XML)
- [ ] Support for image search
- [ ] Add search filters (date, domain, etc.)
- [ ] Create CLI tool
- [ ] Add usage analytics dashboard

---

Built with ❤️ for the AI community
