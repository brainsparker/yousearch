/**
 * You.com Extract API Client
 *
 * Turns one webpage or PDF URL into clean Markdown. This is what powers the
 * "Read page" button on each result and the /api/extract endpoint.
 *
 * Two modes, matching the search client:
 * - keyed: YOU_API_KEY is set. Calls POST https://ydc-index.io/v1/extract.
 * - keyless: no key. Calls the `you-extract` tool on You.com's keyless MCP
 *   endpoint (https://api.you.com/mcp/free, rate limited per day). Keyless
 *   calls may pass only a URL, so both modes use the API defaults.
 *
 * @see https://you.com/docs/guides/extract
 * @see https://you.com/docs/developer-resources/mcp-server
 */

export type ExtractMode = 'keyed' | 'keyless';

/**
 * One extracted page
 */
export interface ExtractedPage {
  url: string;
  title?: string;
  markdown: string;
  /** Where the content came from: blend, cache, or fetch */
  extraction_source?: string;
  site_name?: string;
  mode: ExtractMode;
}

/**
 * Error from an extract call. `status` is the HTTP status this app should
 * answer with, `code` is a stable string to branch on.
 */
export class ExtractError extends Error {
  readonly status: number;
  readonly code: string;
  readonly retryable: boolean;

  constructor(message: string, status: number, code: string, retryable = false) {
    super(message);
    this.name = 'ExtractError';
    this.status = status;
    this.code = code;
    this.retryable = retryable;
  }
}

/** Raw Extract API response (also the `output` of the you-extract MCP tool) */
interface ExtractApiPage {
  url?: string;
  title?: string;
  extraction_source?: string;
  contents?: { full_page?: { markdown?: string; html?: string } };
  metadata?: { site_name?: string | null; favicon_url?: string | null } | null;
}

interface JsonRpcMessage {
  id?: number | string | null;
  result?: {
    isError?: boolean;
    content?: Array<{ type: string; text?: string }>;
    structuredContent?: { output?: ExtractApiPage };
  };
  error?: { code?: number; message?: string };
}

const KEYED_URL = 'https://ydc-index.io/v1/extract';
const KEYLESS_MCP_URL = 'https://api.you.com/mcp/free';

/** The Extract API allows 30 seconds by default, so wait a little longer than that */
const REQUEST_TIMEOUT_MS = 40_000;

const KEYLESS_LIMIT_HINT =
  'Keyless free-tier limit reached. Add YOU_API_KEY for higher limits (free key at https://you.com/platform).';

/**
 * Returns a normalized http(s) URL, or throws an ExtractError the caller can
 * send straight back as a 400.
 */
export function normalizeTargetUrl(input: string): string {
  let parsed: URL;
  try {
    parsed = new URL(input.trim());
  } catch {
    throw new ExtractError('The url parameter is not a valid URL', 400, 'invalid_url');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new ExtractError('Only http and https URLs can be extracted', 400, 'invalid_url');
  }
  return parsed.toString();
}

/**
 * Reads a JSON-RPC response that may arrive as plain JSON or as a
 * Server-Sent Events stream, and returns the message that answers `id`.
 * Progress notifications in the stream are skipped.
 */
export function parseJsonRpcResponse(body: string, id: number): JsonRpcMessage | undefined {
  const candidates: string[] = [];
  const trimmed = body.trim();

  if (trimmed.startsWith('{')) {
    candidates.push(trimmed);
  } else {
    // SSE: an event's data may span several `data:` lines, events end on a blank line
    let data: string[] = [];
    for (const line of body.split(/\r?\n/)) {
      if (line.startsWith('data:')) {
        data.push(line.slice(5).replace(/^ /, ''));
      } else if (line === '' && data.length > 0) {
        candidates.push(data.join('\n'));
        data = [];
      }
    }
    if (data.length > 0) candidates.push(data.join('\n'));
  }

  let fallback: JsonRpcMessage | undefined;
  for (const candidate of candidates) {
    let message: JsonRpcMessage;
    try {
      message = JSON.parse(candidate);
    } catch {
      continue;
    }
    if (!message.result && !message.error) continue;
    if (message.id === id) return message;
    fallback = message;
  }
  return fallback;
}

function toPage(raw: ExtractApiPage | undefined, requestedUrl: string, mode: ExtractMode) {
  const markdown = raw?.contents?.full_page?.markdown;
  if (!markdown || !markdown.trim()) {
    throw new ExtractError('No readable content was found at that URL', 422, 'no_content');
  }
  const page: ExtractedPage = { url: raw?.url || requestedUrl, markdown, mode };
  if (raw?.title) page.title = raw.title;
  if (raw?.extraction_source) page.extraction_source = raw.extraction_source;
  if (raw?.metadata?.site_name) page.site_name = raw.metadata.site_name;
  return page;
}

async function send(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, {
      ...init,
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'TimeoutError';
    throw new ExtractError(
      timedOut
        ? 'The page took too long to extract'
        : `Could not reach You.com: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timedOut ? 504 : 502,
      timedOut ? 'timeout' : 'upstream_unreachable',
      true
    );
  }
}

/**
 * Keyed path: POST /v1/extract with the API key.
 * Error bodies carry a stable `code` and a `retryable` flag, which are passed on.
 */
async function extractKeyed(url: string, apiKey: string): Promise<ExtractedPage> {
  const response = await send(KEYED_URL, {
    method: 'POST',
    headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (response.ok) {
    return toPage((await response.json()) as ExtractApiPage, url, 'keyed');
  }

  if (response.status === 401 || response.status === 403) {
    throw new ExtractError(`Invalid API key (${response.status})`, 502, 'invalid_api_key');
  }
  if (response.status === 429) {
    throw new ExtractError('Rate limit exceeded (429)', 429, 'rate_limited', true);
  }

  let code = response.status === 402 ? 'payment_required' : 'extract_failed';
  let message = `Extract API request failed: ${response.status}`;
  let retryable = false;
  try {
    const body = (await response.json()) as {
      error?: { code?: string; message?: string; retryable?: boolean };
    };
    if (body.error?.code) code = body.error.code;
    if (body.error?.message) message = body.error.message;
    retryable = body.error?.retryable === true;
  } catch {
    // Not a JSON error body, keep the generic message
  }

  // 402 and 422 describe the request, so pass them through. Everything else is an upstream failure.
  const status =
    response.status === 402 || response.status === 422
      ? response.status
      : response.status === 504
        ? 504
        : 502;
  throw new ExtractError(message, status, code, retryable);
}

/**
 * Keyless path: one stateless JSON-RPC `tools/call` to the you-extract tool.
 * No handshake or session is needed. The server answers with JSON or SSE.
 */
async function extractKeyless(url: string): Promise<ExtractedPage> {
  const id = 1;
  const response = await send(KEYLESS_MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id,
      method: 'tools/call',
      params: { name: 'you-extract', arguments: { url } },
    }),
  });

  if (response.status === 429) {
    throw new ExtractError(KEYLESS_LIMIT_HINT, 429, 'rate_limited');
  }
  if (!response.ok) {
    throw new ExtractError(
      `Keyless extract request failed: ${response.status}`,
      502,
      'extract_failed'
    );
  }

  const message = parseJsonRpcResponse(await response.text(), id);
  if (!message) {
    throw new ExtractError('Keyless extract returned no result', 502, 'extract_failed');
  }
  if (message.error) {
    throw new ExtractError(
      message.error.message || 'Keyless extract failed',
      502,
      'extract_failed'
    );
  }

  const result = message.result;
  const text = result?.content?.find((part) => part.type === 'text')?.text;

  if (result?.isError) {
    const detail = (text || 'Keyless extract failed').replace(/^Error extracting content:\s*/, '');
    if (/\b429\b|rate limit|quota/i.test(detail)) {
      throw new ExtractError(KEYLESS_LIMIT_HINT, 429, 'rate_limited');
    }
    if (/public http or https/i.test(detail)) {
      throw new ExtractError(`That URL cannot be extracted (${detail})`, 422, 'invalid_url');
    }
    if (/\b422\b/.test(detail)) {
      // The keyless tool reports the status but not the API's error code
      throw new ExtractError(
        'You.com could not extract that URL (422). It may be unreachable, or a PDF too large for the default timeout.',
        422,
        'unprocessable_url'
      );
    }
    throw new ExtractError(detail, 502, 'extract_failed');
  }

  let output = result?.structuredContent?.output;
  if (!output && text) {
    try {
      output = (JSON.parse(text) as { output?: ExtractApiPage }).output;
    } catch {
      // Fall through to the no_content error below
    }
  }
  return toPage(output, url, 'keyless');
}

/**
 * Extracts one webpage or PDF as Markdown.
 *
 * @example
 *   const page = await extractPage('https://example.com/report.pdf');
 *   console.log(page.title, page.markdown);
 */
export async function extractPage(targetUrl: string, apiKey?: string): Promise<ExtractedPage> {
  const url = normalizeTargetUrl(targetUrl);
  const key = (apiKey ?? process.env.YOU_API_KEY ?? '').trim();
  return key ? extractKeyed(url, key) : extractKeyless(url);
}
