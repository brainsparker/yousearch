'use client';

import { getCommandSuggestions, type Command } from '@/lib/command-parser';
import styles from './CommandHints.module.css';

interface CommandHintsProps {
  input: string;
  onSelect: (command: string) => void;
}

export function CommandHints({ input, onSelect }: CommandHintsProps) {
  const suggestions = getCommandSuggestions(input);
  if (suggestions.length === 0) return null;

  return (
    <div className={styles.dropdown}>
      {suggestions.map((cmd: Command) => (
        <button
          key={cmd.type}
          className={styles.item}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(`:${cmd.type}${cmd.args.length ? ' ' : ''}`);
          }}
        >
          <span className={styles.name}>:{cmd.type}</span>
          {cmd.args.length > 0 && (
            <span className={styles.args}>{cmd.args.join('|')}</span>
          )}
          <span className={styles.desc}>{cmd.description}</span>
        </button>
      ))}
    </div>
  );
}
