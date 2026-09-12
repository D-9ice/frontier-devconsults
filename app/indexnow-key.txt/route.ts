import { NextResponse } from 'next/server';
import { getIndexNowKey } from '@/lib/indexnow';

export const dynamic = 'force-dynamic';

export function GET() {
  const key = getIndexNowKey();
  if (!key) return new NextResponse('Not configured.\n', { status: 404, headers: { 'X-Robots-Tag': 'noindex' } });
  return new NextResponse(`${key}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      'X-Robots-Tag': 'noindex',
    },
  });
}
