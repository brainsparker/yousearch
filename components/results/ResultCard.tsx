'use client';

import { useState } from 'react';
import type { SearchResult } from '@/lib/you-search';
import styles from './ResultCard.module.css';

interface ResultCardProps {
  result: SearchResult;
  index: number;
  onFollowUp?: (query: string) => void;
}

// Calculate estimated reading time from description
function estimateReadingTime(text?: string): number {
  if (!text) return 1;
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / 200); // Average reading speed
  return Math.max(1, Math.min(minutes, 10)); // Cap between 1-10 minutes
}

// Convert ISO date to relative time string
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
  } catch (e) {
    return undefined;
  }
}

export function ResultCard({ result, index, onFollowUp }: ResultCardProps) {
  const [showSnippets, setShowSnippets] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const hasSnippets = result.snippets && result.snippets.length > 0;
  const readingTime = estimateReadingTime(result.description);
  const displayAge = result.age || getRelativeTime(result.page_age);

  const handleFollowUp = () => {
    if (onFollowUp) {
      onFollowUp(`Tell me more about ${result.title}`);
    }
  };

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
          <span className={styles.readTimeBadge} title="Estimated reading time">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {readingTime} min read
          </span>
        </div>
      </div>

      {result.description && <p className={styles.description}>{result.description}</p>}

      <div className={styles.actions}>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className={styles.actionButton}
          aria-label={showPreview ? 'Hide preview' : 'Show preview'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {showPreview ? 'Hide' : 'Preview'}
        </button>

        {hasSnippets && (
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
        )}

        {onFollowUp && (
          <button
            onClick={handleFollowUp}
            className={styles.actionButton}
            aria-label="Follow-up question"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Follow-up
          </button>
        )}
      </div>

      {showPreview && (
        <div className={styles.preview}>
          <div className={styles.previewContent}>
            {result.description && <p>{result.description}</p>}
            {result.snippets && result.snippets.length > 0 && (
              <div className={styles.previewSnippets}>
                {result.snippets.slice(0, 2).map((snippet, idx) => (
                  <p key={idx}>{snippet}</p>
                ))}
              </div>
            )}
          </div>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.readFullArticle}
          >
            Read full article →
          </a>
        </div>
      )}

      {showSnippets && !showPreview && (
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
