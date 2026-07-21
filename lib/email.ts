type EmailMessage = {
  subject: string;
  text: string;
  replyTo: string;
};

const notificationRecipient = process.env.EMAIL_TO || 'frontierdevconsults@gmail.com';

export async function sendAdminNotification({ subject, text, replyTo }: EmailMessage) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn('Email notification skipped: RESEND_API_KEY or EMAIL_FROM is not configured.');
    return { delivered: false, skipped: true };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [notificationRecipient],
      reply_to: replyTo,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend request failed (${response.status}): ${detail}`);
  }

  return { delivered: true, skipped: false };
}
