import { NextRequest, NextResponse } from 'next/server';
import { YouSearchClient } from '@/lib/you-search';

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

  try {
    const client = new YouSearchClient();
    const results = await client.search(query);

    if (format === 'text' || format === 'llm') {
      const formattedText = client.formatResultsForLLM(results);
      return new NextResponse(formattedText, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    }

    return NextResponse.json({
      query,
      results,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('API key')) {
      return NextResponse.json(
        {
          error: 'Configuration error',
          message: errorMessage,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Search failed',
        message: errorMessage,
      },
      { status: 500 }
    );
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

    const client = new YouSearchClient();
    const results = await client.search(query);

    if (format === 'text' || format === 'llm') {
      const formattedText = client.formatResultsForLLM(results);
      return new NextResponse(formattedText, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    }

    return NextResponse.json({
      query,
      results,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Search failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
