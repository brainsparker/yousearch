'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import type { SearchAPIResponse } from '@/lib/you-search';
import { SearchInput } from '@/components/search/SearchInput';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchFilters, type FilterValues } from '@/components/search/SearchFilters';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Loading } from '@/components/ui/Loading';
import styles from './SearchArea.module.css';

interface SearchAreaProps {
  children?: ReactNode;
}

export function SearchArea({ children }: SearchAreaProps) {
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

  const handleSearch = useCallback(
    async (query: string) => {
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
    },
    [filters]
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q') || urlParams.get('query');
    if (queryParam) {
      handleSearch(queryParam);
    }
  }, [handleSearch]);

  const getWebResults = () => results?.results?.web || [];
  const getNewsResults = () => results?.results?.news || [];

  const exampleQueries = [
    'Latest AI research papers',
    'Best web search APIs for developers',
    'Next.js server components tutorial',
    'Climate change solutions 2026',
  ];

  return (
    <div className={styles.searchArea}>
      {!hasSearched ? (
        <div className={styles.hero}>
          {children && <div className={styles.heroContent}>{children}</div>}

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

        {error && error !== 'missing_api_key' && <ErrorBanner message={error} />}

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
    </div>
  );
}
