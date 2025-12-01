import styles from './ErrorBanner.module.css';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className={styles.container} role="alert">
      <div className={styles.content}>
        <div className={styles.icon}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className={styles.text}>
          <h3 className={styles.title}>Error</h3>
          <p className={styles.message}>{message}</p>
        </div>
      </div>
      {onRetry && (
        <button onClick={onRetry} className={styles.retryButton}>
          Try again
        </button>
      )}
    </div>
  );
}
