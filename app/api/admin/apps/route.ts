import { NextRequest, NextResponse } from 'next/server';
import { createApp, listApps, validateApp } from '@/lib/apps';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request); if (unauthorized) return unauthorized;
  try { return NextResponse.json(await listApps()); } catch (error) { console.error('Apps fetch error:', error); return NextResponse.json({ error: 'Failed to load apps.' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request); if (unauthorized) return unauthorized;
  try { const input = await request.json(); const validationError = validateApp(input); if (validationError) return NextResponse.json({ error: validationError }, { status: 400 }); return NextResponse.json(await createApp(input), { status: 201 }); } catch (error) { console.error('App create error:', error); return NextResponse.json({ error: 'Failed to create app.' }, { status: 500 }); }
}
