import { createHmac } from 'crypto';
import { isIP } from 'net';

const UNKNOWN_CLIENT_IP = 'unknown';

type HeaderReader = {
  get(name: string): string | null;
};

export type LoginThrottleDecision = {
  allowed: boolean;
  retryAfterSeconds: number;
};

export function getAdminLoginClientIp(headers: HeaderReader) {
  const forwardedFor =
    headers.get('x-vercel-forwarded-for') ||
    headers.get('x-forwarded-for') ||
    headers.get('x-real-ip');
  const candidate = forwardedFor?.split(',')[0]?.trim();

  return candidate && isIP(candidate) ? candidate : UNKNOWN_CLIENT_IP;
}

export function hashAdminLoginClientIp(clientIp: string, secret: string) {
  if (!secret) {
    throw new Error('A server-only secret is required to hash admin login IPs.');
  }

  return createHmac('sha256', secret).update(clientIp).digest('hex');
}

export function parseLoginThrottleDecision(data: unknown): LoginThrottleDecision {
  const row = Array.isArray(data) ? data[0] : data;

  if (!row || typeof row !== 'object') {
    throw new Error('The login throttle returned no decision.');
  }

  const allowed = Reflect.get(row, 'allowed');
  const retryAfterSeconds = Reflect.get(row, 'retry_after_seconds');

  if (typeof allowed !== 'boolean' || typeof retryAfterSeconds !== 'number') {
    throw new Error('The login throttle returned an invalid decision.');
  }

  return {
    allowed,
    retryAfterSeconds: Math.max(0, Math.ceil(retryAfterSeconds)),
  };
}
