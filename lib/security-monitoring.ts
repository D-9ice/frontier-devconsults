import 'server-only';

import { randomUUID } from 'node:crypto';
import { NextRequest } from 'next/server';
import { allow, runMonitoring } from '@/lib/monitoring';
import { sourceHash } from '@/lib/request-security';
import { supabaseServer as db } from '@/lib/supabase-server';

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

type SecurityEvent = {
  category: string;
  severity: SecuritySeverity;
  result: string;
  actor?: string;
  resourceType?: string;
  resourceId?: string;
  correlationId?: string;
  alert?: boolean;
};

function safeToken(value: string | undefined, maximum = 120) {
  return (value || '').replace(/[^a-zA-Z0-9_./:-]/g, '-').slice(0, maximum);
}

export async function recordSecurityEvent(request: NextRequest, event: SecurityEvent) {
  if (!db) return event.correlationId || randomUUID();
  const correlationId = event.correlationId || randomUUID();
  const route = safeToken(request.nextUrl.pathname, 200) || '/';
  const hashedSource = sourceHash(request);
  const bucket = Math.floor(Date.now() / 300_000);
  const category = safeToken(event.category, 80) || 'security-event';
  const shouldAlert = Boolean(event.alert && ['high', 'critical'].includes(event.severity));
  const details = {
    timestamp: new Date().toISOString(),
    category,
    route,
    method: request.method,
    severity: event.severity,
    sourceHash: hashedSource,
    correlationId,
    actor: safeToken(event.actor || 'anonymous', 80),
    result: safeToken(event.result, 100),
    resourceType: safeToken(event.resourceType, 80) || null,
    resourceId: safeToken(event.resourceId, 120) || null,
  };
  const eventKey = `security:${category}:${hashedSource}:${route}:${shouldAlert ? 'alert' : 'log'}:${bucket}`;
  const { data, error } = await db.from('monitoring_events').upsert({
    event_key: eventKey,
    kind: 'security',
    subject: `[${event.severity.toUpperCase()}] ${category}`,
    details,
    record_type: event.resourceType || 'security',
    record_id: event.resourceId || null,
    status: shouldAlert ? 'pending' : 'logged',
  }, { onConflict: 'event_key', ignoreDuplicates: true }).select('id').maybeSingle();
  if (!error && data && shouldAlert) await runMonitoring().catch(() => undefined);
  return correlationId;
}

export async function recordAdminProbe(request: NextRequest, result: string) {
  const hash = sourceHash(request);
  const withinLimit = await allow(`security:admin-probe:${hash}`, 8, 300);
  return recordSecurityEvent(request, {
    category: 'admin-access-denied',
    severity: withinLimit ? 'medium' : 'high',
    result,
    alert: !withinLimit,
  });
}
