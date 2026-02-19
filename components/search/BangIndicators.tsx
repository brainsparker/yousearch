'use client';

import styles from './BangIndicators.module.css';

interface BangIndicatorsProps {
  activeBangs: string[];
}

export function BangIndicators({ activeBangs }: BangIndicatorsProps) {
  if (activeBangs.length === 0) return null;

  return (
    <div className={styles.indicators}>
      {activeBangs.map((bang) => (
        <span key={bang} className={styles.bang}>
          [{bang}]
        </span>
      ))}
    </div>
  );
}
