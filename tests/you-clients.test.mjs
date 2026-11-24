// Unit tests for the You.com clients. No network: global fetch is stubbed.
// Run with `npm test` (Node 22.18+ or 24, which can import .ts files directly).
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { YouSearchClient, YouApiError, KEYLESS_LIMIT_HINT } from '../lib/you-search.ts';
import {
  extractPage,
  ExtractError,
  normalizeTargetUrl,
  parseJsonRpcResponse,
} from '../lib/you-extract.ts';

const realFetch = globalThis.fetch;
const realKey = process.env.YOU_API_KEY;
let calls;

function stubFetch(respond) {
  calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    return respond(String(url), init);
  };
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const sse = (...messages) =>
  new Response(messages.map((m) => `event: message\ndata: ${JSON.stringify(m)}\n\n`).join(''), {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  });

const extractOutput = {
  url: 'https://example.com/',
  extraction_source: 'blend',
  title: 'Example Domain',
  contents: { full_page: { markdown: '# Example\n\nBody text.' } },
  metadata: { site_name: 'Example', favicon_url: null },
};

beforeEach(() => {
  delete process.env.YOU_API_KEY;
});

afterEach(() => {
  globalThis.fetch = realFetch;
  if (realKey === undefined) delete process.env.YOU_API_KEY;
  else process.env.YOU_API_KEY = realKey;
});

// ---------- search ----------

test('search: no key uses the keyless endpoint and sends no API key header', async () => {
  stubFetch(() => json({ results: { web: [] } }));
  const client = new YouSearchClient();

  assert.equal(client.mode, 'keyless');
  await client.search('hello world', { count: 3, freshness: 'week', country: 'US' });

  const { url, init } = calls[0];
  assert.ok(url.startsWith('https://api.you.com/v1/agents/search?'));
  const params = new URL(url).searchParams;
  assert.equal(params.get('query'), 'hello world');
  assert.equal(params.get('count'), '3');
  assert.equal(params.get('freshness'), 'week');
  assert.equal(params.get('country'), 'US');
  assert.equal(init.headers['X-API-Key'], undefined);
});

test('search: a key from the environment uses the keyed endpoint with X-API-Key', async () => {
  process.env.YOU_API_KEY = 'ydc-test';
  stubFetch(() => json({ results: { web: [] } }));
  const client = new YouSearchClient();

  assert.equal(client.mode, 'keyed');
  await client.search('hello');

  assert.ok(calls[0].url.startsWith('https://ydc-index.io/v1/search?'));
  assert.equal(calls[0].init.headers['X-API-Key'], 'ydc-test');
});

test('search: a blank key counts as no key', () => {
  process.env.YOU_API_KEY = '   ';
  assert.equal(new YouSearchClient().mode, 'keyless');
});

test('search: keyless 429 carries the upgrade hint and a 429 status', async () => {
  stubFetch(() => json({ message: 'Too Many Requests' }, 429));
  await assert.rejects(new YouSearchClient().search('q'), (error) => {
    assert.ok(error instanceof YouApiError);
    assert.equal(error.status, 429);
    assert.equal(error.message, KEYLESS_LIMIT_HINT);
    return true;
  });
});

test('search: keyed 401 reports an invalid key as an upstream failure', async () => {
  stubFetch(() => json({ message: 'Unauthorized' }, 401));
  await assert.rejects(new YouSearchClient('bad').search('q'), (error) => {
    assert.ok(error instanceof YouApiError);
    assert.equal(error.status, 502);
    assert.match(error.message, /Invalid API key \(401\)/);
    return true;
  });
});

test('search: a network failure becomes a 502 YouApiError', async () => {
  stubFetch(() => {
    throw new TypeError('fetch failed');
  });
  await assert.rejects(new YouSearchClient().search('q'), (error) => {
    assert.ok(error instanceof YouApiError);
    assert.equal(error.status, 502);
    return true;
  });
});

// ---------- extract: input ----------

test('extract: rejects malformed and non-http URLs before any request', async () => {
  stubFetch(() => json({}));
  for (const bad of [
    'not a url',
    'ftp://example.com/a',
    'javascript:alert(1)',
    'file:///etc/passwd',
  ]) {
    await assert.rejects(extractPage(bad), (error) => {
      assert.ok(error instanceof ExtractError);
      assert.equal(error.status, 400);
      assert.equal(error.code, 'invalid_url');
      return true;
    });
  }
  assert.equal(calls.length, 0);
  assert.equal(normalizeTargetUrl('  https://example.com  '), 'https://example.com/');
});

// ---------- extract: keyed ----------

test('extract keyed: posts { url } to /v1/extract with the key and maps the page', async () => {
  stubFetch(() => json(extractOutput));
  const page = await extractPage('https://example.com', 'ydc-test');

  const { url, init } = calls[0];
  assert.equal(url, 'https://ydc-index.io/v1/extract');
  assert.equal(init.method, 'POST');
  assert.equal(init.headers['X-API-Key'], 'ydc-test');
  assert.deepEqual(JSON.parse(init.body), { url: 'https://example.com/' });

  assert.deepEqual(page, {
    url: 'https://example.com/',
    markdown: '# Example\n\nBody text.',
    mode: 'keyed',
    title: 'Example Domain',
    extraction_source: 'blend',
    site_name: 'Example',
  });
});

test('extract keyed: an empty object means no content (422 no_content)', async () => {
  stubFetch(() => json({}));
  await assert.rejects(extractPage('https://example.com', 'k'), (error) => {
    assert.equal(error.status, 422);
    assert.equal(error.code, 'no_content');
    return true;
  });
});

test('extract keyed: passes on the stable error code and retryable flag', async () => {
  stubFetch(() =>
    json(
      { error: { code: 'site_blocked', message: 'The site blocked the crawl', retryable: false } },
      502
    )
  );
  await assert.rejects(extractPage('https://example.com', 'k'), (error) => {
    assert.equal(error.status, 502);
    assert.equal(error.code, 'site_blocked');
    assert.equal(error.message, 'The site blocked the crawl');
    assert.equal(error.retryable, false);
    return true;
  });

  stubFetch(() =>
    json({ error: { code: 'invalid_url', message: 'unresolvable', retryable: false } }, 422)
  );
  await assert.rejects(extractPage('https://example.com', 'k'), (error) => {
    assert.equal(error.status, 422);
    assert.equal(error.code, 'invalid_url');
    return true;
  });

  stubFetch(() => json({ error: { code: 'timeout', message: 'timed out', retryable: true } }, 504));
  await assert.rejects(extractPage('https://example.com', 'k'), (error) => {
    assert.equal(error.status, 504);
    assert.equal(error.retryable, true);
    return true;
  });
});

test('extract keyed: 403 is an invalid key, 402 without a JSON body is payment_required', async () => {
  stubFetch(() => json({ message: 'Forbidden' }, 403));
  await assert.rejects(extractPage('https://example.com', 'k'), (error) => {
    assert.equal(error.code, 'invalid_api_key');
    assert.equal(error.status, 502);
    return true;
  });

  stubFetch(() => new Response('Payment Required', { status: 402 }));
  await assert.rejects(extractPage('https://example.com', 'k'), (error) => {
    assert.equal(error.code, 'payment_required');
    assert.equal(error.status, 402);
    return true;
  });
});

// ---------- extract: keyless (MCP) ----------

test('extract keyless: calls you-extract on /mcp/free with only a url', async () => {
  stubFetch(() =>
    sse(
      {
        jsonrpc: '2.0',
        method: 'notifications/message',
        params: { level: 'info', data: 'started' },
      },
      { jsonrpc: '2.0', id: 1, result: { structuredContent: { output: extractOutput } } }
    )
  );
  const page = await extractPage('https://example.com');

  const { url, init } = calls[0];
  assert.equal(url, 'https://api.you.com/mcp/free');
  assert.equal(init.headers.Accept, 'application/json, text/event-stream');
  assert.equal(init.headers['X-API-Key'], undefined);
  assert.equal(init.headers.Authorization, undefined);
  assert.deepEqual(JSON.parse(init.body), {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: { name: 'you-extract', arguments: { url: 'https://example.com/' } },
  });

  assert.equal(page.mode, 'keyless');
  assert.equal(page.title, 'Example Domain');
  assert.equal(page.markdown, '# Example\n\nBody text.');
});

test('extract keyless: reads a plain JSON answer and falls back to the text content', async () => {
  stubFetch(() =>
    json({
      jsonrpc: '2.0',
      id: 1,
      result: { content: [{ type: 'text', text: JSON.stringify({ output: extractOutput }) }] },
    })
  );
  const page = await extractPage('https://example.com');
  assert.equal(page.markdown, '# Example\n\nBody text.');
});

test('extract keyless: tool errors map to 422, 429, or 502', async () => {
  const toolError = (text) =>
    sse({ jsonrpc: '2.0', id: 1, result: { isError: true, content: [{ type: 'text', text }] } });

  stubFetch(() => toolError('Error extracting content: URL must be a public http or https URL'));
  await assert.rejects(extractPage('http://localhost:3000/x'), (error) => {
    assert.equal(error.status, 422);
    assert.equal(error.code, 'invalid_url');
    return true;
  });

  stubFetch(() =>
    toolError('Error extracting content: Extract API request failed. Error code: 422')
  );
  await assert.rejects(extractPage('https://unresolvable.example/'), (error) => {
    assert.equal(error.status, 422);
    assert.equal(error.code, 'unprocessable_url');
    return true;
  });

  stubFetch(() =>
    toolError('Error extracting content: Extract API request failed. Error code: 429')
  );
  await assert.rejects(extractPage('https://example.com'), (error) => {
    assert.equal(error.status, 429);
    assert.equal(error.code, 'rate_limited');
    assert.match(error.message, /YOU_API_KEY/);
    return true;
  });

  stubFetch(() =>
    toolError('Error extracting content: Extract API request failed. Error code: 502')
  );
  await assert.rejects(extractPage('https://example.com'), (error) => {
    assert.equal(error.status, 502);
    assert.equal(error.code, 'extract_failed');
    return true;
  });
});

test('extract keyless: HTTP 429 and JSON-RPC errors are reported', async () => {
  stubFetch(() => json({ message: 'Too Many Requests' }, 429));
  await assert.rejects(extractPage('https://example.com'), (error) => {
    assert.equal(error.status, 429);
    return true;
  });

  stubFetch(() =>
    json({ jsonrpc: '2.0', id: null, error: { code: -32000, message: 'Not Acceptable' } })
  );
  await assert.rejects(extractPage('https://example.com'), (error) => {
    assert.equal(error.status, 502);
    assert.equal(error.message, 'Not Acceptable');
    return true;
  });
});

test('parseJsonRpcResponse: skips notifications, handles CRLF and multi-line data', () => {
  const body =
    'event: message\r\ndata: {"jsonrpc":"2.0","method":"notifications/message"}\r\n\r\n' +
    'event: message\r\ndata: {"jsonrpc":"2.0",\r\ndata: "id":1,"result":{"isError":false}}\r\n\r\n';
  assert.deepEqual(parseJsonRpcResponse(body, 1), {
    jsonrpc: '2.0',
    id: 1,
    result: { isError: false },
  });
  assert.equal(parseJsonRpcResponse('event: message\ndata: not json\n\n', 1), undefined);
  assert.equal(parseJsonRpcResponse('', 1), undefined);
});
