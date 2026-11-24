import { NextResponse } from 'next/server';

export async function GET() {
  const keyed = Boolean(process.env.YOU_API_KEY?.trim());

  return NextResponse.json({
    status: 'healthy',
    service: 'YouSearch',
    api: 'You.com Search API',
    // 'keyed' when YOU_API_KEY is set, 'keyless' when running on the free tier
    mode: keyed ? 'keyed' : 'keyless',
  });
}
