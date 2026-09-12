import { NextRequest, NextResponse } from 'next/server';
import { acquisitionStatuses } from '@/lib/acquisition-options';
import { requireAdminMutation } from '@/lib/admin-auth';
import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';
import { isUuid, readBoundedJson } from '@/lib/request-security';

const qualificationValues = ['not_reviewed', 'qualified', 'needs_information', 'not_qualified'];
const ndaValues = ['not_required', 'required', 'sent', 'signed'];
const demoValues = ['not_scheduled', 'requested', 'scheduled', 'completed'];
const negotiationValues = ['not_started', 'preliminary', 'active', 'paused', 'agreed', 'unsuccessful'];
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdminMutation(request);
  if (unauthorized) return unauthorized;
  if (!isSupabaseServerConfigured() || !supabaseServer) return NextResponse.json({ error: 'Secure Supabase server access is not configured.' }, { status: 503 });
  const id = (await params).id;
  if (!isUuid(id)) return NextResponse.json({ error: 'Invalid request ID.' }, { status: 400 });
  try {
    const parsed = await readBoundedJson(request, { maxBytes: 16 * 1024, allowedKeys: ['status', 'internalNotes', 'assignedFollowUp', 'buyerQualification', 'ndaStatus', 'demoStatus', 'negotiationStatus'] }); if (!parsed.ok) return parsed.response;
    const body = parsed.value;
    const updates: Record<string, string> = {};
    if (body.status !== undefined) { const value = clean(body.status, 48); if (!acquisitionStatuses.includes(value as (typeof acquisitionStatuses)[number])) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 }); updates.status = value; }
    if (body.internalNotes !== undefined) updates.internal_notes = clean(body.internalNotes, 12000);
    if (body.assignedFollowUp !== undefined) updates.assigned_follow_up = clean(body.assignedFollowUp, 200);
    for (const [incoming, column, allowed] of [['buyerQualification', 'buyer_qualification', qualificationValues], ['ndaStatus', 'nda_status', ndaValues], ['demoStatus', 'demo_status', demoValues], ['negotiationStatus', 'negotiation_status', negotiationValues]] as const) {
      if (body[incoming] !== undefined) { const value = clean(body[incoming], 40); if (!allowed.includes(value)) return NextResponse.json({ error: `Invalid ${incoming}.` }, { status: 400 }); updates[column] = value; }
    }
    if (!Object.keys(updates).length) return NextResponse.json({ error: 'No supported changes supplied.' }, { status: 400 });
    const { data, error } = await supabaseServer.from('application_acquisition_requests').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select('*').single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Acquisition update error:', error);
    return NextResponse.json({ error: 'Failed to update the acquisition request.' }, { status: 500 });
  }
}
