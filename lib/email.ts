type EmailMessage = {
  subject: string;
  text: string;
  replyTo: string;
  idempotencyKey?: string;
};

const notificationRecipient = process.env.EMAIL_TO || 'frontierdevconsults@gmail.com';

export async function sendAdminNotification({ subject, text, replyTo, idempotencyKey }: EmailMessage) {
  return sendEmail({ to: notificationRecipient, subject, text, replyTo, idempotencyKey });
}

export async function sendBuyerConfirmation({ to, subject, text }: { to: string; subject: string; text: string }) {
  return sendEmail({ to, subject, text, replyTo: notificationRecipient });
}

async function sendEmail({ to, subject, text, replyTo, idempotencyKey }: EmailMessage & { to: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn('Email notification skipped: RESEND_API_KEY or EMAIL_FROM is not configured.');
    return { delivered: false, skipped: true, id: null };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    signal: AbortSignal.timeout(8000),
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: replyTo,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend request failed (${response.status})`);
  }

  const result = await response.json();
  return { delivered: false, skipped: false, id: result.id as string };
}
