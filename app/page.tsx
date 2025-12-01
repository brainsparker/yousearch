'use client';

import { useState, useEffect } from 'react';
import type { SearchAPIResponse } from '@/lib/you-search';
import { SearchInput } from '@/components/search/SearchInput';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchTimeline } from '@/components/search/SearchTimeline';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Loading } from '@/components/ui/Loading';
import styles from './page.module.css';

interface SearchHistoryItem {
  query: string;
  timestamp: number;
  results: SearchAPIResponse;
  searchTime: number;
}

export default function Home() {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
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
      const timeElapsed = (endTime - startTime) / 1000;
      setSearchTime(timeElapsed);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Search failed');
      }

      const data: SearchAPIResponse = await response.json();
      setResults(data);
      window.lastSearchData = data;

      // Add to search history
      const newHistoryItem: SearchHistoryItem = {
        query,
        timestamp: Date.now(),
        results: data,
        searchTime: timeElapsed,
      };

      setSearchHistory((prev) => [...prev, newHistoryItem]);
      setCurrentSearchIndex((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTimelineSelect = (index: number) => {
    const historyItem = searchHistory[index];
    if (historyItem) {
      setResults(historyItem.results);
      setSearchTime(historyItem.searchTime);
      setCurrentSearchIndex(index);
      setError('');
    }
  };

  const handleFollowUp = (query: string) => {
    handleSearch(query);
  };

  const handleRetry = () => {
    setError('');
  };

  const getWebResults = () => {
    return results?.results?.results?.web || [];
  };

  const exampleQueries = [
    'Latest AI developments',
    'Best restaurants in Tokyo',
    'How to learn TypeScript',
    'Climate change solutions',
  ];

  const handleExampleClick = (query: string) => {
    handleSearch(query);
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {!hasSearched ? (
          <div className={styles.hero}>
            <h1 className={styles.title}>Where knowledge begins</h1>

            <div className={styles.searchContainer}>
              <SearchInput onSearch={handleSearch} isLoading={loading} />
            </div>

            {!loading && (
              <div className={styles.suggestions}>
                {exampleQueries.map((query) => (
                  <button
                    key={query}
                    onClick={() => handleExampleClick(query)}
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
          </div>
        )}

        <div className={styles.content}>
          {hasSearched && searchHistory.length > 0 && (
            <SearchTimeline
              searches={searchHistory}
              currentIndex={currentSearchIndex}
              onSelectSearch={handleTimelineSelect}
            />
          )}

          {error && <ErrorBanner message={error} onRetry={handleRetry} />}

          {loading && <Loading />}

          {!loading && !error && results && (
            <SearchResults
              results={getWebResults()}
              searchTime={searchTime}
              onFollowUp={handleFollowUp}
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
