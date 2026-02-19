import type { ReactNode } from 'react';
import styles from './Feature.module.css';

interface FeatureProps {
  icon: 'clock' | 'code' | 'shield';
  title: string;
  children: ReactNode;
}

const icons = {
  clock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  code: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  shield: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

export function Feature({ icon, title, children }: FeatureProps) {
  return (
    <div className={styles.feature}>
      <div className={styles.icon}>{icons[icon]}</div>
      <div className={styles.text}>
        <strong>{title}</strong>
        <span>{children}</span>
      </div>
    </div>
  );
}
