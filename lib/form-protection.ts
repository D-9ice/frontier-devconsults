import { NextRequest } from 'next/server';

const WINDOW_MS = 10 * 60 * 1000;
const MAX_SUBMISSIONS_PER_WINDOW = 5;
const attempts = new Map<string, number[]>();

function clientAddress(request: NextRequest) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

export function validatePublicSubmission(request: NextRequest, honeypot?: unknown) {
  if (typeof honeypot === 'string' && honeypot.trim()) {
    return 'Unable to process this submission.';
  }

  const address = clientAddress(request);
  const now = Date.now();
  const recentAttempts = (attempts.get(address) || []).filter((timestamp) => now - timestamp < WINDOW_MS);

  if (recentAttempts.length >= MAX_SUBMISSIONS_PER_WINDOW) {
    attempts.set(address, recentAttempts);
    return 'Too many submissions. Please wait a few minutes and try again.';
  }

  recentAttempts.push(now);
  attempts.set(address, recentAttempts);
  return null;
}
