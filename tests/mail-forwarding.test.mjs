import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createHmac } from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';
const module = { exports: {} };
vm.runInNewContext(ts.transpileModule(readFileSync('lib/mail-forwarding.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText,
  { module, exports: module.exports, require: createRequire(import.meta.url), Buffer, Response, URL, AbortSignal, Date, fetch, console: { error() {} } });
const { forwardIncoming, validSignature } = module.exports;
const secret = 'whsec_' + Buffer.from('test-only-secret-32-bytes-long!!!').toString('base64');
const config = { secret, apiKey: 'test', from: 'info@frontier-devconsults.com', to: 'owner@gmail.com' };
function request(type = 'email.received', stamp = Math.floor(Date.now() / 1000)) {
  const body = JSON.stringify({ type, data: { email_id: '12345678-1234-1234-1234-123456789abc' } });
  const signature = createHmac('sha256', Buffer.from(secret.slice(6), 'base64')).update(`test.${stamp}.${body}`).digest('base64');
  return new Request('https://example.com', { method: 'POST', body, headers: { 'svix-id': 'test', 'svix-timestamp': String(stamp), 'svix-signature': `v1,${signature}` } });
}
function mock(overrides = {}, failure = false) {
  const sent = [];
  return { sent, fetch: async (url, options) => {
    if (String(url).includes('/emails/receiving/')) return Response.json({ received_for: ['info@frontier-devconsults.com'], created_at: new Date().toISOString(), from: 'sender@example.com', subject: 'Test', text: 'Hello', raw: { download_url: 'https://storage.resend.com/raw' }, ...overrides });
    if (String(url).includes('storage.resend.com')) return new Response('Subject: Test\r\n\r\nHello');
    sent.push(options); return Response.json({ id: 'accepted' }, { status: failure ? 503 : 200 });
  } };
}
test('signature rejects tampering and expired timestamps', async () => {
  const r = request(); const body = await r.text();
  assert.equal(validSignature(body, r.headers, secret), true);
  assert.equal(validSignature(body + ' ', r.headers, secret), false);
  const old = request('email.received', 100);
  assert.equal(validSignature(await old.text(), old.headers, secret), false);
});
test('forward preserves raw message and uses stable idempotency key', async () => {
  const m = mock();
  assert.equal((await forwardIncoming(request(), config, m.fetch)).status, 200);
  await forwardIncoming(request(), config, m.fetch);
  assert.equal(m.sent[0].headers['Idempotency-Key'], m.sent[1].headers['Idempotency-Key']);
  const body = JSON.parse(m.sent[0].body);
  assert.deepEqual(body.to, ['owner@gmail.com']);
  assert.match(Buffer.from(body.attachments[0].content, 'base64').toString(), /Subject: Test/);
});
test('unrelated recipients, old events, and provider failure are handled safely', async () => {
  const other = mock({ received_for: ['other@frontier-devconsults.com'] });
  assert.equal((await forwardIncoming(request(), config, other.fetch)).status, 200);
  assert.equal(other.sent.length, 0);
  const old = mock({ created_at: '2020-01-01' });
  assert.equal((await forwardIncoming(request(), config, old.fetch)).status, 409);
  assert.equal(old.sent.length, 0);
  assert.equal((await forwardIncoming(request(), config, mock({}, true).fetch)).status, 503);
  assert.equal((await forwardIncoming(request(), { ...config, to: 'info@frontier-devconsults.com' }, other.fetch)).status, 503);
});
