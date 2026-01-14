'use client';

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>YouSearch</span>
        </Link>

        <nav className={styles.nav}>
          <a
            href="/api/search?q=hello&format=json"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.navLink}
            title="Try the API"
          >
            API
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
