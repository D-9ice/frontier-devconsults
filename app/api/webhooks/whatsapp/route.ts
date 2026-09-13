import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as db } from '@/lib/supabase-server';

const maximumBytes = 256 * 1024;
const statusRank: Record<string, number> = { accepted: 1, sent: 2, delivered: 3, read: 4, failed: 5 };

function equal(left: string, right: string) {
  const a = Buffer.from(left); const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function GET(request: NextRequest) {
  const token = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN?.trim();
  const supplied = request.nextUrl.searchParams.get('hub.verify_token') || '';
  const challenge = request.nextUrl.searchParams.get('hub.challenge') || '';
  if (request.nextUrl.searchParams.get('hub.mode') !== 'subscribe' || !token || token.length < 32 || !equal(token, supplied)) {
    return NextResponse.json({ error: 'Verification failed.' }, { status: 403 });
  }
  return new NextResponse(challenge, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

export async function POST(request: NextRequest) {
  const secret = process.env.WHATSAPP_APP_SECRET?.trim();
  if (!secret || secret.length < 20 || !db) return NextResponse.json({ error: 'Webhook unavailable.' }, { status: 503 });
  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > maximumBytes) return NextResponse.json({ error: 'Payload too large.' }, { status: 413 });
  const raw = await request.text();
  if (Buffer.byteLength(raw) > maximumBytes) return NextResponse.json({ error: 'Payload too large.' }, { status: 413 });
  const signature = request.headers.get('x-hub-signature-256') || '';
  const expected = `sha256=${createHmac('sha256', secret).update(raw).digest('hex')}`;
  if (!equal(signature, expected)) return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });

  let payload: unknown;
  try { payload = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Malformed payload.' }, { status: 400 }); }
  const entries = payload && typeof payload === 'object' && Array.isArray((payload as { entry?: unknown }).entry) ? (payload as { entry: unknown[] }).entry : [];
  const statuses = entries.flatMap((entry) => entry && typeof entry === 'object' && Array.isArray((entry as { changes?: unknown }).changes)
    ? (entry as { changes: Array<{ value?: { statuses?: unknown } }> }).changes.flatMap((change) => Array.isArray(change.value?.statuses) ? change.value.statuses : []) : []) as Array<{ id?: unknown; status?: unknown; errors?: Array<{ title?: unknown }> }>;

  for (const item of statuses.slice(0, 100)) {
    if (typeof item.id !== 'string' || typeof item.status !== 'string' || !statusRank[item.status]) continue;
    const { data } = await db.from('monitoring_whatsapp_deliveries').select('id,status').eq('provider_id', item.id).maybeSingle();
    if (!data || (statusRank[data.status] || 0) > statusRank[item.status]) continue;
    const now = new Date().toISOString();
    await db.from('monitoring_whatsapp_deliveries').update({
      status: item.status,
      last_error: item.status === 'failed' ? String(item.errors?.[0]?.title || 'WhatsApp reported delivery failure.').slice(0, 500) : null,
      delivered_at: ['delivered', 'read'].includes(item.status) ? now : undefined,
      read_at: item.status === 'read' ? now : undefined,
      lease_until: null,
      updated_at: now,
    }).eq('id', data.id);
  }
  return NextResponse.json({ received: true });
}
