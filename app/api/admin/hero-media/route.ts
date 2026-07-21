import { NextRequest, NextResponse } from 'next/server';
import { getHeroMedia, getHeroMediaRevisions, saveHeroMedia, validateHeroMedia } from '@/lib/hero-media';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const [settings, revisions] = await Promise.all([getHeroMedia(), getHeroMediaRevisions()]);
    return NextResponse.json({ settings, revisions });
  } catch (error) {
    console.error('Hero media fetch error:', error);
    return NextResponse.json({ error: 'Failed to load hero media settings. Run the latest Supabase migration first.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const settings = await request.json();
    const validationError = validateHeroMedia(settings);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
    return NextResponse.json({ settings: await saveHeroMedia(settings) });
  } catch (error) {
    console.error('Hero media save error:', error);
    return NextResponse.json({ error: 'Failed to save hero media settings.' }, { status: 500 });
  }
}
