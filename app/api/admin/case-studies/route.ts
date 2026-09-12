import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, requireAdminMutation } from '@/lib/admin-auth';
import { createCaseStudy, listCaseStudies, validateCaseStudy, type CaseStudyInput } from '@/lib/case-studies';
import { listApps } from '@/lib/apps';
import { listProjects } from '@/lib/projects';
import { readBoundedJson } from '@/lib/request-security';
import { submitIndexNow } from '@/lib/indexnow';

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const [caseStudies, projects, apps] = await Promise.all([listCaseStudies(true), listProjects(true), listApps(true)]);
    return NextResponse.json({ caseStudies, sources: { projects, apps: apps.filter((app) => app.showInProjects) } });
  } catch (error) {
    console.error('Admin case studies fetch error:', error);
    return NextResponse.json({ error: 'Failed to load case studies.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminMutation(request);
  if (unauthorized) return unauthorized;
  try {
    const parsed = await readBoundedJson(request, { maxBytes: 512 * 1024 });
    if (!parsed.ok) return parsed.response;
    const input = parsed.value as Partial<CaseStudyInput>;
    const validationError = validateCaseStudy(input);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
    const saved = await createCaseStudy(input as CaseStudyInput);
    if (saved.visibility === 'published') await submitIndexNow([`/projects/${saved.slug}`, '/projects']);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('Admin case study create error:', error);
    return NextResponse.json({ error: 'Failed to create case study.' }, { status: 500 });
  }
}
