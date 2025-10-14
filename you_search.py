"""
You.com Search API Client
Provides a simple interface to query the You.com Search API
"""
import os
import requests
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class YouSearchClient:
    """Client for interacting with You.com Search API"""

    BASE_URL = "https://api.ydc-index.io/v1/search"

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the You.com Search API client

        Args:
            api_key: You.com API key. If not provided, will look for YOU_API_KEY env var
        """
        self.api_key = api_key or os.getenv("YOU_API_KEY")
        if not self.api_key:
            raise ValueError(
                "API key is required. Set YOU_API_KEY environment variable or pass api_key parameter"
            )

    def search(self, query: str, num_results: int = 10) -> Dict[str, Any]:
        """
        Perform a search query using You.com API

        Args:
            query: Search query string
            num_results: Number of results to return (default: 10)

        Returns:
            Dictionary containing search results with web and news data

        Raises:
            requests.exceptions.RequestException: If the API request fails
        """
        headers = {
            "X-API-Key": self.api_key
        }

        params = {
            "query": query
        }

        try:
            response = requests.get(
                self.BASE_URL,
                headers=headers,
                params=params,
                timeout=30
            )
            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            raise Exception(f"Error querying You.com API: {str(e)}")

    def format_results_for_llm(self, results: Dict[str, Any]) -> str:
        """
        Format search results in an LLM-friendly text format

        Args:
            results: Raw API response from You.com

        Returns:
            Formatted string optimized for LLM consumption
        """
        formatted = []

        # Add web results
        if "results" in results and "web" in results["results"]:
            web_results = results["results"]["web"]
            formatted.append("=== WEB SEARCH RESULTS ===\n")

            for idx, result in enumerate(web_results[:10], 1):
                title = result.get("title", "No title")
                url = result.get("url", "")
                description = result.get("description", "")
                snippets = result.get("snippets", [])

                formatted.append(f"{idx}. {title}")
                formatted.append(f"   URL: {url}")
                if description:
                    formatted.append(f"   Description: {description}")
                if snippets:
                    formatted.append(f"   Snippets:")
                    for snippet in snippets[:3]:  # Limit to 3 snippets per result
                        formatted.append(f"   - {snippet}")
                formatted.append("")

        # Add news results if available
        if "results" in results and "news" in results["results"]:
            news_results = results["results"]["news"]
            if news_results:
                formatted.append("\n=== NEWS RESULTS ===\n")

                for idx, result in enumerate(news_results[:5], 1):
                    title = result.get("title", "No title")
                    url = result.get("url", "")
                    description = result.get("description", "")

                    formatted.append(f"{idx}. {title}")
                    formatted.append(f"   URL: {url}")
                    if description:
                        formatted.append(f"   Description: {description}")
                    formatted.append("")

        return "\n".join(formatted)


def main():
    """Example usage of the You.com Search API client"""
    try:
        client = YouSearchClient()

        # Example search
        query = "latest developments in AI"
        print(f"Searching for: {query}\n")

        results = client.search(query)

        # Print formatted results
        formatted_output = client.format_results_for_llm(results)
        print(formatted_output)

        # Also print raw JSON for debugging
        print("\n=== RAW JSON RESPONSE ===")
        import json
        print(json.dumps(results, indent=2))

    except Exception as e:
        print(f"Error: {str(e)}")


if __name__ == "__main__":
    main()
