'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { SearchResult } from '@/lib/you-search';
import styles from './ResultDocument.module.css';

interface ResultDocumentProps {
  result: SearchResult;
  index: number;
  isActive?: boolean;
  /** Changes each time the reader should be toggled from the keyboard */
  readSignal?: number;
}

type ReaderState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; markdown: string }
  | { status: 'error'; message: string };

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

export function ResultDocument({
  result,
  index,
  isActive = false,
  readSignal = 0,
}: ResultDocumentProps) {
  const [showSnippets, setShowSnippets] = useState(false);
  const [showContent, setShowContent] = useState(false);
  // Page content is fetched on demand, unless the search response already carried it
  const [reader, setReader] = useState<ReaderState>(
    result.contents?.markdown
      ? { status: 'ready', markdown: result.contents.markdown }
      : { status: 'idle' }
  );
  const ref = useRef<HTMLElement>(null);
  const hasSnippets = result.snippets && result.snippets.length > 0;
  const displayAge = result.age || getRelativeTime(result.page_age);
  const hostname = new URL(result.url).hostname;

  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isActive]);

  const loadPage = useCallback(async () => {
    setReader({ status: 'loading' });
    try {
      const response = await fetch(`/api/extract?url=${encodeURIComponent(result.url)}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Could not read this page');
      }
      setReader({ status: 'ready', markdown: data.markdown });
    } catch (err) {
      setReader({
        status: 'error',
        message: err instanceof Error ? err.message : 'Could not read this page',
      });
    }
  }, [result.url]);

  const toggleReader = useCallback(() => {
    if (showContent) {
      setShowContent(false);
      return;
    }
    setShowContent(true);
    if (reader.status === 'idle' || reader.status === 'error') {
      loadPage();
    }
  }, [showContent, reader.status, loadPage]);

  // Keyboard: the parent bumps readSignal when `r` is pressed on this result
  const lastReadSignal = useRef(readSignal);
  useEffect(() => {
    // 0 means "not this result", so only a new non-zero value is a request
    if (readSignal !== 0 && readSignal !== lastReadSignal.current) {
      lastReadSignal.current = readSignal;
      toggleReader();
    }
  }, [readSignal, toggleReader]);

  return (
    <section ref={ref} className={`${styles.document}${isActive ? ` ${styles.active}` : ''}`}>
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

      <div className={styles.actions}>
        {hasSnippets && (
          <button
            onClick={() => setShowSnippets(!showSnippets)}
            className={styles.snippetToggle}
            aria-expanded={showSnippets}
          >
            {showSnippets ? 'Hide' : 'Show'} snippets
          </button>
        )}
        <button onClick={toggleReader} className={styles.snippetToggle} aria-expanded={showContent}>
          {showContent ? 'Hide page' : 'Read page'}
        </button>
      </div>

      {showSnippets &&
        result.snippets?.slice(0, 3).map((snippet, idx) => (
          <blockquote key={idx} className={styles.snippet}>
            {snippet}
          </blockquote>
        ))}

      {showContent && reader.status === 'loading' && (
        <div className={styles.contentReader} role="status">
          <div className={styles.contentDelimiter}>--- reading page ... ---</div>
        </div>
      )}

      {showContent && reader.status === 'error' && (
        <div className={styles.contentReader} role="alert">
          <div className={styles.contentError}>{reader.message}</div>
          <button onClick={loadPage} className={styles.snippetToggle}>
            Try again
          </button>
        </div>
      )}

      {showContent && reader.status === 'ready' && (
        <div className={styles.contentReader}>
          <div className={styles.contentDelimiter}>--- page content ---</div>
          <pre className={styles.contentBody}>{reader.markdown}</pre>
          <div className={styles.contentActions}>
            <span className={styles.contentDelimiter}>--- end ---</span>
            <button
              onClick={() => navigator.clipboard.writeText(reader.markdown)}
              className={styles.snippetToggle}
            >
              Copy markdown
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
