import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';

const nodeRequire = createRequire(import.meta.url);
function load(path, imports = {}, globals = {}) {
  const module = { exports: {} };
  vm.runInNewContext(ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText,
    { module, exports: module.exports, require: name => name === 'server-only' ? {} : imports[name] || nodeRequire(name), Buffer, Response, URL, AbortSignal, Date, fetch, process: { env: {} }, ...globals });
  return module.exports;
}
const lib = load('lib/admin-mail.ts');
const id = '12345678-1234-1234-1234-123456789abc';
const mail = { id, from: 'Buyer <buyer@example.com>', to: [lib.businessMailbox], subject: 'Hello', text: 'Hello', message_id: '<original@example.com>' };
const secret = 'test-secret-not-a-production-credential';

test('mail scope and reply recipient are constrained', () => {
  assert.equal(lib.belongs(mail), true);
  assert.equal(lib.belongs({ ...mail, to: ['other@example.com'] }), false);
  assert.equal(lib.replyRecipient(mail), 'buyer@example.com');
  assert.equal(lib.replyRecipient({ ...mail, reply_to: ['reply@example.com'] }), 'reply@example.com');
  assert.equal(lib.replyRecipient({ ...mail, reply_to: ['a@example.com', 'b@example.com'] }), '');
  assert.equal(lib.address('buyer@example.com\r\nBcc: bad@example.com'), '');
  assert.equal(lib.replyRecipient({ ...mail, from: lib.businessMailbox }), '');
  const reply = lib.replyPayload(mail, 'Thanks');
  assert.equal(reply.from, `Frontier DevConsults <${lib.businessMailbox}>`);
  assert.equal(reply.headers['In-Reply-To'], mail.message_id);
  assert.equal(reply.subject, 'Re: Hello');
  assert.throws(() => lib.replyPayload({ ...mail, message_id: 'bad\r\nheader' }, 'Hi'));
  assert.throws(() => lib.replyPayload(mail, ' '));
});
test('reply tickets cannot be changed, reused for another message, or renewed past the retry window', () => {
  const ticket = lib.replyTicket(id, secret, 1000);
  assert.equal(lib.validReplyTicket(ticket, id, secret, 2000), true);
  assert.equal(lib.validReplyTicket(ticket, id, 'wrong', 2000), false);
  assert.equal(lib.validReplyTicket(ticket, 'other', secret, 2000), false);
  assert.equal(lib.validReplyTicket(ticket.replace('.1000.', '.2000.'), id, secret, 2000), false);
  assert.equal(lib.validReplyTicket(ticket, id, secret, 1000 + 23 * 3600000), false);
});
test('downloads reject unexpected origins and enforce size limits', async () => {
  assert.equal(lib.safeRawUrl('https://cdn.resend.app/receiving/raw/test').hostname, 'cdn.resend.app');
  for (const url of ['http://cdn.resend.app/raw', 'https://cdn.resend.app.evil.com/raw', 'https://user@cdn.resend.app/raw', 'https://cdn.resend.app:8080/raw', 'https://127.0.0.1/raw']) assert.throws(() => lib.safeRawUrl(url));
  await assert.rejects(lib.boundedBody(new Response('oversized'), 3));
  assert.equal((await lib.boundedBody(new Response('ok'), 3)).toString(), 'ok');
});
function routes(authorized = true, permitted = true) {
  const sends = [];
  const route = load('app/api/admin/mail/route.ts', {
    'next/server': { NextResponse: Response },
    '@/lib/admin-auth': {
      requireAdmin: () => authorized ? null : new Response(null, { status: 401 }),
      requireAdminMutation: r => !authorized ? new Response(null, { status: 401 }) : r.headers.get('origin') !== 'https://example.com' ? new Response(null, { status: 403 }) : null,
    },
    '@/lib/monitoring': { allow: async () => permitted },
    '@/lib/admin-mail': { ...lib, mailApi: async (path, options) => {
      if (options?.method === 'POST') { sends.push(options); return { id: 'sent-id' }; }
      return mail;
    } },
  }, { process: { env: { ADMIN_SESSION_SECRET: secret } } });
  return { ...route, sends };
}
function request(ticket, origin = 'https://example.com') {
  return new Request('https://example.com/api/admin/mail', { method: 'POST', headers: { origin }, body: JSON.stringify({ id, ticket, to: 'buyer@example.com', text: 'Thanks' }) });
}
test('route blocks unauthorized and cross-origin replies and fails closed on limiter', async () => {
  const ticket = lib.replyTicket(id, secret);
  assert.equal((await routes(false).POST(request(ticket))).status, 401);
  assert.equal((await routes().POST(request(ticket, 'https://evil.example'))).status, 403);
  assert.equal((await routes(true, false).POST(request(ticket))).status, 429);
  assert.equal((await routes().POST(request('invalid'))).status, 400);
});
test('reply retries preserve idempotency and return accepted, not delivered', async () => {
  const route = routes();
  const ticket = lib.replyTicket(id, secret);
  const result = await route.POST(request(ticket));
  assert.equal(result.status, 200);
  assert.equal((await result.json()).status, 'accepted');
  await route.POST(request(ticket));
  assert.equal(route.sends.length, 2);
  assert.equal(route.sends[0].headers['Idempotency-Key'], route.sends[1].headers['Idempotency-Key']);
});
