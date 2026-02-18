import type { SearchResult } from '@/lib/you-search';
import { ResultCard } from '../results/ResultCard';
import { ResultMeta } from '../results/ResultMeta';
import styles from './SearchResults.module.css';

interface SearchResultsProps {
  results: SearchResult[];
  newsResults?: SearchResult[];
  searchTime?: number;
  apiLatency?: number;
}

export function SearchResults({ results, newsResults, searchTime, apiLatency }: SearchResultsProps) {
  if (results.length === 0 && (!newsResults || newsResults.length === 0)) {
    return null;
  }

  return (
    <div className={styles.container}>
      <ResultMeta
        resultCount={results.length}
        searchTime={searchTime}
        apiLatency={apiLatency}
      />

      <div className={styles.results}>
        {results.map((result, index) => (
          <ResultCard key={result.url} result={result} index={index} />
        ))}
      </div>

      {newsResults && newsResults.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>News</h2>
          <div className={styles.results}>
            {newsResults.map((result, index) => (
              <ResultCard key={result.url} result={result} index={index} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
