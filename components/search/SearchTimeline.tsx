'use client';

import styles from './SearchTimeline.module.css';

interface SearchTimelineProps {
  searches: Array<{ query: string; timestamp: number }>;
  currentIndex: number;
  onSelectSearch: (index: number) => void;
}

export function SearchTimeline({ searches, currentIndex, onSelectSearch }: SearchTimelineProps) {
  if (searches.length < 2) {
    return null;
  }

  return (
    <div className={styles.timeline}>
      <div className={styles.container}>
        {searches.map((search, index) => (
          <button
            key={index}
            onClick={() => onSelectSearch(index)}
            className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
            title={search.query}
            aria-label={`Go to search: ${search.query}`}
          >
            <span className={styles.tooltip}>{search.query}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
