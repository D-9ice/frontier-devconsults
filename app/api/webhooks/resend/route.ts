import { forwardIncoming } from '@/lib/mail-forwarding';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  return forwardIncoming(request, {
    secret: process.env.RESEND_WEBHOOK_SECRET,
    apiKey: process.env.RESEND_MAIL_API_KEY,
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
  });
}
