import 'server-only';

import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import { NextRequest, NextResponse } from 'next/server';

type BoundedJsonOptions = {
  maxBytes: number;
  allowedKeys?: readonly string[];
};

export type BoundedJsonResult =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; response: NextResponse };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function readBoundedJson(request: NextRequest, options: BoundedJsonOptions): Promise<BoundedJsonResult> {
  const contentType = request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase();
  if (contentType !== 'application/json' && !contentType?.endsWith('+json')) {
    return { ok: false, response: NextResponse.json({ error: 'Content-Type must be application/json.' }, { status: 415 }) };
  }

  const declaredLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > options.maxBytes) {
    return { ok: false, response: NextResponse.json({ error: 'Request body is too large.' }, { status: 413 }) };
  }

  let raw = '';
  try {
    raw = await request.text();
  } catch {
    return { ok: false, response: NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }) };
  }
  if (Buffer.byteLength(raw, 'utf8') > options.maxBytes) {
    return { ok: false, response: NextResponse.json({ error: 'Request body is too large.' }, { status: 413 }) };
  }

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { ok: false, response: NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 }) };
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, response: NextResponse.json({ error: 'JSON body must be an object.' }, { status: 400 }) };
  }

  const object = value as Record<string, unknown>;
  if (options.allowedKeys) {
    const allowed = new Set(options.allowedKeys);
    if (Object.keys(object).some((key) => !allowed.has(key))) {
      return { ok: false, response: NextResponse.json({ error: 'Request contains unsupported fields.' }, { status: 400 }) };
    }
  }
  return { ok: true, value: object };
}

export function clientIp(request: NextRequest) {
  const forwarded = request.headers.get('x-vercel-forwarded-for')
    || request.headers.get('x-forwarded-for')
    || request.headers.get('x-real-ip');
  const candidate = forwarded?.split(',')[0]?.trim();
  return candidate && isIP(candidate) ? candidate : 'unknown';
}

export function sourceHash(request: NextRequest) {
  const secret = process.env.ADMIN_SESSION_SECRET
    || process.env.MONITORING_JOB_TOKEN
    || (process.env.NODE_ENV !== 'production' ? 'frontier-development-source-hash' : '');
  if (!secret) throw new Error('A server-only hashing secret is required.');
  return createHmac('sha256', secret).update(clientIp(request)).digest('hex').slice(0, 24);
}

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

export function cleanText(value: unknown, maximum: number) {
  return typeof value === 'string' ? value.replace(/\0/g, '').trim().slice(0, maximum) : '';
}

export function validHttpUrl(value: unknown, options: { allowRelative?: boolean } = {}) {
  if (typeof value !== 'string' || !value.trim()) return false;
  if (options.allowRelative && /^\/(?!\/)/.test(value)) return true;
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
