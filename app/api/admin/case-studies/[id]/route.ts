import { NextRequest, NextResponse } from 'next/server';
import { requireAdminMutation } from '@/lib/admin-auth';
import { updateCaseStudy, validateCaseStudy, type CaseStudyInput } from '@/lib/case-studies';
import { isUuid, readBoundedJson } from '@/lib/request-security';

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
    return NextResponse.json(await updateCaseStudy(id, input as CaseStudyInput));
  } catch (error) {
    console.error('Admin case study update error:', error);
    return NextResponse.json({ error: 'Failed to update case study.' }, { status: 500 });
  }
}
