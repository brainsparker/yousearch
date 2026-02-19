'use client';

import { useState } from 'react';
import { ParamControl } from './ParamControl';
import { ResponseViewer } from './ResponseViewer';
import styles from './Playground.module.css';

export function Playground() {
  const [query, setQuery] = useState('');
  const [count, setCount] = useState('10');
  const [freshness, setFreshness] = useState('');
  const [country, setCountry] = useState('');
  const [safesearch, setSafesearch] = useState('moderate');
  const [format, setFormat] = useState('json');
  const [offset, setOffset] = useState('0');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{
    status: number;
    timing: number;
    body: string;
  } | null>(null);
  const [curlCopied, setCurlCopied] = useState(false);

  function buildParams() {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (count && count !== '10') params.set('count', count);
    if (freshness) params.set('freshness', freshness);
    if (country) params.set('country', country);
    if (safesearch && safesearch !== 'moderate') params.set('safesearch', safesearch);
    if (format && format !== 'json') params.set('format', format);
    if (offset && offset !== '0') params.set('offset', offset);
    return params;
  }

  function buildUrl() {
    const params = buildParams();
    return `/api/search?${params.toString()}`;
  }

  function buildCurl() {
    const params = buildParams();
    return `curl '${window.location.origin}/api/search?${params.toString()}'`;
  }

  async function handleExecute() {
    if (!query.trim()) return;
    setLoading(true);
    setResponse(null);

    const url = buildUrl();
    const start = performance.now();

    try {
      const res = await fetch(url);
      const timing = performance.now() - start;
      const text = await res.text();

      let body: string;
      try {
        body = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        body = text;
      }

      setResponse({ status: res.status, timing, body });
    } catch (err) {
      const timing = performance.now() - start;
      setResponse({
        status: 0,
        timing,
        body: err instanceof Error ? err.message : 'Request failed',
      });
    } finally {
      setLoading(false);
    }
  }

  const handleCopyCurl = async () => {
    await navigator.clipboard.writeText(buildCurl());
    setCurlCopied(true);
    setTimeout(() => setCurlCopied(false), 2000);
  };

  return (
    <div className={styles.playground}>
      <h1 className={styles.title}># API Playground</h1>
      <p className={styles.subtitle}>Build and test API queries interactively.</p>

      <div className={styles.params}>
        <ParamControl label="query" value={query} onChange={setQuery} placeholder="Search query..." />
        <ParamControl
          label="count"
          value={count}
          onChange={setCount}
          options={[
            { label: '5', value: '5' },
            { label: '10', value: '10' },
            { label: '20', value: '20' },
            { label: '50', value: '50' },
          ]}
        />
        <ParamControl
          label="freshness"
          value={freshness}
          onChange={setFreshness}
          options={[
            { label: 'Any time', value: '' },
            { label: 'Past day', value: 'day' },
            { label: 'Past week', value: 'week' },
            { label: 'Past month', value: 'month' },
            { label: 'Past year', value: 'year' },
          ]}
        />
        <ParamControl
          label="country"
          value={country}
          onChange={setCountry}
          options={[
            { label: 'Any', value: '' },
            { label: 'US', value: 'US' },
            { label: 'UK', value: 'GB' },
            { label: 'Canada', value: 'CA' },
            { label: 'Germany', value: 'DE' },
            { label: 'France', value: 'FR' },
            { label: 'Japan', value: 'JP' },
          ]}
        />
        <ParamControl
          label="safesearch"
          value={safesearch}
          onChange={setSafesearch}
          options={[
            { label: 'Moderate', value: 'moderate' },
            { label: 'Off', value: 'off' },
            { label: 'Strict', value: 'strict' },
          ]}
        />
        <ParamControl
          label="format"
          value={format}
          onChange={setFormat}
          options={[
            { label: 'JSON', value: 'json' },
            { label: 'Text', value: 'text' },
            { label: 'LLM', value: 'llm' },
          ]}
        />
        <ParamControl
          label="offset"
          value={offset}
          onChange={setOffset}
          options={Array.from({ length: 10 }, (_, i) => ({
            label: String(i),
            value: String(i),
          }))}
        />
      </div>

      <div className={styles.preview}>
        <span className={styles.method}>GET</span>
        <code className={styles.url}>{buildUrl()}</code>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.execute}
          onClick={handleExecute}
          disabled={!query.trim() || loading}
        >
          {loading ? '> Executing...' : '> Execute'}
        </button>
        <button className={styles.curl} onClick={handleCopyCurl}>
          {curlCopied ? '> Copied!' : '> Copy curl'}
        </button>
      </div>

      {response && (
        <ResponseViewer status={response.status} timing={response.timing} body={response.body} />
      )}
    </div>
  );
}
