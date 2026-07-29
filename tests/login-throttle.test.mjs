import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getAdminLoginClientIp,
  hashAdminLoginClientIp,
  parseLoginThrottleDecision,
} from '../lib/login-throttle.ts';

test('prefers the Vercel-provided client IP header', () => {
  const headers = new Headers({
    'x-vercel-forwarded-for': '203.0.113.8',
    'x-forwarded-for': '198.51.100.9',
  });

  assert.equal(getAdminLoginClientIp(headers), '203.0.113.8');
});

test('uses the first valid forwarded IP and rejects malformed values', () => {
  assert.equal(
    getAdminLoginClientIp(new Headers({ 'x-forwarded-for': '2001:db8::1, 203.0.113.8' })),
    '2001:db8::1',
  );
  assert.equal(
    getAdminLoginClientIp(new Headers({ 'x-forwarded-for': 'not-an-ip' })),
    'unknown',
  );
});

test('hashes client IPs deterministically without storing the raw address', () => {
  const first = hashAdminLoginClientIp('203.0.113.8', 'test-secret');
  const second = hashAdminLoginClientIp('203.0.113.8', 'test-secret');

  assert.equal(first, second);
  assert.match(first, /^[a-f0-9]{64}$/);
  assert.doesNotMatch(first, /203\\.0\\.113\\.8/);
  assert.notEqual(first, hashAdminLoginClientIp('203.0.113.9', 'test-secret'));
});

test('normalizes a Supabase throttle decision', () => {
  assert.deepEqual(
    parseLoginThrottleDecision([{ allowed: false, retry_after_seconds: 12.1 }]),
    { allowed: false, retryAfterSeconds: 13 },
  );
  assert.throws(() => parseLoginThrottleDecision([]), /no decision/);
});
