import { NextRequest, NextResponse } from 'next/server';
import { deleteApp, updateApp, validateApp } from '@/lib/apps';
import { requireAdminMutation } from '@/lib/admin-auth';
import { isUuid, readBoundedJson } from '@/lib/request-security';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const unauthorized = requireAdminMutation(request); if (unauthorized) return unauthorized;
  try { const parsed = await readBoundedJson(request, { maxBytes: 512 * 1024 }); if (!parsed.ok) return parsed.response; const input = parsed.value; const validationError = validateApp(input); if (validationError) return NextResponse.json({ error: validationError }, { status: 400 }); const { id } = await params; if (!isUuid(id)) return NextResponse.json({ error: 'Invalid app ID.' }, { status: 400 }); return NextResponse.json(await updateApp(id, input as never)); } catch (error) { console.error('App update error:', error); return NextResponse.json({ error: 'Failed to update app.' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const unauthorized = requireAdminMutation(request); if (unauthorized) return unauthorized;
  try { const { id } = await params; if (!isUuid(id)) return NextResponse.json({ error: 'Invalid app ID.' }, { status: 400 }); await deleteApp(id); return NextResponse.json({ success: true }); } catch (error) { console.error('App delete error:', error); return NextResponse.json({ error: 'Failed to delete app.' }, { status: 500 }); }
}
