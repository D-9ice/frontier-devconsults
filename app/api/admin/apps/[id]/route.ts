import { NextRequest, NextResponse } from 'next/server';
import { deleteApp, listApps, updateApp, validateApp } from '@/lib/apps';
import { requireAdminMutation } from '@/lib/admin-auth';
import { isUuid, readBoundedJson } from '@/lib/request-security';
import { hasMeaningfulPublicChange, submitIndexNow } from '@/lib/indexnow';
import { listCaseStudies } from '@/lib/case-studies';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const unauthorized = requireAdminMutation(request); if (unauthorized) return unauthorized;
  try {
    const parsed = await readBoundedJson(request, { maxBytes: 512 * 1024 }); if (!parsed.ok) return parsed.response;
    const input = parsed.value; const validationError = validateApp(input);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
    const { id } = await params; if (!isUuid(id)) return NextResponse.json({ error: 'Invalid app ID.' }, { status: 400 });
    const [before, related] = await Promise.all([
      listApps(true).then((items) => items.find((app) => app.id === id)),
      listCaseStudies(false).then((items) => items.filter((item) => item.appId === id)),
    ]);
    const saved = await updateApp(id, input as never);
    if (before && hasMeaningfulPublicChange(before, saved)) {
      const urls = ['/app-store'];
      if (before.visibility === 'published' && before.slug) urls.push(`/app-store/${before.slug}`);
      if (saved.visibility === 'published' && saved.slug) urls.push(`/app-store/${saved.slug}`);
      related.forEach((item) => urls.push(`/projects/${item.slug}`));
      if (related.length) urls.push('/projects');
      if ((before.visibility === 'published' && before.featured && before.showInProducts) || (saved.visibility === 'published' && saved.featured && saved.showInProducts)) urls.push('/');
      await submitIndexNow(urls);
    }
    return NextResponse.json(saved);
  } catch (error) { console.error('App update error:', error); return NextResponse.json({ error: 'Failed to update app.' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const unauthorized = requireAdminMutation(request); if (unauthorized) return unauthorized;
  try {
    const { id } = await params; if (!isUuid(id)) return NextResponse.json({ error: 'Invalid app ID.' }, { status: 400 });
    const [before, related] = await Promise.all([
      listApps(true).then((items) => items.find((app) => app.id === id)),
      listCaseStudies(false).then((items) => items.filter((item) => item.appId === id)),
    ]);
    await deleteApp(id);
    if (before?.visibility === 'published') {
      const urls = before.slug ? [`/app-store/${before.slug}`, '/app-store'] : ['/app-store'];
      related.forEach((item) => urls.push(`/projects/${item.slug}`));
      if (related.length) urls.push('/projects');
      if (before.featured && before.showInProducts) urls.push('/');
      await submitIndexNow(urls);
    }
    return NextResponse.json({ success: true });
  } catch (error) { console.error('App delete error:', error); return NextResponse.json({ error: 'Failed to delete app.' }, { status: 500 }); }
}
