import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';

type RouteContext = { params: Promise<{ type: string; id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  if (!isSupabaseServerConfigured() || !supabaseServer) return NextResponse.json({ error: 'Secure Supabase server access is not configured.' }, { status: 503 });

  const { type, id } = await params;
  if (type !== 'contact' && type !== 'build') return NextResponse.json({ error: 'Invalid submission type.' }, { status: 400 });
  try {
    const { responded } = await request.json();
    if (typeof responded !== 'boolean') return NextResponse.json({ error: 'Responded must be true or false.' }, { status: 400 });
    const query = type === 'contact'
      ? supabaseServer.from('contact_submissions').update({ responded }).eq('id', id).select('*').single()
      : supabaseServer.from('build_requests').update({ responded }).eq('id', id).select('*').single();
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ ...data, type });
  } catch (error) {
    console.error('Submission update error:', error);
    return NextResponse.json({ error: 'Failed to update submission.' }, { status: 500 });
  }
}
