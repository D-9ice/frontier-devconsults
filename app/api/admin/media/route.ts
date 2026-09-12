import { NextRequest, NextResponse } from 'next/server';
import { createMediaUpload, deleteMedia, isValidMediaRemoval, validateMediaUpload, verifyMediaUpload } from '@/lib/admin-media';
import { requireAdminMutation } from '@/lib/admin-auth';
import { allow } from '@/lib/monitoring';
import { readBoundedJson, sourceHash } from '@/lib/request-security';
import { recordSecurityEvent } from '@/lib/security-monitoring';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminMutation(request);
  if (unauthorized) return unauthorized;

  try {
    if (!await allow(`admin-media:${sourceHash(request)}`, 30, 3600)) {
      await recordSecurityEvent(request, { category: 'admin-rate-limit', severity: 'high', actor: 'admin', result: 'media-blocked', alert: true });
      return NextResponse.json({ error: 'Media operation limit reached.' }, { status: 429 });
    }
    const parsed = await readBoundedJson(request, { maxBytes: 4096, allowedKeys: ['bucket', 'fileName', 'contentType', 'size'] }); if (!parsed.ok) return parsed.response;
    const input = parsed.value;
    const validationError = validateMediaUpload(input);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
    return NextResponse.json(await createMediaUpload(input as never));
  } catch (error) {
    console.error('Media upload URL error:', error);
    return NextResponse.json({ error: 'Unable to prepare the media upload.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const unauthorized = requireAdminMutation(request); if (unauthorized) return unauthorized;
  try {
    const parsed = await readBoundedJson(request, { maxBytes: 4096, allowedKeys: ['bucket', 'path', 'contentType', 'size'] }); if (!parsed.ok) return parsed.response;
    const input = parsed.value;
    if (!isValidMediaRemoval(input.bucket, input.path) || typeof input.contentType !== 'string' || typeof input.size !== 'number') return NextResponse.json({ error: 'Choose a valid media asset.' }, { status: 400 });
    return NextResponse.json(await verifyMediaUpload({ bucket: input.bucket, path: input.path as string, contentType: input.contentType, size: input.size }));
  } catch (error) {
    console.error('Media verification error:', error instanceof Error ? error.message : 'verification-failed');
    return NextResponse.json({ error: 'The uploaded file failed security verification and was removed.' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = requireAdminMutation(request);
  if (unauthorized) return unauthorized;

  try {
    const parsed = await readBoundedJson(request, { maxBytes: 4096, allowedKeys: ['bucket', 'path'] }); if (!parsed.ok) return parsed.response;
    const { bucket, path } = parsed.value;
    if (!isValidMediaRemoval(bucket, path)) {
      return NextResponse.json({ error: 'Choose a valid media asset.' }, { status: 400 });
    }
    await deleteMedia(bucket, path as string);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Media delete error:', error);
    return NextResponse.json({ error: 'Unable to delete the media asset.' }, { status: 500 });
  }
}
