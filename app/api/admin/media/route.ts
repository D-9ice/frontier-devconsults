import { NextRequest, NextResponse } from 'next/server';
import { createMediaUpload, deleteMedia, mediaBuckets, validateMediaUpload } from '@/lib/admin-media';
import { requireAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const input = await request.json();
    const validationError = validateMediaUpload(input);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
    return NextResponse.json(await createMediaUpload(input));
  } catch (error) {
    console.error('Media upload URL error:', error);
    return NextResponse.json({ error: 'Unable to prepare the media upload.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { bucket, path } = await request.json();
    if (!mediaBuckets.includes(bucket) || typeof path !== 'string' || !path.trim() || path.includes('..')) {
      return NextResponse.json({ error: 'Choose a valid media asset.' }, { status: 400 });
    }
    await deleteMedia(bucket, path);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Media delete error:', error);
    return NextResponse.json({ error: 'Unable to delete the media asset.' }, { status: 500 });
  }
}
