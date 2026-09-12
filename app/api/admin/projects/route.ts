import { NextRequest, NextResponse } from 'next/server';
import { createProject, listProjects, validateProjectInput } from '@/lib/projects';
import { requireAdmin, requireAdminMutation } from '@/lib/admin-auth';
import { readBoundedJson } from '@/lib/request-security';
import { submitIndexNow } from '@/lib/indexnow';

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    return NextResponse.json(await listProjects());
  } catch (error) {
    console.error('Admin projects fetch error:', error);
    return NextResponse.json({ error: 'Failed to load projects.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminMutation(request);
  if (unauthorized) return unauthorized;
  try {
    const parsed = await readBoundedJson(request, { maxBytes: 256 * 1024 }); if (!parsed.ok) return parsed.response;
    const input = parsed.value;
    const validationError = validateProjectInput(input);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
    const saved = await createProject(input as never);
    if (saved.visibility === 'published' && saved.featured) await submitIndexNow(['/']);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('Admin project create error:', error);
    return NextResponse.json({ error: 'Failed to create project.' }, { status: 500 });
  }
}
