/**
 * Search Results UI Rendering
 *
 * Renders search results matching the YouSearch web UI style
 */

export interface SearchResult {
  title: string;
  url: string;
  description?: string;
  snippets?: string[];
  favicon_url?: string;
  age?: string;
  page_age?: string;
  thumbnail_url?: string;
}

export interface SearchResponse {
  results: {
    web?: SearchResult[];
    news?: SearchResult[];
  };
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
 * Calculate estimated reading time from text
 */
function estimateReadingTime(text?: string): number {
  if (!text) return 1;
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return Math.max(1, Math.min(minutes, 10));
}

/**
 * Convert ISO date to relative time string
 */
function getRelativeTime(isoDate?: string): string | undefined {
  if (!isoDate) return undefined;

  try {
    const date = new Date(isoDate);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    if (diffInSeconds < 2592000) {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }
    if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  } catch {
    return undefined;
  }
}

/**
 * Render a single search result card
 */
function renderResultCard(result: SearchResult, index: number): string {
  const domain = getDomain(result.url);
  const readingTime = estimateReadingTime(result.description);
  const displayAge = result.age || getRelativeTime(result.page_age);
  const hasSnippets = result.snippets && result.snippets.length > 0;

  const faviconHtml = result.favicon_url
    ? `<div class="favicon"><img src="${escapeHtml(result.favicon_url)}" alt="" width="24" height="24" onerror="this.style.display='none'"></div>`
    : '<div class="favicon favicon-placeholder"></div>';

  const ageBadgeHtml = displayAge
    ? `<span class="freshness-badge" title="Last updated">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        ${escapeHtml(displayAge)}
      </span>`
    : '';

  const snippetsHtml = hasSnippets
    ? `<div class="snippets-content hidden">
        ${result
          .snippets!.slice(0, 3)
          .map((s) => `<div class="snippet">${escapeHtml(s)}</div>`)
          .join('')}
      </div>`
    : '';

  const snippetsButtonHtml = hasSnippets
    ? `<button class="action-btn snippets-btn">Show snippets</button>`
    : '';

  return `
    <article class="result-card">
      <div class="card-header">
        ${faviconHtml}
        <div class="source-number">${index + 1}</div>
      </div>

      <a href="${escapeHtml(result.url)}" target="_blank" rel="noopener noreferrer" class="result-title">
        ${escapeHtml(result.title || 'No title')}
      </a>

      <div class="meta-row">
        <div class="result-url">${escapeHtml(domain)}</div>
        <div class="badges">
          ${ageBadgeHtml}
          <span class="read-time-badge" title="Estimated reading time">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
            ${readingTime} min read
          </span>
        </div>
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
        <a href="${escapeHtml(result.url)}" target="_blank" rel="noopener noreferrer" class="read-full">
          Read full article →
        </a>
      </div>

      ${snippetsHtml}
    </article>
  `;
}

/**
 * Render all search results
 */
export function renderSearchResults(
  webResults: SearchResult[],
  newsResults: SearchResult[] = []
): string {
  let html = '';

  // Web results section
  if (webResults.length > 0) {
    html += '<section class="results-section">';
    html += '<h2 class="section-title">Web Results</h2>';
    html += '<div class="results-list">';
    webResults.forEach((result, index) => {
      html += renderResultCard(result, index);
    });
    html += '</div>';
    html += '</section>';
  }

  // News results section
  if (newsResults.length > 0) {
    html += '<section class="results-section news-section">';
    html += '<h2 class="section-title">News</h2>';
    html += '<div class="results-list">';
    newsResults.forEach((result, index) => {
      html += renderResultCard(result, index);
    });
    html += '</div>';
    html += '</section>';
  }

  if (webResults.length === 0 && newsResults.length === 0) {
    html = '<div class="no-results">No results found. Try a different search query.</div>';
  }

  return html;
}
