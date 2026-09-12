import { NextRequest, NextResponse } from 'next/server';
import { requireAdminMutation } from '@/lib/admin-auth';
import { listCaseStudies, updateCaseStudy, validateCaseStudy, type CaseStudyInput } from '@/lib/case-studies';
import { isUuid, readBoundedJson } from '@/lib/request-security';
import { hasMeaningfulPublicChange, submitIndexNow } from '@/lib/indexnow';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const unauthorized = requireAdminMutation(request);
  if (unauthorized) return unauthorized;
  try {
    const { id } = await params;
    if (!isUuid(id)) return NextResponse.json({ error: 'Invalid case-study ID.' }, { status: 400 });
    const parsed = await readBoundedJson(request, { maxBytes: 512 * 1024 });
    if (!parsed.ok) return parsed.response;
    const input = parsed.value as Partial<CaseStudyInput>;
    const validationError = validateCaseStudy(input);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
    const before = (await listCaseStudies(true)).find((item) => item.id === id);
    const saved = await updateCaseStudy(id, input as CaseStudyInput);
    if (before && hasMeaningfulPublicChange(before, saved)) {
      const urls = ['/projects'];
      if (before.visibility === 'published') urls.push(`/projects/${before.slug}`);
      if (saved.visibility === 'published') urls.push(`/projects/${saved.slug}`);
      await submitIndexNow(urls);
    }
    return NextResponse.json(saved);
  } catch (error) {
    console.error('Admin case study update error:', error);
    return NextResponse.json({ error: 'Failed to update case study.' }, { status: 500 });
  }
}
