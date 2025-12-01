'use client';

import { useState, useEffect } from 'react';
import type { SearchAPIResponse } from '@/lib/you-search';
import { SearchInput } from '@/components/search/SearchInput';
import { SearchResults } from '@/components/search/SearchResults';
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

  useEffect(() => {
    // Load query from URL if present
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
      const startTime = performance.now();
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&format=json`);
      const endTime = performance.now();
      setSearchTime((endTime - startTime) / 1000);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Search failed');
      }

      const data: SearchAPIResponse = await response.json();
      setResults(data);
      window.lastSearchData = data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError('');
  };

  const getWebResults = () => {
    return results?.results?.results?.web || [];
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Search the web</h1>
          <p className={styles.subtitle}>Fast, accurate search results powered by You.com</p>

          <div className={styles.searchContainer}>
            <SearchInput onSearch={handleSearch} isLoading={loading} />
          </div>
        </div>

        <div className={styles.content}>
          {error && <ErrorBanner message={error} onRetry={handleRetry} />}

          {loading && <Loading />}

          {!loading && !error && results && (
            <SearchResults results={getWebResults()} searchTime={searchTime} />
          )}

          {!loading && !error && !hasSearched && (
            <EmptyState
              title="Start searching"
              message="Enter a query above to find results from across the web"
            />
          )}

          {!loading && !error && hasSearched && getWebResults().length === 0 && (
            <EmptyState title="No results found" message="Try a different search query" />
          )}
        </div>
      </main>
    </div>
  );
}
