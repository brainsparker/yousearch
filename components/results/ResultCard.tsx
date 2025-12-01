'use client';

import { useState } from 'react';
import type { SearchResult } from '@/lib/you-search';
import styles from './ResultCard.module.css';

interface ResultCardProps {
  result: SearchResult;
  index: number;
}

export function ResultCard({ result, index }: ResultCardProps) {
  const [showSnippets, setShowSnippets] = useState(false);
  const hasSnippets = result.snippets && result.snippets.length > 0;

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

      <div className={styles.url}>{new URL(result.url).hostname}</div>

      {result.description && <p className={styles.description}>{result.description}</p>}

      {hasSnippets && (
        <>
          <button
            onClick={() => setShowSnippets(!showSnippets)}
            className={styles.snippetsToggle}
            aria-expanded={showSnippets}
          >
            <span>{showSnippets ? 'Hide' : 'Show'} snippets</span>
            <svg
              className={showSnippets ? styles.iconExpanded : ''}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showSnippets && (
            <div className={styles.snippets}>
              {result.snippets?.slice(0, 3).map((snippet, idx) => (
                <div key={idx} className={styles.snippet}>
                  {snippet}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </article>
  );
}
