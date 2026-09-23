import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, requireAdminMutation } from '@/lib/admin-auth';
import { isSupabaseServerConfigured, supabaseServer as db } from '@/lib/supabase-server';
import { readBoundedJson } from '@/lib/request-security';
import { sendClientMaintenanceEmail } from '@/lib/email';
import {
  addCalendarMonths,
  maintenanceSyncConfigured,
  sendMaintenanceEventToMacSunny,
} from '@/lib/client-maintenance';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CLIENT_ID = 'macsunny';

function cleanText(value: unknown, max: number) {
  return typeof value === 'string' ? value.replace(/\0/g, '').trim().slice(0, max) : '';
}

function parseDate(value: unknown) {
  if (typeof value !== 'string' || !value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function scheduleStatus(nextServiceAt: string | null) {
  if (!nextServiceAt) return { code: 'setup_required', label: 'Schedule setup required', daysUntil: null };
  const date = new Date(nextServiceAt);
  if (Number.isNaN(date.getTime())) return { code: 'setup_required', label: 'Schedule setup required', daysUntil: null };
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const due = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const days = Math.ceil((due - today) / 86_400_000);
  if (days < 0) return { code: 'overdue', label: `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`, daysUntil: days };
  if (days === 0) return { code: 'due', label: 'Due today', daysUntil: 0 };
  if (days <= 7) return { code: 'urgent', label: `Due in ${days} day${days === 1 ? '' : 's'}`, daysUntil: days };
  if (days <= 30) return { code: 'approaching', label: `Due in ${days} days`, daysUntil: days };
  return { code: 'current', label: `${days} days until next service`, daysUntil: days };
}

async function getClient() {
  const { data, error } = await db!
    .from('client_maintenance_clients')
    .select('*')
    .eq('id', CLIENT_ID)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function readDashboard() {
  const client = await getClient();
  if (!client) throw new Error('Client maintenance database is not initialized.');

  const [{ data: notices, error: noticeError }, { data: records, error: recordError }] = await Promise.all([
    db!.from('client_maintenance_notices').select('*').eq('client_id', CLIENT_ID).order('created_at', { ascending: false }).limit(100),
    db!.from('client_maintenance_records').select('*').eq('client_id', CLIENT_ID).order('completed_at', { ascending: false }).limit(50),
  ]);
  if (noticeError) throw noticeError;
  if (recordError) throw recordError;

  return {
    client,
    schedule: scheduleStatus(client.next_service_at),
    notices: notices || [],
    records: records || [],
    syncConfigured: maintenanceSyncConfigured(),
  };
}

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!isSupabaseServerConfigured() || !db) {
    return NextResponse.json({ error: 'Secure Supabase server access is not configured.' }, { status: 503 });
  }

  try {
    return NextResponse.json(await readDashboard(), { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Client maintenance data is unavailable. Apply the latest database migration first.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const denied = requireAdminMutation(request);
  if (denied) return denied;
  if (!isSupabaseServerConfigured() || !db) {
    return NextResponse.json({ error: 'Secure Supabase server access is not configured.' }, { status: 503 });
  }

  const parsed = await readBoundedJson(request, {
    maxBytes: 24 * 1024,
    allowedKeys: [
      'action',
      'lastServiceAt',
      'nextDueAt',
      'severity',
      'subject',
      'message',
      'sendEmail',
      'completedAt',
      'summary',
      'findings',
      'workPerformed',
      'recommendations',
      'noticeId',
    ],
  });
  if (!parsed.ok) return parsed.response;
  const body = parsed.value;
  const action = cleanText(body.action, 80);
  const client = await getClient();
  if (!client) return NextResponse.json({ error: 'MacSunny maintenance client is not initialized.' }, { status: 503 });

  if (action === 'configure_schedule') {
    const lastServiceAt = parseDate(body.lastServiceAt);
    let nextDueAt = parseDate(body.nextDueAt);
    if (lastServiceAt) nextDueAt = addCalendarMonths(lastServiceAt, 3);
    if (!nextDueAt) {
      return NextResponse.json({ error: 'Enter either the last completed service date or the first next-service date.' }, { status: 400 });
    }

    const { error } = await db
      .from('client_maintenance_clients')
      .update({
        interval_months: 3,
        last_service_at: lastServiceAt ? lastServiceAt.toISOString() : null,
        next_service_at: nextDueAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', CLIENT_ID);
    if (error) return NextResponse.json({ error: 'Unable to save the maintenance schedule.' }, { status: 503 });

    const sync = await sendMaintenanceEventToMacSunny({
      type: 'maintenance_schedule',
      id: randomUUID(),
      lastServiceAt: lastServiceAt?.toISOString() || null,
      nextDueAt: nextDueAt.toISOString(),
      intervalMonths: 3,
    });
    return NextResponse.json({ success: true, sync, dashboard: await readDashboard() });
  }

  if (action === 'send_notice') {
    const subject = cleanText(body.subject, 180);
    const message = cleanText(body.message, 3000);
    const severity = ['info', 'warning', 'critical'].includes(String(body.severity))
      ? String(body.severity)
      : 'warning';
    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required.' }, { status: 400 });
    }

    const { data: notice, error: insertError } = await db
      .from('client_maintenance_notices')
      .insert({
        client_id: CLIENT_ID,
        direction: 'frontier_to_client',
        severity,
        subject,
        message,
        status: 'open',
        email_status: body.sendEmail === false ? 'not_requested' : 'not_requested',
        sync_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (insertError || !notice) {
      return NextResponse.json({ error: 'Unable to create the maintenance notice.' }, { status: 503 });
    }

    const sync = await sendMaintenanceEventToMacSunny({
      type: 'maintenance_notice',
      id: notice.id,
      severity,
      subject,
      message,
      createdAt: notice.created_at,
    });

    let emailStatus = 'not_requested';
    let emailProviderId: string | null = null;
    if (body.sendEmail !== false) {
      try {
        const mail = await sendClientMaintenanceEmail({
          to: process.env.MACSUNNY_MAINTENANCE_EMAIL || client.contact_email,
          subject: `Frontier DevConsults maintenance notice — ${subject}`,
          text: [
            'MacSunny Electronics',
            '',
            'Frontier DevConsults has issued a maintenance notice for your application.',
            '',
            `Priority: ${severity}`,
            `Subject: ${subject}`,
            '',
            message,
            '',
            'This notice is also available in MacSunny Admin → Services & Renewals.',
            'Please review and acknowledge it there.',
          ].join('\n'),
          idempotencyKey: `maintenance-notice/${notice.id}`,
        });
        emailStatus = mail.skipped ? 'skipped' : 'accepted';
        emailProviderId = mail.id;
      } catch {
        emailStatus = 'failed';
      }
    }

    await db
      .from('client_maintenance_notices')
      .update({
        sync_status: sync.ok ? 'synced' : 'failed',
        sync_error: sync.ok ? null : sync.error,
        email_status: emailStatus,
        email_provider_id: emailProviderId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', notice.id);

    return NextResponse.json({ success: true, sync, emailStatus, dashboard: await readDashboard() });
  }

  if (action === 'complete_service') {
    const completedAt = parseDate(body.completedAt);
    if (!completedAt) {
      return NextResponse.json({ error: 'A valid service completion date is required.' }, { status: 400 });
    }

    const nextDueAt = addCalendarMonths(completedAt, 3);
    const datePart = completedAt.toISOString().slice(0, 10).replaceAll('-', '');
    const reference = `MS-${datePart}-${randomUUID().slice(0, 8).toUpperCase()}`;

    const recordPayload = {
      client_id: CLIENT_ID,
      service_reference: reference,
      completed_at: completedAt.toISOString(),
      summary: cleanText(body.summary, 1500),
      findings: cleanText(body.findings, 3000),
      work_performed: cleanText(body.workPerformed, 3000),
      recommendations: cleanText(body.recommendations, 3000),
      next_due_at: nextDueAt.toISOString(),
      sync_status: 'pending',
    };

    const { data: record, error: recordError } = await db
      .from('client_maintenance_records')
      .insert(recordPayload)
      .select('*')
      .single();
    if (recordError || !record) {
      return NextResponse.json({ error: 'Unable to save the completed service record.' }, { status: 503 });
    }

    const { error: clientError } = await db
      .from('client_maintenance_clients')
      .update({
        interval_months: 3,
        last_service_at: completedAt.toISOString(),
        next_service_at: nextDueAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', CLIENT_ID);
    if (clientError) {
      return NextResponse.json({ error: 'Service record saved, but the next-service schedule could not be updated.' }, { status: 503 });
    }

    const sync = await sendMaintenanceEventToMacSunny({
      type: 'service_completed',
      id: record.id,
      reference,
      completedAt: completedAt.toISOString(),
      summary: recordPayload.summary,
      findings: recordPayload.findings,
      workPerformed: recordPayload.work_performed,
      recommendations: recordPayload.recommendations,
      nextDueAt: nextDueAt.toISOString(),
    });

    await db
      .from('client_maintenance_records')
      .update({
        sync_status: sync.ok ? 'synced' : 'failed',
        sync_error: sync.ok ? null : sync.error,
      })
      .eq('id', record.id);

    try {
      await sendClientMaintenanceEmail({
        to: process.env.MACSUNNY_MAINTENANCE_EMAIL || client.contact_email,
        subject: `MacSunny quarterly service completed — ${reference}`,
        text: [
          'MacSunny Electronics',
          '',
          'Frontier DevConsults has recorded completion of the scheduled application service and maintenance.',
          '',
          `Service reference: ${reference}`,
          `Completed: ${completedAt.toISOString().slice(0, 10)}`,
          `Next scheduled service: ${nextDueAt.toISOString().slice(0, 10)}`,
          '',
          recordPayload.summary ? `Summary: ${recordPayload.summary}` : '',
          recordPayload.recommendations ? `Recommendations: ${recordPayload.recommendations}` : '',
          '',
          'The same service record is available in MacSunny Admin → Services & Renewals.',
        ].filter(Boolean).join('\n'),
        idempotencyKey: `maintenance-completed/${reference}`,
      });
    } catch {
      // The authoritative service record remains saved even if email delivery is unavailable.
    }

    return NextResponse.json({ success: true, sync, reference, nextDueAt: nextDueAt.toISOString(), dashboard: await readDashboard() });
  }

  if (action === 'resolve_notice') {
    const noticeId = cleanText(body.noticeId, 120);
    if (!noticeId) return NextResponse.json({ error: 'Notice ID is required.' }, { status: 400 });

    const { data: notice, error } = await db
      .from('client_maintenance_notices')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', noticeId)
      .eq('client_id', CLIENT_ID)
      .select('*')
      .maybeSingle();

    if (error) return NextResponse.json({ error: 'Unable to resolve the maintenance notice.' }, { status: 503 });
    if (!notice) return NextResponse.json({ error: 'Maintenance notice not found.' }, { status: 404 });

    let sync: unknown = null;
    if (notice.direction === 'frontier_to_client') {
      sync = await sendMaintenanceEventToMacSunny({
        type: 'notice_resolved',
        id: notice.id,
      });
    }
    return NextResponse.json({ success: true, sync, dashboard: await readDashboard() });
  }

  return NextResponse.json({ error: 'Unsupported maintenance action.' }, { status: 400 });
}
