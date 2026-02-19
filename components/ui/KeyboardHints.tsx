import styles from './KeyboardHints.module.css';

export function KeyboardHints() {
  return (
    <div className={styles.hints}>
      <span><kbd>j</kbd>/<kbd>k</kbd> navigate</span>
      <span><kbd>Enter</kbd> open</span>
      <span><kbd>/</kbd> search</span>
      <span><kbd>Esc</kbd> clear</span>
    </div>
  );
}
