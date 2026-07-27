import 'server-only';

import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const ADMIN_SESSION_COOKIE = 'frontier_admin_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

type AdminSession = {
  username: 'admin';
  expiresAt: number;
};

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || (process.env.NODE_ENV !== 'production' ? process.env.ADMIN_PASSWORD : '');

  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET must be configured in production.');
  }

  return secret;
}

function sign(value: string) {
  return crypto.createHmac('sha256', getSessionSecret()).update(value).digest('base64url');
}

export function createAdminSession() {
  const session: AdminSession = {
    username: 'admin',
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function setAdminSession(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: createAdminSession(),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearAdminSession(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export function isAdminSessionToken(cookie?: string) {
  try {
    if (!cookie) return false;

    const [payload, signature] = cookie.split('.');
    if (!payload || !signature) return false;

    const expectedSignature = sign(payload);
    if (signature.length !== expectedSignature.length) return false;
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return false;

    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AdminSession;
    return session.username === 'admin' && Number.isFinite(session.expiresAt) && session.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export function isAdminRequest(request: NextRequest) {
  return isAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

export function requireAdmin(request: NextRequest) {
  if (isAdminRequest(request)) return null;
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function requireSameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  try {
    if (new URL(origin).origin !== request.nextUrl.origin) {
      return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  return null;
}

export function requireAdminMutation(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  return requireSameOrigin(request);
}
