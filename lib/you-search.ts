/**
 * You.com Search API Client
 *
 * This template uses fetch directly so you can see exactly how the API works.
 * For production apps, you can also use the official SDK: @youdotcom-oss/sdk
 *
 * @see https://docs.you.com
 */

/**
 * Search options for filtering and pagination
 */
export interface SearchOptions {
  count?: number; // 1-100, default 10
  freshness?: 'day' | 'week' | 'month' | 'year' | string;
  offset?: number; // 0-9, for pagination
  country?: string; // ISO 3166 code (US, GB, DE, etc.)
  language?: string; // BCP 47 code (EN, ES, FR, etc.)
  safesearch?: 'off' | 'moderate' | 'strict';
}

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
  contents?: { html?: string; markdown?: string };
  authors?: string[];
}

/**
 * Search API response structure containing web and news results
 */
export interface SearchResponse {
  results: {
    web?: SearchResult[];
    news?: SearchResult[];
  };
  metadata?: {
    search_uuid: string;
    query: string;
    latency: number;
  };
}

/**
 * Complete API response with query and results
 */
export interface SearchAPIResponse {
  query: string;
  results: {
    web?: SearchResult[];
    news?: SearchResult[];
  };
  metadata?: {
    search_uuid: string;
    query: string;
    latency: number;
  };
}

/**
 * Client for interacting with the You.com Search API
 */
export class YouSearchClient {
  private static readonly BASE_URL = 'https://ydc-index.io/v1/search';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.YOU_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('missing_api_key');
    }
  }

  /**
   * Searches the You.com API for the given query
   */
  async search(query: string, options?: SearchOptions): Promise<SearchResponse> {
    const headers = {
      'X-API-Key': this.apiKey,
    };

    const params = new URLSearchParams({ query });

    if (options) {
      if (options.count !== undefined) params.set('count', String(options.count));
      if (options.freshness) params.set('freshness', options.freshness);
      if (options.offset !== undefined) params.set('offset', String(options.offset));
      if (options.country) params.set('country', options.country);
      if (options.language) params.set('language', options.language);
      if (options.safesearch) params.set('safesearch', options.safesearch);
    }

    try {
      const response = await fetch(`${YouSearchClient.BASE_URL}?${params.toString()}`, {
        headers,
        next: { revalidate: 0 },
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error(`Invalid API key (${response.status})`);
      }

      if (response.status === 429) {
        throw new Error(`Rate limit exceeded (${response.status})`);
      }

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.message.match(/^\w/)) {
        throw error;
      }
      throw new Error(
        `Error querying You.com API: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Formats search results into LLM-friendly text format
   */
  formatResultsForLLM(results: SearchResponse): string {
    const formatted: string[] = [];

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
