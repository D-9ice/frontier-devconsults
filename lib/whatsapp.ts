import 'server-only';

type WhatsAppConfig = {
  accessToken: string;
  apiVersion: string;
  phoneNumberId: string;
  ownerPhone: string;
  templateName: string;
  templateLanguage: string;
};

export type WhatsAppAlert = {
  eventId: string;
  subject: string;
  summary: string;
  createdAt: string;
  adminLink: string;
  isTest: boolean;
};

function clean(value: string | undefined) { return value?.trim() || ''; }

export function getWhatsAppConfig(): WhatsAppConfig | null {
  const config = {
    accessToken: clean(process.env.WHATSAPP_ACCESS_TOKEN),
    apiVersion: clean(process.env.WHATSAPP_GRAPH_API_VERSION),
    phoneNumberId: clean(process.env.WHATSAPP_PHONE_NUMBER_ID),
    ownerPhone: clean(process.env.WHATSAPP_OWNER_PHONE_E164).replace(/^\+/, ''),
    templateName: clean(process.env.WHATSAPP_ALERT_TEMPLATE_NAME),
    templateLanguage: clean(process.env.WHATSAPP_ALERT_TEMPLATE_LANGUAGE),
  };
  if (config.accessToken.length < 20
    || !/^v\d+\.\d+$/.test(config.apiVersion)
    || !/^\d+$/.test(config.phoneNumberId)
    || !/^[1-9]\d{7,14}$/.test(config.ownerPhone)
    || !/^[a-z0-9_]{1,512}$/.test(config.templateName)
    || !/^[a-z]{2,3}(?:_[A-Z]{2})?$/.test(config.templateLanguage)) return null;
  return config;
}

function parameter(value: string, maximum: number) {
  return value.replace(/\s+/g, ' ').trim().slice(0, maximum) || 'Not provided';
}

export async function sendWhatsAppOwnerAlert(alert: WhatsAppAlert) {
  const config = getWhatsAppConfig();
  if (!config) throw new Error('WhatsApp owner-alert configuration is incomplete.');
  const response = await fetch(`https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: config.ownerPhone,
      type: 'template',
      template: {
        name: config.templateName,
        language: { code: config.templateLanguage },
        components: [{
          type: 'body',
          parameters: [
            { type: 'text', text: parameter(`${alert.isTest ? '[MONITORING TEST] ' : ''}${alert.subject}`, 100) },
            { type: 'text', text: parameter(alert.summary, 900) },
            { type: 'text', text: parameter(alert.createdAt, 40) },
            { type: 'text', text: parameter(alert.adminLink, 500) },
          ],
        }],
      },
      biz_opaque_callback_data: `monitoring:${alert.eventId}`,
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(8_000),
  });
  const result = await response.json().catch(() => null) as { messages?: Array<{ id?: string }> } | null;
  const id = result?.messages?.[0]?.id;
  if (!response.ok || !id) throw new Error(`WhatsApp API rejected the alert (HTTP ${response.status}).`);
  return { id };
}
