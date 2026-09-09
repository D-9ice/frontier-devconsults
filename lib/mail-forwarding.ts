import { createHmac, timingSafeEqual } from 'node:crypto';

const mailbox = 'info@frontier-devconsults.com';
const maxRawBytes = 10 * 1024 * 1024;
type Config = { secret?: string; apiKey?: string; from?: string; to?: string };

export function validSignature(body: string, headers: Headers, secret: string, now = Date.now()) {
  const id = headers.get('svix-id');
  const stamp = headers.get('svix-timestamp') || '';
  if (!id || !/^\d+$/.test(stamp) || Math.abs(now / 1000 - Number(stamp)) > 300 || !secret.startsWith('whsec_')) return false;
  const key = Buffer.from(secret.slice(6), 'base64');
  if (!key.length) return false;
  const expected = createHmac('sha256', key).update(`${id}.${stamp}.${body}`).digest();
  return (headers.get('svix-signature') || '').split(' ').some(item => {
    if (!item.startsWith('v1,')) return false;
    const actual = Buffer.from(item.slice(3), 'base64');
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  });
}

async function limitedBody(response: Response, limit: number) {
  if (!response.body) throw Error('Missing body');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) throw Error('Body exceeds limit');
      chunks.push(value);
    }
    return Buffer.concat(chunks);
  } finally { await reader.cancel(); }
}

export async function forwardIncoming(request: Request, config: Config, send = fetch) {
  const reply = (status: number, state: string) => Response.json({ state }, { status });
  if (!config.secret || !config.apiKey || !config.from || !config.to) return reply(503, 'Configuration required');
  // A fixed external destination prevents forwarding back into this receiving domain.
  if (!/^[^\s<>@]+@[^\s<>@]+$/.test(config.to) || config.to.toLowerCase().endsWith('@frontier-devconsults.com')) return reply(503, 'Invalid destination');
  let body: string;
  try { body = (await limitedBody(new Response(request.body), 256 * 1024)).toString('utf8'); }
  catch { return reply(413, 'Payload too large'); }
  if (!validSignature(body, request.headers, config.secret)) return reply(401, 'Invalid signature');
  let event;
  try { event = JSON.parse(body); } catch { return reply(400, 'Invalid JSON'); }
  if (event?.type !== 'email.received') return reply(200, 'Ignored');
  const id = event.data?.email_id;
  if (typeof id !== 'string' || !/^[0-9a-f-]{36}$/i.test(id)) return reply(400, 'Invalid email ID');
  try {
    const received = await send(`https://api.resend.com/emails/receiving/${id}`, {
      headers: { Authorization: `Bearer ${config.apiKey}` }, signal: AbortSignal.timeout(10000),
    });
    if (!received.ok) throw Error('Retrieval failed');
    const email = JSON.parse((await limitedBody(received, 4 * 1024 * 1024)).toString('utf8'));
    const recipients = email.received_for?.length ? email.received_for : email.to;
    if (!Array.isArray(recipients) || !recipients.some((address: unknown) => typeof address === 'string' && address.toLowerCase() === mailbox)) return reply(200, 'Ignored recipient');
    // Resend retains idempotency keys for 24 hours. Never automatically resend
    // old mail after that protection expires, including manual webhook replays.
    const age = Date.now() - Date.parse(email.created_at);
    if (!Number.isFinite(age) || age < -300000 || age > 23 * 3600000) return reply(409, 'Manual review required: old email');
    const rawUrl = new URL(email.raw?.download_url);
    if (rawUrl.protocol !== 'https:' || rawUrl.username || rawUrl.password || rawUrl.port ||
        !(rawUrl.hostname === 'cdn.resend.app' || rawUrl.hostname.endsWith('.resend.com') || rawUrl.hostname.endsWith('.amazonaws.com'))) throw Error('Invalid raw URL');
    const raw = await send(rawUrl, { redirect: 'error', signal: AbortSignal.timeout(15000) });
    if (!raw.ok) throw Error('Raw retrieval failed');
    const original = await limitedBody(raw, maxRawBytes);
    const result = await send('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `inbound-forward/${id}` },
      body: JSON.stringify({
        from: config.from, to: [config.to],
        subject: `Fwd: ${String(email.subject || '(no subject)').replace(/[\r\n]/g, ' ').slice(0, 200)}`,
        text: `Incoming mail to ${mailbox}\nFrom: ${String(email.from || '')}\n\n${typeof email.text === 'string' ? email.text.slice(0, 100000) : 'Open the attached original email to read this message.'}\n\nThe original message and its attachments are preserved in original.eml. Replying from Gmail uses your Gmail identity; business-address replies are not configured yet.`,
        attachments: [{ filename: 'original.eml', content: original.toString('base64'), content_type: 'message/rfc822' }],
      }),
    });
    if (!result.ok) throw Error('Forward failed');
    return reply(200, 'Forward accepted');
  } catch {
    // No message content, addresses, credentials or signed URLs in logs.
    console.error('Inbound forwarding failed; inspect Resend webhook attempts.');
    return reply(503, 'Forwarding unavailable; retry');
  }
}
