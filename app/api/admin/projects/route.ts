import { NextRequest, NextResponse } from 'next/server';
import { createProject, listProjects, validateProjectInput } from '@/lib/projects';
import { requireAdmin } from '@/lib/admin-auth';

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
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const input = await request.json();
    const validationError = validateProjectInput(input);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
    return NextResponse.json(await createProject(input), { status: 201 });
  } catch (error) {
    console.error('Admin project create error:', error);
    return NextResponse.json({ error: 'Failed to create project.' }, { status: 500 });
  }
}
