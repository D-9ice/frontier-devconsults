import { NextResponse } from 'next/server';
import { supabaseServer as db, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { sendAdminNotification } from '@/lib/email';
import { claimMaintenanceNonce, verifyMaintenanceSignature } from '@/lib/client-maintenance';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 32 * 1024;

function cleanText(value: unknown, max: number) {
  return typeof value === 'string' ? value.replace(/\0/g, '').trim().slice(0, max) : '';
}

export async function POST(request: Request) {
  if (!isSupabaseServerConfigured() || !db) {
    return NextResponse.json({ error: 'Maintenance database is unavailable.' }, { status: 503 });
  }

  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > MAX_BYTES) {
    return NextResponse.json({ error: 'Payload too large.' }, { status: 413 });
  }

  const raw = await request.text();
  if (Buffer.byteLength(raw, 'utf8') > MAX_BYTES) {
    return NextResponse.json({ error: 'Payload too large.' }, { status: 413 });
  }

  const verified = verifyMaintenanceSignature(request, raw, 'macsunny');
  if (!verified.ok) {
    return NextResponse.json({ error: 'Unauthorized maintenance event.' }, { status: 401 });
  }

  if (!await claimMaintenanceNonce(verified.nonce, 'macsunny')) {
    return NextResponse.json({ error: 'Replay rejected.' }, { status: 409 });
  }

  let body: Record<string, unknown>;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid');
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const type = cleanText(body.type, 80);
  const id = cleanText(body.id, 120);
  if (!type || !id) {
    return NextResponse.json({ error: 'Missing maintenance event identity.' }, { status: 400 });
  }

  if (type === 'notice_acknowledged') {
    const acknowledgedAt = typeof body.acknowledgedAt === 'string' && !Number.isNaN(new Date(body.acknowledgedAt).getTime())
      ? new Date(body.acknowledgedAt).toISOString()
      : new Date().toISOString();

    const { data, error } = await db
      .from('client_maintenance_notices')
      .update({
        status: 'acknowledged',
        acknowledged_at: acknowledgedAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('client_id', 'macsunny')
      .eq('direction', 'frontier_to_client')
      .select('id')
      .maybeSingle();

    if (error) return NextResponse.json({ error: 'Unable to record acknowledgement.' }, { status: 503 });
    if (!data) return NextResponse.json({ error: 'Maintenance notice not found.' }, { status: 404 });
    return NextResponse.json({ success: true });
  }

  if (type === 'client_alert') {
    const subject = cleanText(body.subject, 180);
    const message = cleanText(body.message, 3000);
    const severity = ['info', 'warning', 'critical'].includes(String(body.severity))
      ? String(body.severity)
      : 'warning';
    if (!subject || !message) {
      return NextResponse.json({ error: 'Invalid client maintenance alert.' }, { status: 400 });
    }

    const createdAt = typeof body.createdAt === 'string' && !Number.isNaN(new Date(body.createdAt).getTime())
      ? new Date(body.createdAt).toISOString()
      : new Date().toISOString();

    const { data: existing } = await db
      .from('client_maintenance_notices')
      .select('id')
      .eq('client_id', 'macsunny')
      .eq('external_id', id)
      .maybeSingle();

    if (existing) return NextResponse.json({ success: true, duplicate: true });

    const { data: notice, error: insertError } = await db
      .from('client_maintenance_notices')
      .insert({
        client_id: 'macsunny',
        direction: 'client_to_frontier',
        severity,
        subject,
        message,
        status: 'open',
        external_id: id,
        email_status: 'not_requested',
        sync_status: 'synced',
        created_at: createdAt,
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertError || !notice) {
      return NextResponse.json({ error: 'Unable to store client maintenance alert.' }, { status: 503 });
    }

    let emailStatus = 'accepted';
    let providerId: string | null = null;
    try {
      const mail = await sendAdminNotification({
        subject: `MacSunny maintenance alert — ${subject}`,
        text: [
          'MacSunny Electronics sent a maintenance alert through the signed client channel.',
          '',
          `Severity: ${severity}`,
          `Subject: ${subject}`,
          '',
          message,
          '',
          'Review the Client Maintenance dashboard in Frontier DevConsults.',
        ].join('\n'),
        replyTo: process.env.MACSUNNY_MAINTENANCE_EMAIL || 'Macsunny2025@gmail.com',
        idempotencyKey: `client-maintenance-alert/${id}`,
      });
      emailStatus = mail.skipped ? 'skipped' : 'accepted';
      providerId = mail.id;
    } catch {
      emailStatus = 'failed';
    }

    await db
      .from('client_maintenance_notices')
      .update({
        email_status: emailStatus,
        email_provider_id: providerId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', notice.id);

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Unsupported maintenance event.' }, { status: 400 });
}
