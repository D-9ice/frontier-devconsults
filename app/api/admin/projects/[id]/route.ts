import { NextRequest, NextResponse } from 'next/server';
import { deleteProject, updateProject, validateProjectInput } from '@/lib/projects';
import { requireAdmin } from '@/lib/admin-auth';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const input = await request.json();
    const validationError = validateProjectInput(input);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
    const { id } = await params;
    return NextResponse.json(await updateProject(id, input));
  } catch (error) {
    console.error('Admin project update error:', error);
    return NextResponse.json({ error: 'Failed to update project.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const { id } = await params;
    await deleteProject(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin project delete error:', error);
    return NextResponse.json({ error: 'Failed to delete project.' }, { status: 500 });
  }
}
