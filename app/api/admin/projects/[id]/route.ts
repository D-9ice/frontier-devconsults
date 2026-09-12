import { NextRequest, NextResponse } from 'next/server';
import { deleteProject, updateProject, validateProjectInput } from '@/lib/projects';
import { requireAdminMutation } from '@/lib/admin-auth';
import { isUuid, readBoundedJson } from '@/lib/request-security';

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
    return NextResponse.json(await updateProject(id, input as never));
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
    await deleteProject(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin project delete error:', error);
    return NextResponse.json({ error: 'Failed to delete project.' }, { status: 500 });
  }
}
