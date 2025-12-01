import type { SearchResult } from '@/lib/you-search';
import { ResultCard } from '../results/ResultCard';
import { ResultMeta } from '../results/ResultMeta';
import styles from './SearchResults.module.css';

interface SearchResultsProps {
  results: SearchResult[];
  searchTime?: number;
  onFollowUp?: (query: string) => void;
}

export function SearchResults({ results, searchTime, onFollowUp }: SearchResultsProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <ResultMeta resultCount={results.length} searchTime={searchTime} />

      <div className={styles.results}>
        {results.map((result, index) => (
          <ResultCard key={result.url} result={result} index={index} onFollowUp={onFollowUp} />
        ))}
      </div>
    </div>
  );
}
