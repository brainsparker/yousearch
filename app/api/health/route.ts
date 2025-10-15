import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'YouSearch',
    api: 'You.com Search API',
  });
}
