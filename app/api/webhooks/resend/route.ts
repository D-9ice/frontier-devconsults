import { forwardIncoming } from '@/lib/mail-forwarding';
import { after, NextRequest } from 'next/server';
import { recordSecurityEvent } from '@/lib/security-monitoring';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const response = await forwardIncoming(request, {
    secret: process.env.RESEND_WEBHOOK_SECRET,
    apiKey: process.env.RESEND_MAIL_API_KEY,
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
  });
  if (response.status === 401) after(() => recordSecurityEvent(request, { category: 'webhook-signature-failed', severity: 'high', result: 'blocked', alert: true }));
  return response;
}
