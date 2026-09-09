import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, requireAdminMutation } from '@/lib/admin-auth';
import { allow } from '@/lib/monitoring';
import { belongs, boundedBody, Mail, mailApi, mailId, replyPayload, replyRecipient, replyTicket, safeRawUrl, validReplyTicket } from '@/lib/admin-mail';

export const runtime = 'nodejs';
export const maxDuration = 60;
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const query = request.nextUrl.searchParams;
  const sent = query.get('folder') === 'sent';
  const id = query.get('id');
  const after = query.get('after');
  if ((id && !mailId.test(id)) || (after && !mailId.test(after))) return json({ error: 'Invalid message ID' }, 400);
  try {
    const base = sent ? '/emails' : '/emails/receiving';
    if (!id) {
      const result = await mailApi(`${base}?limit=25${after ? `&after=${after}` : ''}`);
      const rows: Mail[] = result.data;
      return json({ messages: rows.filter(m => belongs(m, sent)).map(m => ({ id: m.id, from: m.from, to: m.to, subject: m.subject, created_at: m.created_at, last_event: m.last_event })),
        next: result.has_more && rows.length ? rows[rows.length - 1].id : null });
    }
    const mail: Mail = await mailApi(`${base}/${id}`);
    if (!belongs(mail, sent)) return json({ error: 'Message not found' }, 404);
    if (query.get('download') === '1' && !sent) {
      const url = safeRawUrl(mail.raw?.download_url || '');
      const response = await fetch(url, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error('Download failed');
      const bytes = await boundedBody(response, 10 * 1024 * 1024);
      return new NextResponse(new Uint8Array(bytes), { headers: { 'Content-Type': 'application/octet-stream', 'Content-Disposition': 'attachment; filename="original.eml"', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' } });
    }
    const secret = process.env.ADMIN_SESSION_SECRET;
    return json({ id: mail.id, from: mail.from, to: mail.to, subject: mail.subject, created_at: mail.created_at,
      text: mail.text || '', htmlOnly: !mail.text && Boolean(mail.html), last_event: mail.last_event,
      attachments: (mail.attachments || []).map(a => ({ filename: a.filename, size: a.size })),
      replyTo: sent ? '' : replyRecipient(mail), ticket: !sent && secret ? replyTicket(id, secret) : null });
  } catch { return json({ error: 'Mail unavailable. Please retry; older messages may have expired at Resend.' }, 503); }
}

export async function POST(request: NextRequest) {
  const denied = requireAdminMutation(request);
  if (denied) return denied;
  let body;
  try { body = JSON.parse((await boundedBody(new Response(request.body), 100000)).toString('utf8')); }
  catch { return json({ error: 'Invalid or oversized reply' }, 400); }
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || typeof body?.id !== 'string' || !mailId.test(body.id) || typeof body.ticket !== 'string' ||
      !validReplyTicket(body.ticket, body.id, secret) || typeof body.text !== 'string' || !body.text.trim() || body.text.length > 20000) {
    return json({ error: 'Invalid or expired reply. Check Sent before opening a new reply.' }, 400);
  }
  if (!await allow('admin-mail-reply', 20, 3600)) return json({ error: 'Reply limit reached or rate limiter unavailable. Try later.' }, 429);
  try {
    const mail: Mail = await mailApi(`/emails/receiving/${body.id}`);
    if (!belongs(mail)) return json({ error: 'Message not found' }, 404);
    if (body.to !== replyRecipient(mail)) return json({ error: 'Reply recipient changed. Reopen the message and review it.' }, 409);
    const payload = replyPayload(mail, body.text);
    const result = await mailApi('/emails', { method: 'POST', headers: { 'Idempotency-Key': `admin-reply/${body.ticket.split('.')[2]}` }, body: JSON.stringify(payload) });
    return json({ id: result.id, status: 'accepted' });
  } catch { return json({ error: 'Sending could not be confirmed. Check Sent. Retry only with the unchanged draft; do not reopen and send it again.' }, 503); }
}
