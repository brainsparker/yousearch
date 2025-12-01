import styles from './Loading.module.css';

export function Loading() {
  return (
    <div className={styles.container}>
      <div className={styles.skeletons}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className={styles.skeleton} style={{ animationDelay: `${i * 0.1}s` }}>
            <div className={styles.skeletonHeader}>
              <div className={styles.skeletonIcon} />
              <div className={styles.skeletonBadge} />
            </div>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonUrl} />
            <div className={styles.skeletonText} />
            <div className={styles.skeletonTextShort} />
          </div>
        ))}
      </div>
    </div>
  );
}
