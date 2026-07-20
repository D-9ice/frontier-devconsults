import { NextRequest, NextResponse } from 'next/server';
import { deleteApp, updateApp, validateApp } from '@/lib/apps';
import { requireAdmin } from '@/lib/admin-auth';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const unauthorized = requireAdmin(request); if (unauthorized) return unauthorized;
  try { const input = await request.json(); const validationError = validateApp(input); if (validationError) return NextResponse.json({ error: validationError }, { status: 400 }); const { id } = await params; return NextResponse.json(await updateApp(id, input)); } catch (error) { console.error('App update error:', error); return NextResponse.json({ error: 'Failed to update app.' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const unauthorized = requireAdmin(request); if (unauthorized) return unauthorized;
  try { const { id } = await params; await deleteApp(id); return NextResponse.json({ success: true }); } catch (error) { console.error('App delete error:', error); return NextResponse.json({ error: 'Failed to delete app.' }, { status: 500 }); }
}
