'use client';

import styles from './SearchFilters.module.css';

export interface FilterValues {
  freshness: string;
  country: string;
  safesearch: string;
}

interface SearchFiltersProps {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
}

export function SearchFilters({ filters, onChange }: SearchFiltersProps) {
  const update = (key: keyof FilterValues, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className={styles.filters}>
      <select
        className={styles.select}
        value={filters.freshness}
        onChange={(e) => update('freshness', e.target.value)}
        aria-label="Filter by freshness"
      >
        <option value="">Any time</option>
        <option value="day">Past day</option>
        <option value="week">Past week</option>
        <option value="month">Past month</option>
        <option value="year">Past year</option>
      </select>

      <select
        className={styles.select}
        value={filters.country}
        onChange={(e) => update('country', e.target.value)}
        aria-label="Filter by country"
      >
        <option value="">Any country</option>
        <option value="US">US</option>
        <option value="GB">UK</option>
        <option value="CA">Canada</option>
        <option value="DE">Germany</option>
        <option value="FR">France</option>
        <option value="JP">Japan</option>
      </select>

      <select
        className={styles.select}
        value={filters.safesearch}
        onChange={(e) => update('safesearch', e.target.value)}
        aria-label="SafeSearch level"
      >
        <option value="moderate">SafeSearch: Moderate</option>
        <option value="off">SafeSearch: Off</option>
        <option value="strict">SafeSearch: Strict</option>
      </select>
    </div>
  );
}
