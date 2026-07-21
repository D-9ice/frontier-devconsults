import { NextRequest, NextResponse } from 'next/server';
import { restoreHeroMedia } from '@/lib/hero-media';
import { requireAdmin } from '@/lib/admin-auth';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const { id } = await params;
    return NextResponse.json({ settings: await restoreHeroMedia(id) });
  } catch (error) {
    console.error('Hero media revision restore error:', error);
    return NextResponse.json({ error: 'Failed to restore this revision.' }, { status: 500 });
  }
}
