import 'server-only';

type WhatsAppConfig = {
  accessToken: string;
  apiVersion: string;
  businessAccountId: string;
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
    businessAccountId: clean(process.env.WHATSAPP_BUSINESS_ACCOUNT_ID),
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

type MetaResult = {
  id?: string;
  data?: Array<{ id?: string; name?: string; status?: string; language?: string }>;
  messages?: Array<{ id?: string }>;
  error?: { message?: string; code?: number; error_subcode?: number };
};

function metaError(result:MetaResult|null,status:number) {
  const providerError=result?.error;
  const detail=providerError
    ? ` ${parameter(providerError.message||'Unknown Meta error',300)}${providerError.code?` (code ${providerError.code}${providerError.error_subcode?`/${providerError.error_subcode}`:''})`:''}`
    : '';
  return `Meta WhatsApp API request failed (HTTP ${status}).${detail}`;
}

async function metaRequest(config:WhatsAppConfig,path:string,init:RequestInit={}) {
  const response=await fetch(`https://graph.facebook.com/${config.apiVersion}/${path}`,{
    ...init,
    headers:{Authorization:`Bearer ${config.accessToken}`,'Content-Type':'application/json',...(init.headers||{})},
    cache:'no-store',
    signal:AbortSignal.timeout(8_000),
  });
  const result=await response.json().catch(()=>null) as MetaResult|null;
  if(!response.ok) throw new Error(metaError(result,response.status));
  return result;
}

async function approvedTemplateAndSender(config:WhatsAppConfig) {
  if(!/^\d+$/.test(config.businessAccountId)) return config.phoneNumberId;
  const [templates,phones]=await Promise.all([
    metaRequest(config,`${config.businessAccountId}/message_templates?fields=name,status,language&name=${encodeURIComponent(config.templateName)}`),
    metaRequest(config,`${config.businessAccountId}/phone_numbers?fields=id`),
  ]);
  const template=templates?.data?.find(item=>item.name===config.templateName&&item.language===config.templateLanguage);
  if(!template) {
    await metaRequest(config,`${config.businessAccountId}/message_templates`,{method:'POST',body:JSON.stringify({
      name:config.templateName,
      language:config.templateLanguage,
      category:'UTILITY',
      allow_category_change:true,
      components:[{type:'BODY',text:'{{1}}\n\n{{2}}\n\nTime: {{3}}\nAdmin: {{4}}',example:{body_text:[['Monitoring update','A new owner alert is available.','2026-09-13T12:00:00Z','https://frontier-devconsults.com/admin/dashboard']]}}],
    })});
    throw new Error(`WhatsApp template ${config.templateName} was created and is awaiting Meta approval.`);
  }
  if(template.status?.toUpperCase()!=='APPROVED') throw new Error(`WhatsApp template ${config.templateName} is ${template.status?.toLowerCase()||'not approved'} in Meta.`);
  const phoneIds=(phones?.data||[]).map(item=>item.id).filter((id):id is string=>Boolean(id));
  if(phoneIds.includes(config.phoneNumberId)) return config.phoneNumberId;
  if(phoneIds.length===1) return phoneIds[0];
  throw new Error('The configured WhatsApp phone-number ID does not match an accessible Cloud API sender.');
}

export async function sendWhatsAppOwnerAlert(alert: WhatsAppAlert) {
  const config = getWhatsAppConfig();
  if (!config) throw new Error('WhatsApp owner-alert configuration is incomplete.');
  const phoneNumberId=await approvedTemplateAndSender(config);
  const response = await fetch(`https://graph.facebook.com/${config.apiVersion}/${phoneNumberId}/messages`, {
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
  const result = await response.json().catch(() => null) as MetaResult | null;
  const id = result?.messages?.[0]?.id;
  if (!response.ok || !id) {
    throw new Error(metaError(result,response.status));
  }
  return { id };
}
