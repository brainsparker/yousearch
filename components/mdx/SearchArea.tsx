'use client';

import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { SearchAPIResponse, SearchResult } from '@/lib/you-search';
import { getSearchParams, setSearchParams } from '@/lib/hooks/useSearchURL';
import { parseBangs } from '@/lib/bang-parser';
import { useKeyboardNav } from '@/lib/hooks/useKeyboardNav';
import { formatResultsAsMarkdown } from '@/lib/format-results-markdown';
import { parseCommand } from '@/lib/command-parser';
import { useTheme } from '@/lib/theme-provider';
import { SearchInput } from '@/components/search/SearchInput';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchFilters, type FilterValues } from '@/components/search/SearchFilters';
import { BangIndicators } from '@/components/search/BangIndicators';
import { KeyboardHints } from '@/components/ui/KeyboardHints';
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
  const [currentQuery, setCurrentQuery] = useState('');
  const [activeBangs, setActiveBangs] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [readRequest, setReadRequest] = useState({ index: -1, nonce: 0 });
  const [filters, setFilters] = useState<FilterValues>({
    freshness: '',
    country: '',
    safesearch: 'moderate',
  });

  const inputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const { setTheme } = useTheme();

  const getWebResults = useCallback((): SearchResult[] => results?.results?.web || [], [results]);
  const getNewsResults = useCallback((): SearchResult[] => results?.results?.news || [], [results]);

  const allResults = [...getWebResults(), ...getNewsResults()];

  const { activeIndex } = useKeyboardNav({
    resultCount: allResults.length,
    onOpen: (index) => {
      const result = allResults[index];
      if (result) window.open(result.url, '_blank');
    },
    onRead: (index) => setReadRequest((prev) => ({ index, nonce: prev.nonce + 1 })),
    onFocusSearch: () => inputRef.current?.focus(),
    enabled: hasSearched && !loading,
  });

  const handleSearch = useCallback(
    async (rawQuery: string) => {
      if (!rawQuery.trim()) return;

      const bang = parseBangs(rawQuery);
      const query = bang.cleanQuery || rawQuery;
      setActiveBangs(bang.activeBangs);

      if (!query.trim()) return;

      // Merge bang overrides with UI filters
      const effectiveFilters = {
        freshness: bang.freshness || filters.freshness,
        country: bang.country || filters.country,
        safesearch: bang.safesearch || filters.safesearch,
      };

      setHasSearched(true);
      setCurrentQuery(rawQuery);
      setLoading(true);
      setError('');
      setResults(null);

      // Update URL with effective values
      setSearchParams({
        q: query,
        freshness: effectiveFilters.freshness,
        country: effectiveFilters.country,
        safesearch: effectiveFilters.safesearch,
      });

      try {
        const params = new URLSearchParams({ q: query, format: 'json' });
        if (effectiveFilters.freshness) params.set('freshness', effectiveFilters.freshness);
        if (effectiveFilters.country) params.set('country', effectiveFilters.country);
        if (effectiveFilters.safesearch && effectiveFilters.safesearch !== 'moderate') {
          params.set('safesearch', effectiveFilters.safesearch);
        }
        if (bang.count) params.set('count', String(bang.count));

        const startTime = performance.now();
        const response = await fetch(`/api/search?${params.toString()}`);
        const endTime = performance.now();
        const timeElapsed = (endTime - startTime) / 1000;
        setSearchTime(timeElapsed);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Search failed');
        }

        const data: SearchAPIResponse = await response.json();

        // If !news bang, filter to only news results
        if (bang.isNews) {
          data.results = {
            web: [],
            news: [...(data.results?.news || []), ...(data.results?.web || [])],
          };
        }

        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  const handleCommand = useCallback(
    (input: string) => {
      const cmd = parseCommand(input);
      if (!cmd) return;

      switch (cmd.type) {
        case 'theme': {
          const theme = cmd.args[0];
          if (theme === 'dark' || theme === 'light') {
            setTheme(theme);
          }
          break;
        }
        case 'export': {
          const fmt = cmd.args[0] || 'md';
          const web = getWebResults();
          const news = getNewsResults();
          if (fmt === 'json') {
            navigator.clipboard.writeText(JSON.stringify(results, null, 2));
          } else {
            navigator.clipboard.writeText(formatResultsAsMarkdown(web, news));
          }
          break;
        }
        case 'help':
          setShowHelp((prev) => !prev);
          break;
        case 'clear':
          setResults(null);
          setHasSearched(false);
          setError('');
          setActiveBangs([]);
          setCurrentQuery('');
          history.pushState(null, '', window.location.pathname);
          break;
      }
    },
    [results, getWebResults, getNewsResults, setTheme]
  );

  // On mount: read URL params and search; listen for popstate
  useEffect(() => {
    const runFromUrl = () => {
      const { query, filters: urlFilters } = getSearchParams();
      if (query) {
        setFilters(urlFilters);
        handleSearch(query);
      }
    };

    runFromUrl();

    const onPopState = () => {
      const { query, filters: urlFilters } = getSearchParams();
      if (query) {
        setFilters(urlFilters);
        handleSearch(query);
      } else {
        setResults(null);
        setHasSearched(false);
        setError('');
        setActiveBangs([]);
        setCurrentQuery('');
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <SearchInput
              onSearch={handleSearch}
              onCommand={handleCommand}
              isLoading={loading}
              inputRef={inputRef}
            />
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
            <SearchInput
              key={currentQuery}
              onSearch={handleSearch}
              onCommand={handleCommand}
              isLoading={loading}
              initialQuery={currentQuery}
              inputRef={inputRef}
            />
          </div>
          <SearchFilters filters={filters} onChange={setFilters} />
          <BangIndicators activeBangs={activeBangs} />
        </div>
      )}

      <div className={styles.content}>
        {error && <ErrorBanner message={error} />}

        {loading && <Loading />}

        {showHelp && (
          <div className={styles.helpOverlay}>
            <h3>Keyboard shortcuts</h3>
            <p><kbd>j</kbd>/<kbd>k</kbd> — navigate results</p>
            <p><kbd>Enter</kbd> — open selected result</p>
            <p><kbd>r</kbd> - read selected result as markdown</p>
            <p><kbd>/</kbd> — focus search input</p>
            <p><kbd>Esc</kbd> — clear selection / blur input</p>
            <h3>Bang commands</h3>
            <p><code>!day !week !month !year</code> — freshness filter</p>
            <p><code>!us !gb !de !fr !jp !ca</code> — country filter</p>
            <p><code>!news</code> — news only</p>
            <p><code>!10 !20 !50</code> — result count</p>
            <h3>Commands</h3>
            <p><code>:theme dark|light</code> — switch theme</p>
            <p><code>:export json|md</code> — copy results</p>
            <p><code>:clear</code> — reset search</p>
            <p><code>:help</code> — toggle this panel</p>
            <button className={styles.helpClose} onClick={() => setShowHelp(false)}>
              &gt; Close
            </button>
          </div>
        )}

        {!loading && !error && results && (
          <SearchResults
            results={getWebResults()}
            newsResults={getNewsResults()}
            searchTime={searchTime}
            apiLatency={results.metadata?.latency}
            activeIndex={activeIndex}
            readRequest={readRequest}
          />
        )}

        {!loading && !error && results?.mode === 'keyless' && (
          <p className={styles.keylessNote}>
            Running on the You.com keyless free tier, which is rate limited. Add{' '}
            <code>YOU_API_KEY</code> for higher limits. Free key at{' '}
            <a href="https://you.com/platform" target="_blank" rel="noopener noreferrer">
              you.com/platform
            </a>
            .
          </p>
        )}

        {!loading && !error && hasSearched && !showHelp && (
          <KeyboardHints />
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
