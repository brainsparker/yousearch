'use client';

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>AI Search</span>
        </Link>

        <nav className={styles.nav}>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
