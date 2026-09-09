import 'server-only';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

export const businessMailbox = 'info@frontier-devconsults.com';
export const mailId = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export type MailFolder = 'inbox' | 'sent';
export type MailRemovalState = { clearedBefore: string | null; preserveSubject: string | null; removedIds: Set<string> };
export type Mail = {
  id: string; from: string; to: string[]; subject: string; created_at: string;
  text?: string; html?: string; last_event?: string; reply_to?: string[];
  received_for?: string[]; message_id?: string;
  raw?: { download_url?: string };
  attachments?: { filename: string; size: number }[];
};

export function address(value: string) {
  if (typeof value !== 'string' || /[\r\n]/.test(value)) return '';
  const candidate = (value.match(/^[^<>]*<([^<>]+)>$/)?.[1] || value).trim();
  return /^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(candidate) ? candidate.toLowerCase() : '';
}
export function belongs(mail: Mail, sent = false) {
  return sent ? address(mail.from) === businessMailbox
    : (mail.received_for?.length ? mail.received_for : mail.to || []).some(v => address(v) === businessMailbox);
}
export function visibleMail(mail: Mail, state: MailRemovalState) {
  if (state.removedIds.has(mail.id)) return false;
  const created = Date.parse(mail.created_at);
  const cutoff = state.clearedBefore ? Date.parse(state.clearedBefore) : NaN;
  if (!Number.isNaN(created) && !Number.isNaN(cutoff) && created <= cutoff) {
    return Boolean(state.preserveSubject && mail.subject.toLowerCase().includes(state.preserveSubject.toLowerCase()));
  }
  return true;
}
export function replyRecipient(mail: Mail) {
  // Refuse ambiguous multi-recipient Reply-To rather than silently dropping recipients.
  if (mail.reply_to && mail.reply_to.length > 1) return '';
  const recipient = address(mail.reply_to?.[0] || mail.from);
  return recipient === businessMailbox ? '' : recipient;
}
export async function boundedBody(response: Response, limit: number) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Empty response');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) throw new Error('Message exceeds download limit');
      chunks.push(value);
    }
    return Buffer.concat(chunks);
  } finally { await reader.cancel(); }
}
export async function mailApi(path: string, init: RequestInit = {}) {
  const key = process.env.RESEND_MAIL_API_KEY;
  if (!key) throw new Error('Mail not configured');
  const response = await fetch(`https://api.resend.com${path}`, {
    ...init, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000),
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...init.headers },
  });
  if (!response.ok) throw new Error('Mail provider request failed');
  return JSON.parse((await boundedBody(response, 4 * 1024 * 1024)).toString('utf8'));
}
export function safeRawUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.port ||
      !(url.hostname === 'cdn.resend.app' || url.hostname.endsWith('.resend.com') || url.hostname.endsWith('.amazonaws.com'))) {
    throw new Error('Untrusted download location');
  }
  return url;
}
function signature(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('hex');
}
export function replyTicket(id: string, secret: string, now = Date.now()) {
  const payload = `${id}.${now}.${randomUUID()}`;
  return `${payload}.${signature(payload, secret)}`;
}
export function validReplyTicket(token: string, id: string, secret: string, now = Date.now()) {
  const parts = token.split('.');
  if (parts.length !== 4 || parts[0] !== id || !mailId.test(parts[2]) || !/^\d+$/.test(parts[1]) || !/^[a-f0-9]{64}$/.test(parts[3])) return false;
  const age = now - Number(parts[1]);
  return age >= 0 && age < 23 * 3600000 && timingSafeEqual(Buffer.from(parts[3]), Buffer.from(signature(parts.slice(0, 3).join('.'), secret)));
}
export function replyPayload(mail: Mail, text: string) {
  const to = replyRecipient(mail);
  if (!to || !text.trim() || text.length > 20000) throw new Error('Invalid reply');
  const messageId = mail.message_id;
  if (!messageId || messageId.length > 998 || /[\r\n]/.test(messageId)) throw new Error('Invalid thread');
  return {
    from: `Frontier DevConsults <${businessMailbox}>`, to: [to], reply_to: businessMailbox,
    subject: `Re: ${(mail.subject || '').replace(/^Re:\s*/i, '').replace(/[\r\n]/g, ' ').slice(0, 200)}`,
    text, headers: { 'In-Reply-To': messageId, References: messageId },
  };
}
