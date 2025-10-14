"""
YouSearch - Open Source AI Search Engine
Powered by You.com Search API
"""
from flask import Flask, render_template, request, jsonify
from you_search import YouSearchClient
import os

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False


@app.route('/')
def index():
    """Render the main search page"""
    return render_template('index.html')


@app.route('/search', methods=['GET', 'POST'])
def search():
    """
    Handle search requests
    Accepts both GET and POST methods
    Query parameter: 'q' or 'query'
    """
    # Get query from either GET or POST
    query = request.args.get('q') or request.args.get('query') or request.form.get('q') or request.form.get('query')

    if not query:
        return jsonify({
            'error': 'No query provided',
            'message': 'Please provide a search query using the "q" or "query" parameter'
        }), 400

    # Get output format (json or text)
    output_format = request.args.get('format', 'json').lower()

    try:
        # Initialize client and perform search
        client = YouSearchClient()
        results = client.search(query)

        if output_format == 'text' or output_format == 'llm':
            # Return LLM-friendly formatted text
            formatted_text = client.format_results_for_llm(results)
            return formatted_text, 200, {'Content-Type': 'text/plain; charset=utf-8'}
        else:
            # Return JSON
            return jsonify({
                'query': query,
                'results': results
            })

    except ValueError as e:
        return jsonify({
            'error': 'Configuration error',
            'message': str(e)
        }), 500

    except Exception as e:
        return jsonify({
            'error': 'Search failed',
            'message': str(e)
        }), 500


@app.route('/api/search', methods=['GET', 'POST'])
def api_search():
    """
    API endpoint for search (alias to /search)
    Accepts JSON payloads as well
    """
    if request.is_json:
        data = request.get_json()
        query = data.get('query') or data.get('q')
    else:
        query = request.args.get('q') or request.args.get('query') or request.form.get('q') or request.form.get('query')

    if not query:
        return jsonify({
            'error': 'No query provided',
            'message': 'Please provide a search query'
        }), 400

    output_format = request.args.get('format', 'json').lower()

    try:
        client = YouSearchClient()
        results = client.search(query)

        if output_format == 'text' or output_format == 'llm':
            formatted_text = client.format_results_for_llm(results)
            return formatted_text, 200, {'Content-Type': 'text/plain; charset=utf-8'}
        else:
            return jsonify({
                'query': query,
                'results': results
            })

    except ValueError as e:
        return jsonify({
            'error': 'Configuration error',
            'message': str(e)
        }), 500

    except Exception as e:
        return jsonify({
            'error': 'Search failed',
            'message': str(e)
        }), 500


@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'YouSearch',
        'api': 'You.com Search API'
    })


if __name__ == '__main__':
    # Check if API key is configured
    if not os.getenv('YOU_API_KEY'):
        print("WARNING: YOU_API_KEY environment variable is not set!")
        print("Please create a .env file with your API key or set the environment variable.")
        print("Get your API key from: https://api.you.com/")

    # Run the Flask app
    port = int(os.getenv('PORT', 5001))
    app.run(debug=True, host='0.0.0.0', port=port)
