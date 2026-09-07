import { NextRequest, NextResponse } from 'next/server';
import { requireAdminMutation } from '@/lib/admin-auth';
import { consultationStatuses, feasibilityStatuses, specializedStatuses } from '@/lib/specialized-options';
import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';

const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdminMutation(request);
  if (unauthorized) return unauthorized;
  if (!isSupabaseServerConfigured() || !supabaseServer) return NextResponse.json({ error: 'Secure Supabase server access is not configured.' }, { status: 503 });
  const id = (await params).id;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Invalid request ID.' }, { status: 400 });
  try {
    const body = await request.json();
    const updates: Record<string, string> = {};
    if (body.status !== undefined) { const value = clean(body.status, 48); if (!specializedStatuses.includes(value as (typeof specializedStatuses)[number])) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 }); updates.status = value; }
    if (body.feasibilityStatus !== undefined) { const value = clean(body.feasibilityStatus, 40); if (!feasibilityStatuses.includes(value as (typeof feasibilityStatuses)[number])) return NextResponse.json({ error: 'Invalid feasibility status.' }, { status: 400 }); updates.feasibility_status = value; }
    if (body.consultationStatus !== undefined) { const value = clean(body.consultationStatus, 40); if (!consultationStatuses.includes(value as (typeof consultationStatuses)[number])) return NextResponse.json({ error: 'Invalid consultation status.' }, { status: 400 }); updates.consultation_status = value; }
    if (body.internalNotes !== undefined) updates.internal_notes = clean(body.internalNotes, 12000);
    if (body.assignedFollowUp !== undefined) updates.assigned_follow_up = clean(body.assignedFollowUp, 200);
    if (!Object.keys(updates).length) return NextResponse.json({ error: 'No supported changes supplied.' }, { status: 400 });
    const { data, error } = await supabaseServer.from('specialized_engineering_requests').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select('*').single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Specialized engineering update error:', error);
    return NextResponse.json({ error: 'Failed to update the specialized engineering request.' }, { status: 500 });
  }
}
