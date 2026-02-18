'use client';

import { useState } from 'react';
import type { SearchResult } from '@/lib/you-search';
import styles from './ResultCard.module.css';

interface ResultCardProps {
  result: SearchResult;
  index: number;
}

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

export function ResultCard({ result, index }: ResultCardProps) {
  const [showSnippets, setShowSnippets] = useState(false);
  const hasSnippets = result.snippets && result.snippets.length > 0;
  const displayAge = result.age || getRelativeTime(result.page_age);

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        {result.favicon_url && (
          <div className={styles.favicon}>
            <img src={result.favicon_url} alt="" width={24} height={24} />
          </div>
        )}
        <div className={styles.content}>
          <div className={styles.sourceNumber}>{index + 1}</div>
        </div>
      </div>

      <a href={result.url} target="_blank" rel="noopener noreferrer" className={styles.title}>
        {result.title}
      </a>

      <div className={styles.metaRow}>
        <div className={styles.url}>{new URL(result.url).hostname}</div>
        <div className={styles.badges}>
          {displayAge && (
            <span className={styles.freshnessBadge} title="Last updated">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              {displayAge}
            </span>
          )}
        </div>
      </div>

      {result.thumbnail_url && (
        <div className={styles.thumbnail}>
          <img src={result.thumbnail_url} alt="" loading="lazy" />
        </div>
      )}

      {result.description && <p className={styles.description}>{result.description}</p>}

      {hasSnippets && (
        <div className={styles.actions}>
          <button
            onClick={() => setShowSnippets(!showSnippets)}
            className={styles.actionButton}
            aria-expanded={showSnippets}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {showSnippets ? 'Hide' : 'Show'} snippets
          </button>
        </div>
      )}

      {showSnippets && (
        <div className={styles.snippets}>
          {result.snippets?.slice(0, 3).map((snippet, idx) => (
            <div key={idx} className={styles.snippet}>
              {snippet}
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
