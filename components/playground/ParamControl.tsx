'use client';

import styles from './ParamControl.module.css';

interface ParamControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

export function ParamControl({ label, value, onChange, options, placeholder }: ParamControlProps) {
  return (
    <div className={styles.row}>
      <label className={styles.label}>{label}:</label>
      {options ? (
        <select
          className={styles.select}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          className={styles.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
