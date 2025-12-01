import styles from './ResultMeta.module.css';

interface ResultMetaProps {
  resultCount: number;
  searchTime?: number;
}

export function ResultMeta({ resultCount, searchTime }: ResultMetaProps) {
  return (
    <div className={styles.meta}>
      <div className={styles.count}>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span>
          {resultCount} {resultCount === 1 ? 'result' : 'results'}
        </span>
      </div>
      {searchTime !== undefined && (
        <div className={styles.time}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{searchTime.toFixed(2)}s</span>
        </div>
      )}
    </div>
  );
}
