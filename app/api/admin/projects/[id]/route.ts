import { NextRequest, NextResponse } from 'next/server';
import { deleteProject, listProjects, updateProject, validateProjectInput } from '@/lib/projects';
import { requireAdminMutation } from '@/lib/admin-auth';
import { isUuid, readBoundedJson } from '@/lib/request-security';
import { listCaseStudies } from '@/lib/case-studies';
import { hasMeaningfulPublicChange, submitIndexNow } from '@/lib/indexnow';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const unauthorized = requireAdminMutation(request);
  if (unauthorized) return unauthorized;
  try {
    const parsed = await readBoundedJson(request, { maxBytes: 256 * 1024 }); if (!parsed.ok) return parsed.response;
    const input = parsed.value;
    const validationError = validateProjectInput(input);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
    const { id } = await params;
    if (!isUuid(id)) return NextResponse.json({ error: 'Invalid project ID.' }, { status: 400 });
    const [before, related] = await Promise.all([
      listProjects(true).then((items) => items.find((project) => project.id === id)),
      listCaseStudies(false).then((items) => items.filter((item) => item.projectId === id)),
    ]);
    const saved = await updateProject(id, input as never);
    if (before && hasMeaningfulPublicChange(before, saved)) {
      const urls = related.flatMap((item) => [`/projects/${item.slug}`]);
      if (related.length) urls.push('/projects');
      if ((before.visibility === 'published' && before.featured) || (saved.visibility === 'published' && saved.featured)) urls.push('/');
      await submitIndexNow(urls);
    }
    return NextResponse.json(saved);
  } catch (error) {
    console.error('Admin project update error:', error);
    return NextResponse.json({ error: 'Failed to update project.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const unauthorized = requireAdminMutation(request);
  if (unauthorized) return unauthorized;
  try {
    const { id } = await params;
    if (!isUuid(id)) return NextResponse.json({ error: 'Invalid project ID.' }, { status: 400 });
    const [before, related] = await Promise.all([
      listProjects(true).then((items) => items.find((project) => project.id === id)),
      listCaseStudies(false).then((items) => items.filter((item) => item.projectId === id)),
    ]);
    await deleteProject(id);
    const urls = related.flatMap((item) => [`/projects/${item.slug}`]);
    if (related.length) urls.push('/projects');
    if (before?.visibility === 'published' && before.featured) urls.push('/');
    await submitIndexNow(urls);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin project delete error:', error);
    return NextResponse.json({ error: 'Failed to delete project.' }, { status: 500 });
  }
}
