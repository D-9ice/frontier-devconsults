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
    const { responded, internalNotes, archived } = await request.json();
    const updates: { responded?: boolean; internal_notes?: string; archived?: boolean; archived_at?: string | null } = {};

    if (responded !== undefined) {
      if (typeof responded !== 'boolean') return NextResponse.json({ error: 'Responded must be true or false.' }, { status: 400 });
      updates.responded = responded;
    }
    if (internalNotes !== undefined) {
      if (typeof internalNotes !== 'string' || internalNotes.length > 5000) return NextResponse.json({ error: 'Internal notes must be text up to 5,000 characters.' }, { status: 400 });
      updates.internal_notes = internalNotes.trim();
    }
    if (archived !== undefined) {
      if (typeof archived !== 'boolean') return NextResponse.json({ error: 'Archived must be true or false.' }, { status: 400 });
      updates.archived = archived;
      updates.archived_at = archived ? new Date().toISOString() : null;
    }
    if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'No changes supplied.' }, { status: 400 });

    const query = type === 'contact'
      ? supabaseServer.from('contact_submissions').update(updates).eq('id', id).select('*').single()
      : supabaseServer.from('build_requests').update(updates).eq('id', id).select('*').single();
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ ...data, type });
  } catch (error) {
    console.error('Submission update error:', error);
    return NextResponse.json({ error: 'Failed to update submission.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  if (!isSupabaseServerConfigured() || !supabaseServer) return NextResponse.json({ error: 'Secure Supabase server access is not configured.' }, { status: 503 });

  const { type, id } = await params;
  if (type !== 'contact' && type !== 'build') return NextResponse.json({ error: 'Invalid submission type.' }, { status: 400 });

  try {
    const query = type === 'contact'
      ? supabaseServer.from('contact_submissions').delete().eq('id', id)
      : supabaseServer.from('build_requests').delete().eq('id', id);
    const { error } = await query;
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Submission delete error:', error);
    return NextResponse.json({ error: 'Failed to delete submission.' }, { status: 500 });
  }
}
