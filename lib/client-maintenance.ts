import 'server-only';

import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { supabaseServer as db } from '@/lib/supabase-server';

const MAX_SKEW_SECONDS = 300;

function syncSecret() {
  return process.env.CLIENT_MAINTENANCE_SYNC_SECRET?.trim() || '';
}

function canonicalSignature(source: string, timestamp: string, nonce: string, body: string) {
  return createHmac('sha256', syncSecret())
    .update(`${source}.${timestamp}.${nonce}.${body}`)
    .digest('hex');
}

export function maintenanceSyncConfigured() {
  return Boolean(syncSecret());
}

export function signedMaintenanceHeaders(source: 'frontier' | 'macsunny', body: string) {
  if (!maintenanceSyncConfigured()) throw new Error('CLIENT_MAINTENANCE_SYNC_SECRET is not configured.');
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = randomUUID();
  return {
    'Content-Type': 'application/json',
    'x-maintenance-source': source,
    'x-maintenance-timestamp': timestamp,
    'x-maintenance-nonce': nonce,
    'x-maintenance-signature': canonicalSignature(source, timestamp, nonce, body),
  };
}

export function verifyMaintenanceSignature(request: Request, body: string, expectedSource: 'frontier' | 'macsunny') {
  if (!maintenanceSyncConfigured()) return { ok: false as const, reason: 'not-configured' };
  const source = request.headers.get('x-maintenance-source') || '';
  const timestamp = request.headers.get('x-maintenance-timestamp') || '';
  const nonce = request.headers.get('x-maintenance-nonce') || '';
  const supplied = request.headers.get('x-maintenance-signature') || '';

  if (source !== expectedSource || !/^\d{10}$/.test(timestamp) || !/^[0-9a-f-]{36}$/i.test(nonce) || !/^[0-9a-f]{64}$/i.test(supplied)) {
    return { ok: false as const, reason: 'invalid-headers' };
  }

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > MAX_SKEW_SECONDS) return { ok: false as const, reason: 'expired' };

  const expected = canonicalSignature(source, timestamp, nonce, body);
  const left = Buffer.from(supplied, 'hex');
  const right = Buffer.from(expected, 'hex');
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return { ok: false as const, reason: 'invalid-signature' };
  }

  return { ok: true as const, nonce };
}

export async function claimMaintenanceNonce(nonce: string, source: 'frontier' | 'macsunny') {
  if (!db) return false;
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const { error } = await db.from('client_maintenance_sync_nonces').insert({
    nonce,
    source,
    expires_at: expiry,
  });
  if (error) return false;
  void db.from('client_maintenance_sync_nonces').delete().lt('expires_at', new Date().toISOString());
  return true;
}

export function addCalendarMonths(date: Date, months: number) {
  const result = new Date(date);
  const originalDay = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(originalDay, lastDay));
  return result;
}

export async function sendMaintenanceEventToMacSunny(payload: Record<string, unknown>) {
  const base = (process.env.MACSUNNY_MAINTENANCE_BASE_URL || 'https://www.macsunny.com').replace(/\/$/, '');
  if (!maintenanceSyncConfigured()) {
    return { ok: false, configured: false, error: 'Maintenance sync secret is not configured.' };
  }

  const body = JSON.stringify(payload);
  try {
    const response = await fetch(`${base}/api/maintenance-sync`, {
      method: 'POST',
      headers: signedMaintenanceHeaders('frontier', body),
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
    const data = await response.json().catch(() => ({}));
    return {
      ok: response.ok,
      configured: true,
      status: response.status,
      error: response.ok ? '' : String(data?.error || 'MacSunny maintenance sync rejected the event.'),
    };
  } catch {
    return { ok: false, configured: true, error: 'MacSunny maintenance sync is temporarily unavailable.' };
  }
}
