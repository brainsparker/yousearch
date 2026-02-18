'use client';

import { useState, useEffect } from 'react';
import type { SearchAPIResponse } from '@/lib/you-search';
import { SearchInput } from '@/components/search/SearchInput';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchFilters, type FilterValues } from '@/components/search/SearchFilters';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Loading } from '@/components/ui/Loading';
import styles from './page.module.css';

export default function Home() {
  const [results, setResults] = useState<SearchAPIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTime, setSearchTime] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    freshness: '',
    country: '',
    safesearch: 'moderate',
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q') || urlParams.get('query');
    if (queryParam) {
      handleSearch(queryParam);
    }
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setHasSearched(true);
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const params = new URLSearchParams({ q: query, format: 'json' });
      if (filters.freshness) params.set('freshness', filters.freshness);
      if (filters.country) params.set('country', filters.country);
      if (filters.safesearch && filters.safesearch !== 'moderate') {
        params.set('safesearch', filters.safesearch);
      }

      const startTime = performance.now();
      const response = await fetch(`/api/search?${params.toString()}`);
      const endTime = performance.now();
      const timeElapsed = (endTime - startTime) / 1000;
      setSearchTime(timeElapsed);

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'missing_api_key') {
          setError('missing_api_key');
        } else {
          throw new Error(errorData.message || 'Search failed');
        }
        return;
      }

      const data: SearchAPIResponse = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const getWebResults = () => {
    return results?.results?.web || [];
  };

  const getNewsResults = () => {
    return results?.results?.news || [];
  };

  const exampleQueries = [
    'Latest AI research papers',
    'Best web search APIs for developers',
    'Next.js server components tutorial',
    'Climate change solutions 2026',
  ];

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {!hasSearched ? (
          <div className={styles.hero}>
            <h1 className={styles.title}>Real-time search for humans and AI</h1>
            <p className={styles.subtitle}>Fresh web results. Clean interface. LLM-ready API.</p>

            <div className={styles.searchContainer}>
              <SearchInput onSearch={handleSearch} isLoading={loading} />
            </div>

            {!loading && (
              <div className={styles.suggestions}>
                {exampleQueries.map((query) => (
                  <button
                    key={query}
                    onClick={() => handleSearch(query)}
                    className={styles.suggestionPill}
                  >
                    {query}
                  </button>
                ))}
              </div>
            )}

            <div className={styles.features}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div className={styles.featureText}>
                  <strong>Real-time data</strong>
                  <span>Fresh results from the live web</span>
                </div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div className={styles.featureText}>
                  <strong>LLM-ready API</strong>
                  <span>JSON and text formats for AI</span>
                </div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className={styles.featureText}>
                  <strong>Privacy-first</strong>
                  <span>No tracking, open source</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.compactHero}>
            <div className={styles.searchContainer}>
              <SearchInput onSearch={handleSearch} isLoading={loading} />
            </div>
            <SearchFilters filters={filters} onChange={setFilters} />
          </div>
        )}

        <div className={styles.content}>
          {error === 'missing_api_key' && (
            <div className={styles.onboarding}>
              <h2>Welcome to YouSearch!</h2>
              <p>
                Add your You.com API key to get started. Get one free at{' '}
                <a href="https://you.com/platform" target="_blank" rel="noopener noreferrer">
                  you.com/platform
                </a>{' '}
                — includes $100 in credits.
              </p>
              <p className={styles.onboardingHint}>
                Add <code>YOU_API_KEY=your_key</code> to <code>.env.local</code> and restart the dev
                server.
              </p>
            </div>
          )}

          {error && error !== 'missing_api_key' && (
            <ErrorBanner message={error} />
          )}

          {loading && <Loading />}

          {!loading && !error && results && (
            <SearchResults
              results={getWebResults()}
              newsResults={getNewsResults()}
              searchTime={searchTime}
              apiLatency={results.metadata?.latency}
            />
          )}

          {!loading &&
            !error &&
            hasSearched &&
            getWebResults().length === 0 &&
            getNewsResults().length === 0 && (
              <EmptyState title="No results found" message="Try a different search query" />
            )}
        </div>
      </main>

      <footer className={styles.footer}>
        <a href="https://you.com/platform" target="_blank" rel="noopener noreferrer">
          Powered by You.com Search API
        </a>
      </footer>
    </div>
  );
}
