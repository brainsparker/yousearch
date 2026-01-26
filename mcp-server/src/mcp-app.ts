/**
 * MCP App View - Connects to host and renders search results
 */

import { App, PostMessageTransport } from '@modelcontextprotocol/ext-apps';
import { renderSearchResults, type SearchResult, type SearchResponse } from './search-ui.js';

let app: App | null = null;

// DOM elements
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const searchButton = document.getElementById('search-button') as HTMLButtonElement;
const resultsContainer = document.getElementById('results-container') as HTMLDivElement;
const resultsHeader = document.getElementById('results-header') as HTMLDivElement;
const loadingEl = document.getElementById('loading') as HTMLDivElement;
const errorEl = document.getElementById('error') as HTMLDivElement;

/**
 * Show loading state
 */
function showLoading() {
  loadingEl.classList.remove('hidden');
  errorEl.classList.add('hidden');
  resultsContainer.innerHTML = '';
  resultsHeader.innerHTML = '';
}

/**
 * Hide loading state
 */
function hideLoading() {
  loadingEl.classList.add('hidden');
}

/**
 * Show error message
 */
function showError(message: string) {
  hideLoading();
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}

/**
 * Perform a search via the MCP server
 */
async function performSearch(query: string) {
  if (!app) {
    showError('Not connected to MCP host');
    return;
  }

  if (!query.trim()) {
    return;
  }

  showLoading();
  searchInput.value = query;

  try {
    const result = await app.callServerTool({
      name: 'you_search',
      arguments: { query },
    });

    hideLoading();

    // Extract results from the tool response
    if (result.isError) {
      const textContent = result.content?.find((c: { type: string }) => c.type === 'text') as
        | { type: 'text'; text: string }
        | undefined;
      const errorText = textContent?.text || 'Search failed';
      showError(errorText);
      return;
    }

    // Parse result content to get the data
    // The server also sends structured _meta, but we parse from text content
    const textContent = result.content?.find((c: { type: string }) => c.type === 'text') as
      | { type: 'text'; text: string }
      | undefined;
    if (textContent) {
      // We got text results - the server has stored the structured data
      // For now, display a message and note that the results were returned
      displayTextResults(query, textContent.text);
    } else {
      showError('No results found');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search failed';
    showError(message);
  }
}

/**
 * Display text-based results (fallback when structured data unavailable)
 */
function displayTextResults(query: string, text: string) {
  resultsHeader.innerHTML = `
    <div class="results-info">
      <span class="query-info">Results for "<strong>${escapeHtml(query)}</strong>"</span>
    </div>
  `;

  // Parse the text format and convert to cards
  const lines = text.split('\n');
  let html = '<section class="results-section"><div class="results-list">';
  let currentResult: { title?: string; url?: string; description?: string; snippets?: string[] } =
    {};
  let resultIndex = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Check for numbered title (e.g., "1. Title Here")
    const titleMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (titleMatch) {
      // Save previous result if exists
      if (currentResult.title && currentResult.url) {
        html += renderTextResultCard(currentResult, resultIndex);
        resultIndex++;
      }
      currentResult = { title: titleMatch[2], snippets: [] };
      continue;
    }

    // Check for URL
    if (trimmed.startsWith('URL:')) {
      currentResult.url = trimmed.replace('URL:', '').trim();
      continue;
    }

    // Check for Description
    if (trimmed.startsWith('Description:')) {
      currentResult.description = trimmed.replace('Description:', '').trim();
      continue;
    }

    // Check for snippet
    if (trimmed.startsWith('- ') && currentResult.snippets) {
      currentResult.snippets.push(trimmed.slice(2));
    }
  }

  // Add last result
  if (currentResult.title && currentResult.url) {
    html += renderTextResultCard(currentResult, resultIndex);
  }

  html += '</div></section>';

  if (resultIndex === 0) {
    html = '<div class="no-results">No results found. Try a different search query.</div>';
  }

  resultsContainer.innerHTML = html;
  addResultInteractions();
}

/**
 * Render a single result card from parsed text data
 */
function renderTextResultCard(
  result: { title?: string; url?: string; description?: string; snippets?: string[] },
  index: number
): string {
  const domain = result.url ? getDomain(result.url) : '';
  const hasSnippets = result.snippets && result.snippets.length > 0;

  const snippetsHtml = hasSnippets
    ? `<div class="snippets-content hidden">
        ${result.snippets!.map((s) => `<div class="snippet">${escapeHtml(s)}</div>`).join('')}
      </div>`
    : '';

  const snippetsButtonHtml = hasSnippets
    ? `<button class="action-btn snippets-btn">Show snippets</button>`
    : '';

  return `
    <article class="result-card">
      <div class="card-header">
        <div class="favicon favicon-placeholder"></div>
        <div class="source-number">${index + 1}</div>
      </div>

      <a href="${escapeHtml(result.url || '')}" target="_blank" rel="noopener noreferrer" class="result-title">
        ${escapeHtml(result.title || 'No title')}
      </a>

      <div class="meta-row">
        <div class="result-url">${escapeHtml(domain)}</div>
      </div>

      ${result.description ? `<p class="result-description">${escapeHtml(result.description)}</p>` : ''}

      <div class="card-actions">
        <button class="action-btn preview-btn">Preview</button>
        ${snippetsButtonHtml}
        <button class="action-btn followup-btn" data-title="${escapeHtml(result.title || '')}">Follow-up</button>
      </div>

      <div class="preview-content hidden">
        ${result.description ? `<p>${escapeHtml(result.description)}</p>` : ''}
        ${
          hasSnippets
            ? result
                .snippets!.slice(0, 2)
                .map((s) => `<p class="preview-snippet">${escapeHtml(s)}</p>`)
                .join('')
            : ''
        }
        <a href="${escapeHtml(result.url || '')}" target="_blank" rel="noopener noreferrer" class="read-full">
          Read full article →
        </a>
      </div>

      ${snippetsHtml}
    </article>
  `;
}

/**
 * Extract domain from URL
 */
function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

/**
 * Display search results
 */
function displayResults(query: string, response: SearchResponse) {
  const webResults = response.results?.web || [];
  const newsResults = response.results?.news || [];
  const totalResults = webResults.length + newsResults.length;

  // Update header
  resultsHeader.innerHTML = `
    <div class="results-info">
      <span class="result-count">About ${totalResults} results</span>
      <span class="query-info">for "<strong>${escapeHtml(query)}</strong>"</span>
    </div>
  `;

  // Render results
  resultsContainer.innerHTML = renderSearchResults(webResults, newsResults);

  // Add click handlers for action buttons
  addResultInteractions();
}

/**
 * Add interactive behaviors to result cards
 */
function addResultInteractions() {
  // Preview toggle buttons
  document.querySelectorAll('.preview-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const card = target.closest('.result-card');
      const preview = card?.querySelector('.preview-content');
      if (preview) {
        preview.classList.toggle('hidden');
        target.textContent = preview.classList.contains('hidden') ? 'Preview' : 'Hide';
      }
    });
  });

  // Snippets toggle buttons
  document.querySelectorAll('.snippets-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const card = target.closest('.result-card');
      const snippets = card?.querySelector('.snippets-content');
      if (snippets) {
        snippets.classList.toggle('hidden');
        target.textContent = snippets.classList.contains('hidden')
          ? 'Show snippets'
          : 'Hide snippets';
      }
    });
  });

  // Follow-up buttons - trigger new search
  document.querySelectorAll('.followup-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const title = target.dataset.title;
      if (title) {
        performSearch(`Tell me more about ${title}`);
      }
    });
  });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Initialize the MCP app
 */
async function init() {
  try {
    // Create MCP app instance
    app = new App(
      { name: 'YouSearch', version: '1.0.0' },
      {} // capabilities
    );

    // Listen for tool results (when host triggers search)
    app.ontoolresult = (params) => {
      // When the host triggers a you_search tool, we'll get the results here
      if (!params.isError && params.content) {
        const textContent = params.content.find((c: { type: string }) => c.type === 'text') as
          | { type: 'text'; text: string }
          | undefined;
        if (textContent) {
          // Try to extract query from the text or use a default
          displayTextResults('Search Results', textContent.text);
        }
      }
    };

    // Connect to host via PostMessage
    const transport = new PostMessageTransport(window.parent);
    await app.connect(transport);

    // Set up search form
    searchButton.addEventListener('click', () => {
      performSearch(searchInput.value);
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch(searchInput.value);
      }
    });
  } catch (error) {
    console.error('Failed to initialize MCP app:', error);
    showError('Failed to connect to MCP host. Running in standalone mode.');

    // Enable standalone mode for testing
    searchButton.addEventListener('click', () => {
      showError('MCP connection required for search. Please use within Claude Desktop.');
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
