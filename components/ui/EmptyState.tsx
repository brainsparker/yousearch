import styles from './EmptyState.module.css';

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export function EmptyState({
  title = 'Start searching',
  message = 'Enter a query above to find results from across the web',
}: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.message}>{message}</p>
    </div>
  );
}
