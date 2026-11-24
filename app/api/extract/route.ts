import { NextRequest, NextResponse } from 'next/server';
import { extractPage, ExtractError } from '@/lib/you-extract';

// Extraction can wait on a live crawl, so allow more than the default function time
export const maxDuration = 60;

async function handle(url: unknown, format: unknown) {
  if (typeof url !== 'string' || !url.trim()) {
    return NextResponse.json(
      {
        error: 'No url provided',
        message: 'Please provide the page to read using the "url" parameter',
      },
      { status: 400 }
    );
  }

  try {
    const page = await extractPage(url);
    const headers = { 'X-YouSearch-Mode': page.mode };

    if (format === 'markdown' || format === 'md' || format === 'text' || format === 'llm') {
      const heading = page.title ? `# ${page.title}\n\n` : '';
      return new NextResponse(`${heading}Source: ${page.url}\n\n${page.markdown}\n`, {
        status: 200,
        headers: { ...headers, 'Content-Type': 'text/markdown; charset=utf-8' },
      });
    }

    return NextResponse.json(page, { headers });
  } catch (error) {
    if (error instanceof ExtractError) {
      return NextResponse.json(
        { error: error.code, message: error.message, retryable: error.retryable },
        { status: error.status }
      );
    }
    return NextResponse.json(
      {
        error: 'extract_failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        retryable: false,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  return handle(params.get('url'), params.get('format') || 'json');
}

export async function POST(request: NextRequest) {
  let body: { url?: unknown; format?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON', message: 'The request body must be JSON' },
      { status: 400 }
    );
  }
  return handle(body.url, body.format || 'json');
}
