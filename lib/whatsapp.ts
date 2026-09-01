import 'server-only';

type ContactAlert = {
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
};

const requiredConfiguration = [
  'WHATSAPP_ACCESS_TOKEN',
  'WHATSAPP_PHONE_NUMBER_ID',
  'WHATSAPP_ALERT_TO',
  'WHATSAPP_CONTACT_TEMPLATE_NAME',
] as const;

function cleanTemplateValue(value: string, maxLength: number) {
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength) || 'Not provided';
}

export function whatsAppAlertConfigured() {
  return requiredConfiguration.every((name) => Boolean(process.env[name]?.trim()));
}

export async function sendWhatsAppContactAlert(alert: ContactAlert) {
  if (!whatsAppAlertConfigured()) {
    console.warn(`WhatsApp contact alert skipped: configure ${requiredConfiguration.join(', ')}.`);
    return { delivered: false, skipped: true, messageId: null };
  }

  const version = process.env.WHATSAPP_GRAPH_API_VERSION?.trim() || 'v25.0';
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!.trim();
  const recipient = process.env.WHATSAPP_ALERT_TO!.replace(/\D/g, '');
  const templateName = process.env.WHATSAPP_CONTACT_TEMPLATE_NAME!.trim();
  const languageCode = process.env.WHATSAPP_CONTACT_TEMPLATE_LANGUAGE?.trim() || 'en_US';
  const response = await fetch(`https://graph.facebook.com/${version}/${encodeURIComponent(phoneNumberId)}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN!.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components: [{
          type: 'body',
          parameters: [
            { type: 'text', text: cleanTemplateValue(alert.name, 100) },
            { type: 'text', text: cleanTemplateValue(alert.email, 160) },
            { type: 'text', text: cleanTemplateValue(alert.subject, 200) },
            { type: 'text', text: cleanTemplateValue(alert.message, 900) },
            { type: 'text', text: cleanTemplateValue(alert.submittedAt, 100) },
          ],
        }],
      },
    }),
    signal: AbortSignal.timeout(10_000),
  });

  const result = await response.json().catch(() => null) as { messages?: Array<{ id?: string }>; error?: { message?: string } } | null;
  const messageId = result?.messages?.[0]?.id;
  if (!response.ok || !messageId) {
    const detail = result?.error?.message || `HTTP ${response.status}`;
    throw new Error(`WhatsApp contact alert failed: ${detail}`);
  }

  return { delivered: true, skipped: false, messageId };
}
