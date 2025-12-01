/**
 * You.com Search API Client
 *
 * Provides a simple interface to query the You.com Search API and format results
 * for different use cases including LLM consumption.
 *
 * @example
 * ```typescript
 * const client = new YouSearchClient();
 * const results = await client.search('Next.js tutorials', 10);
 * const formatted = client.formatResultsForLLM(results);
 * ```
 */

/**
 * Individual search result item
 */
export interface SearchResult {
  title: string;
  url: string;
  description?: string;
  snippets?: string[];
  favicon_url?: string;
  age?: string; // Relative time like "2 hours ago", "1 day ago"
  page_age?: string; // ISO 8601 date from API
  thumbnail_url?: string; // For preview images
}

/**
 * Search API response structure containing web and news results
 */
export interface SearchResponse {
  results: {
    web?: SearchResult[];
    news?: SearchResult[];
  };
}

/**
 * Complete API response with query and results
 */
export interface SearchAPIResponse {
  query: string;
  results: SearchResponse;
}

/**
 * Client for interacting with the You.com Search API
 */
export class YouSearchClient {
  private static readonly BASE_URL = 'https://ydc-index.io/v1/search';
  private apiKey: string;

  /**
   * Creates a new You.com Search API client
   *
   * @param apiKey - Optional API key. If not provided, uses YOU_API_KEY environment variable
   * @throws Error if no API key is provided or found in environment
   */
  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.YOU_API_KEY || '';
    if (!this.apiKey) {
      throw new Error(
        'API key is required. Set YOU_API_KEY environment variable or pass api_key parameter'
      );
    }
  }

  /**
   * Searches the You.com API for the given query
   *
   * @param query - The search query string
   * @param numResults - Maximum number of results to return (default: 10)
   * @returns Promise resolving to search results with web and news data
   * @throws Error if API key is invalid or request fails
   *
   * @example
   * ```typescript
   * const client = new YouSearchClient();
   * const results = await client.search('TypeScript tutorials');
   * console.log(results.results.web);
   * ```
   */
  async search(query: string, numResults: number = 10): Promise<SearchResponse> {
    const headers = {
      'X-API-Key': this.apiKey,
    };

    const params = new URLSearchParams({
      query,
    });

    try {
      const response = await fetch(`${YouSearchClient.BASE_URL}?${params.toString()}`, {
        headers,
        next: { revalidate: 0 }, // Disable caching for real-time results
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(
        `Error querying You.com API: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Formats search results into LLM-friendly text format
   *
   * Converts search results into a structured text format optimized for
   * consumption by Large Language Models, including titles, URLs,
   * descriptions, and snippets.
   *
   * @param results - Search results to format
   * @returns Formatted text string with clear sections and structure
   *
   * @example
   * ```typescript
   * const results = await client.search('React hooks');
   * const formatted = client.formatResultsForLLM(results);
   * console.log(formatted);
   * // Output:
   * // === WEB SEARCH RESULTS ===
   * //
   * // 1. React Hooks Documentation
   * //    URL: https://react.dev/hooks
   * //    Description: ...
   * ```
   */
  formatResultsForLLM(results: SearchResponse): string {
    const formatted: string[] = [];

    // Add web results
    if (results.results?.web) {
      const webResults = results.results.web;
      formatted.push('=== WEB SEARCH RESULTS ===\n');

      webResults.slice(0, 10).forEach((result, idx) => {
        const title = result.title || 'No title';
        const url = result.url || '';
        const description = result.description || '';
        const snippets = result.snippets || [];

        formatted.push(`${idx + 1}. ${title}`);
        formatted.push(`   URL: ${url}`);
        if (description) {
          formatted.push(`   Description: ${description}`);
        }
        if (snippets.length > 0) {
          formatted.push(`   Snippets:`);
          snippets.slice(0, 3).forEach((snippet) => {
            formatted.push(`   - ${snippet}`);
          });
        }
        formatted.push('');
      });
    }

    // Add news results if available
    if (results.results?.news && results.results.news.length > 0) {
      const newsResults = results.results.news;
      formatted.push('\n=== NEWS RESULTS ===\n');

      newsResults.slice(0, 5).forEach((result, idx) => {
        const title = result.title || 'No title';
        const url = result.url || '';
        const description = result.description || '';

        formatted.push(`${idx + 1}. ${title}`);
        formatted.push(`   URL: ${url}`);
        if (description) {
          formatted.push(`   Description: ${description}`);
        }
        formatted.push('');
      });
    }

    return formatted.join('\n');
  }
}
