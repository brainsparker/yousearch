'use client';

import { useState } from 'react';
import type { SearchResult } from '@/lib/you-search';
import styles from './ResultDocument.module.css';

interface ResultDocumentProps {
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

export function ResultDocument({ result, index }: ResultDocumentProps) {
  const [showSnippets, setShowSnippets] = useState(false);
  const hasSnippets = result.snippets && result.snippets.length > 0;
  const displayAge = result.age || getRelativeTime(result.page_age);
  const hostname = new URL(result.url).hostname;

  return (
    <section className={styles.document}>
      <h2 className={styles.title}>
        <span className={styles.index}>{index + 1}.</span>
        <a href={result.url} target="_blank" rel="noopener noreferrer">
          {result.title}
        </a>
      </h2>

      <div className={styles.meta}>
        {result.favicon_url && (
          <img src={result.favicon_url} alt="" width={14} height={14} className={styles.favicon} />
        )}
        <span className={styles.hostname}>{hostname}</span>
        {displayAge && (
          <>
            <span className={styles.separator}>·</span>
            <span className={styles.age}>{displayAge}</span>
          </>
        )}
      </div>

      {result.description && <p className={styles.description}>{result.description}</p>}

      {hasSnippets && (
        <button
          onClick={() => setShowSnippets(!showSnippets)}
          className={styles.snippetToggle}
          aria-expanded={showSnippets}
        >
          {showSnippets ? 'Hide' : 'Show'} snippets
        </button>
      )}

      {showSnippets &&
        result.snippets?.slice(0, 3).map((snippet, idx) => (
          <blockquote key={idx} className={styles.snippet}>
            {snippet}
          </blockquote>
        ))}
    </section>
  );
}
