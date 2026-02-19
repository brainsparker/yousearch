import type { ReactNode } from 'react';
import styles from './Features.module.css';

interface FeaturesProps {
  children: ReactNode;
}

export function Features({ children }: FeaturesProps) {
  return <div className={styles.features}>{children}</div>;
}
