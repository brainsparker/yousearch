import { NextRequest, NextResponse } from 'next/server';
import { YouSearchClient, YouApiError } from '@/lib/you-search';
import type { SearchOptions } from '@/lib/you-search';

function errorResponse(error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const status = error instanceof YouApiError ? error.status : 500;

  return NextResponse.json(
    {
      error: status === 429 ? 'rate_limited' : 'Search failed',
      message: errorMessage,
    },
    { status }
  );
}

function extractOptions(params: URLSearchParams): SearchOptions {
  const options: SearchOptions = {};
  const count = params.get('count');
  if (count) options.count = parseInt(count, 10);
  const freshness = params.get('freshness');
  if (freshness) options.freshness = freshness;
  const offset = params.get('offset');
  if (offset) options.offset = parseInt(offset, 10);
  const country = params.get('country');
  if (country) options.country = country;
  const language = params.get('language');
  if (language) options.language = language;
  const safesearch = params.get('safesearch');
  if (safesearch) options.safesearch = safesearch as SearchOptions['safesearch'];
  return options;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || searchParams.get('query');
  const format = searchParams.get('format') || 'json';

  if (!query) {
    return NextResponse.json(
      {
        error: 'No query provided',
        message: 'Please provide a search query using the "q" or "query" parameter',
      },
      { status: 400 }
    );
  }

  const options = extractOptions(searchParams);

  // Uses YOU_API_KEY when it is set, otherwise the keyless free tier
  const client = new YouSearchClient();

  try {
    const results = await client.search(query, options);

    if (format === 'text' || format === 'llm') {
      const formattedText = client.formatResultsForLLM(results);
      return new NextResponse(formattedText, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-YouSearch-Mode': client.mode,
        },
      });
    }

    // Flatten the response: { query, mode, results: { web, news }, metadata }
    return NextResponse.json(
      {
        query,
        mode: client.mode,
        results: results.results || {},
        metadata: results.metadata,
      },
      { headers: { 'X-YouSearch-Mode': client.mode } }
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = body.query || body.q;
    const format = body.format || 'json';

    if (!query) {
      return NextResponse.json(
        {
          error: 'No query provided',
          message: 'Please provide a search query',
        },
        { status: 400 }
      );
    }

    // Extract options from body
    const bodyParams = new URLSearchParams();
    if (body.count) bodyParams.set('count', String(body.count));
    if (body.freshness) bodyParams.set('freshness', body.freshness);
    if (body.offset) bodyParams.set('offset', String(body.offset));
    if (body.country) bodyParams.set('country', body.country);
    if (body.language) bodyParams.set('language', body.language);
    if (body.safesearch) bodyParams.set('safesearch', body.safesearch);
    const options = extractOptions(bodyParams);

    // Uses YOU_API_KEY when it is set, otherwise the keyless free tier
    const client = new YouSearchClient();

    const results = await client.search(query, options);

    if (format === 'text' || format === 'llm') {
      const formattedText = client.formatResultsForLLM(results);
      return new NextResponse(formattedText, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-YouSearch-Mode': client.mode,
        },
      });
    }

    return NextResponse.json(
      {
        query,
        mode: client.mode,
        results: results.results || {},
        metadata: results.metadata,
      },
      { headers: { 'X-YouSearch-Mode': client.mode } }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
