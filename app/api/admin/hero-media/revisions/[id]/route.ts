import { NextRequest, NextResponse } from 'next/server';
import { restoreHeroMedia } from '@/lib/hero-media';
import { requireAdminMutation } from '@/lib/admin-auth';
import { isUuid } from '@/lib/request-security';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const unauthorized = requireAdminMutation(request);
  if (unauthorized) return unauthorized;
  try {
    const { id } = await params;
    if (!isUuid(id)) return NextResponse.json({ error: 'Invalid revision ID.' }, { status: 400 });
    return NextResponse.json({ settings: await restoreHeroMedia(id) });
  } catch (error) {
    console.error('Hero media revision restore error:', error);
    return NextResponse.json({ error: 'Failed to restore this revision.' }, { status: 500 });
  }
}
