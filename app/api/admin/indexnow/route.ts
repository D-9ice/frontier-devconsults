import { NextRequest, NextResponse } from 'next/server';
import { requireAdminMutation } from '@/lib/admin-auth';
import { submitIndexNow } from '@/lib/indexnow';
import { readBoundedJson } from '@/lib/request-security';

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminMutation(request);
  if (unauthorized) return unauthorized;
  const parsed = await readBoundedJson(request, { maxBytes: 32 * 1024 });
  if (!parsed.ok) return parsed.response;
  const urls = (parsed.value as { urls?: unknown }).urls;
  if (!Array.isArray(urls) || !urls.length || urls.length > 100 || urls.some((url) => typeof url !== 'string')) {
    return NextResponse.json({ error: 'Provide 1 to 100 public production URLs.' }, { status: 400 });
  }
  return NextResponse.json(await submitIndexNow(urls));
}
