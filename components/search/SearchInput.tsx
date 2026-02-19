'use client';

import { useState, useRef, type FormEvent } from 'react';
import { CommandHints } from './CommandHints';
import styles from './SearchInput.module.css';

interface SearchInputProps {
  onSearch: (query: string) => void;
  onCommand?: (input: string) => void;
  initialQuery?: string;
  isLoading?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export function SearchInput({
  onSearch,
  onCommand,
  initialQuery = '',
  isLoading = false,
  inputRef: externalRef,
}: SearchInputProps) {
  const [query, setQuery] = useState(initialQuery);
  const internalRef = useRef<HTMLInputElement>(null);
  const ref = externalRef || internalRef;
  const isCommand = query.trim().startsWith(':');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (trimmed.startsWith(':') && onCommand) {
      onCommand(trimmed);
      setQuery('');
    } else {
      onSearch(trimmed);
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  const handleCommandSelect = (command: string) => {
    setQuery(command);
    ref.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputWrapper}>
        <div className={styles.searchBox}>
          <svg
            className={styles.searchIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            ref={ref}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the web..."
            className={styles.input}
            disabled={isLoading}
            autoFocus
            aria-label="Search query"
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className={styles.clearButton}
              aria-label="Clear search"
              disabled={isLoading}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          <button
            type="submit"
            className={styles.searchButton}
            disabled={!query.trim() || isLoading}
            aria-label="Search"
          >
            {isLoading ? (
              <div className={styles.spinner} aria-label="Loading" />
            ) : (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            )}
          </button>
        </div>

        {isCommand && <CommandHints input={query} onSelect={handleCommandSelect} />}
      </div>
    </form>
  );
}
