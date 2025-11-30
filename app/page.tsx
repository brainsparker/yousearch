'use client';

import { useState, useEffect, FormEvent } from 'react';
import type { SearchResult, SearchAPIResponse } from '@/lib/you-search';

type ViewType = 'visual' | 'code';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchAPIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState<ViewType>('visual');
  const [searchTime, setSearchTime] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  const featureExamples = [
    'Best new restaurants in NYC',
    'Latest news on NVIDIA',
    "Trump's latest policies on trade and tariffs",
    'Startup Series A or B rounds in 2025',
  ];

  useEffect(() => {
    // Load query from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q') || urlParams.get('query');
    if (queryParam) {
      setSearchQuery(queryParam);
      handleSearch(undefined, queryParam);
    }
  }, []);

  const handleSearch = async (e?: FormEvent, queryOverride?: string) => {
    if (e) e.preventDefault();

    const query = queryOverride || searchQuery.trim();
    if (!query) return;

    setHasSearched(true);
    setLoading(true);
    setError('');
    setResults(null);

    // Show skeleton after 500ms
    const skeletonTimeout = setTimeout(() => {
      setLoading(false);
      setShowSkeleton(true);
    }, 500);

    try {
      const startTime = performance.now();
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&format=json`);
      const endTime = performance.now();
      setSearchTime((endTime - startTime) / 1000);

      clearTimeout(skeletonTimeout);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Search failed');
      }

      const data: SearchAPIResponse = await response.json();
      setResults(data);
      window.lastSearchData = data;

      // Scroll to results after they load
      setTimeout(() => {
        const resultsContainer = document.querySelector('.results-container');
        if (resultsContainer) {
          resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      clearTimeout(skeletonTimeout);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
      setShowSkeleton(false);
    }
  };

  const handleFeatureCardClick = (text: string) => {
    setSearchQuery(text);
    handleSearch(undefined, text);
  };

  const handleFloatingSearch = (e: FormEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      handleSearch();
    }, 300);
  };

  const countResults = (data: SearchAPIResponse | null): number => {
    if (!data?.results?.results) return 0;
    let count = 0;
    if (data.results.results.web) count += data.results.results.web.length;
    if (data.results.results.news) count += data.results.results.news.length;
    return count;
  };

  const ResultItem = ({ result }: { result: SearchResult }) => {
    const [showSnippets, setShowSnippets] = useState(false);

    return (
      <div className="result-item">
        <div className="result-header">
          <div className="result-favicon">
            {result.favicon_url ? (
              <img
                src={result.favicon_url}
                alt=""
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML =
                    '<span style="font-size: 16px;">🔍</span>';
                }}
              />
            ) : (
              <span style={{ fontSize: '16px' }}>🔍</span>
            )}
          </div>
          <div className="result-content">
            <a href={result.url} target="_blank" rel="noopener noreferrer" className="result-title">
              {result.title || 'No title'}
            </a>
            <div className="result-url">{result.url}</div>
          </div>
        </div>
        {result.description && <div className="result-description">{result.description}</div>}
        {result.snippets && result.snippets.length > 0 && (
          <div className="result-snippets">
            <button
              className={`snippets-toggle ${showSnippets ? 'expanded' : ''}`}
              onClick={() => setShowSnippets(!showSnippets)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M19 9l-7 7-7-7" />
              </svg>
              <span>{showSnippets ? 'Hide context snippets' : 'Show context snippets'}</span>
            </button>
            <div className={`snippets-content ${showSnippets ? '' : 'hidden'}`}>
              {result.snippets.slice(0, 5).map((snippet, idx) => (
                <div key={idx} className="snippet">
                  {snippet}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-logo">you.platform</div>
          <div className="nav-links">
            <a href="#" className="nav-link">
              Developer Docs
            </a>
            <button className="btn-signin">Sign In</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-container" style={hasSearched ? { minHeight: '150px' } : undefined}>
        <main className="hero-content">
          <h1 className="hero-title">The world&apos;s fastest web search API for LLMs</h1>
          <p className="hero-subtitle">
            Power your LLM applications with fresh, accurate use data through a simple API.
          </p>

          {/* Search Box */}
          <div className="search-container">
            <form onSubmit={handleSearch}>
              <div className="search-box">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Find anything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                  autoFocus
                />
                <button type="submit" className="search-button" aria-label="Search">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </button>
              </div>
            </form>
          </div>

          {/* Feature Cards */}
          {!hasSearched && (
            <div className="features-grid">
              {featureExamples.map((text, idx) => (
                <div
                  key={idx}
                  className="feature-card"
                  onClick={() => handleFeatureCardClick(text)}
                >
                  <span className="feature-text">{text}</span>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="results-container">
          {/* Results Header */}
          {results && !loading && !showSkeleton && !error && (
            <div className="results-header">
              <div className="results-info">
                <h2>Results ({countResults(results)})</h2>
                <span className="results-time">
                  About {countResults(results)} results ({searchTime.toFixed(2)}s)
                </span>
              </div>
              <div className="view-toggle">
                <button
                  className={`view-toggle-btn ${currentView === 'visual' ? 'active' : ''}`}
                  onClick={() => setCurrentView('visual')}
                >
                  Visual
                </button>
                <button
                  className={`view-toggle-btn ${currentView === 'code' ? 'active' : ''}`}
                  onClick={() => setCurrentView('code')}
                >
                  Code
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="loading">
              <div className="loading-search-box">
                <span>{searchQuery}</span>
                <div className="loading-spinner"></div>
              </div>
            </div>
          )}

          {/* Skeleton Loading */}
          {showSkeleton && (
            <div className="skeleton-loading">
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
            </div>
          )}

          {/* Error */}
          {error && <div className="error">Error: {error}</div>}

          {/* Results */}
          {results && !loading && !showSkeleton && !error && (
            <div className="results">
              {currentView === 'visual' ? (
                <>
                  {results.results.results.web?.map((result, idx) => (
                    <ResultItem key={`web-${idx}`} result={result} />
                  ))}
                  {results.results.results.news?.map((result, idx) => (
                    <ResultItem key={`news-${idx}`} result={result} />
                  ))}
                  {!results.results.results.web?.length &&
                    !results.results.results.news?.length && (
                      <p
                        style={{
                          textAlign: 'center',
                          padding: '40px',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        No results found.
                      </p>
                    )}
                </>
              ) : (
                <>
                  <h2 className="section-title">JSON Response</h2>
                  <pre className="raw-output">{JSON.stringify(results, null, 2)}</pre>
                </>
              )}
            </div>
          )}

          {/* Floating Search Box */}
          {results && !loading && !showSkeleton && (
            <div className="floating-search">
              <form onSubmit={handleFloatingSearch}>
                <div className="floating-search-box">
                  <input
                    type="text"
                    className="floating-search-input"
                    placeholder={searchQuery}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoComplete="off"
                  />
                  <button type="submit" className="floating-search-btn" aria-label="Scroll to top">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>
            Open Source AI Search Engine |{' '}
            <a
              href="https://github.com/briansparker/yousearch"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>{' '}
            | Powered by{' '}
            <a href="https://you.com" target="_blank" rel="noopener noreferrer">
              You.com API
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
