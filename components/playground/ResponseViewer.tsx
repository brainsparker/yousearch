'use client';

import { useState } from 'react';
import styles from './ResponseViewer.module.css';

interface ResponseViewerProps {
  status: number;
  timing: number;
  body: string;
}

export function ResponseViewer({ status, timing, body }: ResponseViewerProps) {
  const [copied, setCopied] = useState(false);
  const isOk = status >= 200 && status < 300;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.viewer}>
      <div className={styles.header}>
        <span className={styles.title}>## Response</span>
        <span className={isOk ? styles.statusOk : styles.statusErr}>{status}</span>
        <span className={styles.timing}>{timing.toFixed(0)}ms</span>
        <button className={styles.copy} onClick={handleCopy}>
          {copied ? '> Copied!' : '> Copy response'}
        </button>
      </div>
      <pre className={styles.body}>{body}</pre>
    </div>
  );
}
