import { NextRequest, NextResponse } from 'next/server';
import { createApp, listApps, validateApp } from '@/lib/apps';
import { requireAdmin, requireAdminMutation } from '@/lib/admin-auth';
import { readBoundedJson } from '@/lib/request-security';
import { submitIndexNow } from '@/lib/indexnow';

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request); if (unauthorized) return unauthorized;
  try { return NextResponse.json(await listApps()); } catch (error) { console.error('Apps fetch error:', error); return NextResponse.json({ error: 'Failed to load apps.' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminMutation(request); if (unauthorized) return unauthorized;
  try {
    const parsed = await readBoundedJson(request, { maxBytes: 512 * 1024 }); if (!parsed.ok) return parsed.response;
    const input = parsed.value; const validationError = validateApp(input);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
    const saved = await createApp(input as never);
    if (saved.visibility === 'published') {
      const urls = saved.slug ? [`/app-store/${saved.slug}`, '/app-store'] : ['/app-store'];
      if (saved.featured && saved.showInProducts) urls.push('/');
      await submitIndexNow(urls);
    }
    return NextResponse.json(saved, { status: 201 });
  } catch (error) { console.error('App create error:', error); return NextResponse.json({ error: 'Failed to create app.' }, { status: 500 }); }
}
