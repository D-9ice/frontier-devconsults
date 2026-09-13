import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';

const require=createRequire(import.meta.url);

function loadWhatsApp(env,fetchImpl){
  const module={exports:{}};
  const code=ts.transpileModule(readFileSync('lib/whatsapp.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  vm.runInNewContext(code,{module,exports:module.exports,require:n=>n==='server-only'?{}:require(n),process:{env},fetch:fetchImpl,AbortSignal});
  return module.exports;
}

test('WhatsApp stays disabled until every genuine server credential is present',()=>{
  const api=loadWhatsApp({},async()=>{throw Error('not called');});
  assert.equal(api.getWhatsAppConfig(),null);
});

test('WhatsApp sends the approved four-variable template to the owner',async()=>{
  const calls=[];
  const env={WHATSAPP_GRAPH_API_VERSION:'v23.0',WHATSAPP_PHONE_NUMBER_ID:'123456789',WHATSAPP_ACCESS_TOKEN:'token-that-is-long-enough-for-validation',WHATSAPP_OWNER_PHONE_E164:'233249078976',WHATSAPP_ALERT_TEMPLATE_NAME:'frontier_owner_alert',WHATSAPP_ALERT_TEMPLATE_LANGUAGE:'en_US'};
  const api=loadWhatsApp(env,async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({messages:[{id:'wamid.test'}]})};});
  const result=await api.sendWhatsAppOwnerAlert({eventId:'event-1',subject:'New contact enquiry',summary:'A customer submitted a request.',createdAt:'2026-09-12T12:00:00Z',adminLink:'https://frontier-devconsults.com/admin/dashboard',isTest:true});
  assert.equal(result.id,'wamid.test');
  assert.equal(calls[0].url,'https://graph.facebook.com/v23.0/123456789/messages');
  assert.equal(calls[0].options.headers.Authorization,`Bearer ${env.WHATSAPP_ACCESS_TOKEN}`);
  const body=JSON.parse(calls[0].options.body);
  assert.equal(body.to,env.WHATSAPP_OWNER_PHONE_E164);
  assert.equal(body.type,'template');
  assert.equal(body.template.name,env.WHATSAPP_ALERT_TEMPLATE_NAME);
  assert.equal(body.template.components[0].parameters.length,4);
  assert.equal(JSON.stringify(body).includes(env.WHATSAPP_ACCESS_TOKEN),false);
});

test('WhatsApp queue is channel-separated, deduplicated, retryable, and private',()=>{
  const sql=readFileSync('supabase/migrations/202609120021_whatsapp_owner_alerts.sql','utf8');
  assert.match(sql,/unique\s*\(event_id\)/i);
  assert.match(sql,/for update skip locked/i);
  assert.match(sql,/attempts\s*<\s*6/i);
  assert.match(sql,/enable row level security/i);
  assert.match(sql,/revoke all on .*monitoring_whatsapp_deliveries.*anon.*authenticated/is);
  assert.match(sql,/monitoring_whatsapp_reconcile/i);
});

test('webhook verifies Meta signatures and updates delivery states',()=>{
  const route=readFileSync('app/api/webhooks/whatsapp/route.ts','utf8');
  assert.match(route,/x-hub-signature-256/i);
  assert.match(route,/createHmac\('sha256'/);
  assert.match(route,/WHATSAPP_WEBHOOK_VERIFY_TOKEN/);
  assert.match(route,/WHATSAPP_APP_SECRET/);
  assert.match(route,/delivered_at/);
  assert.match(route,/read_at/);
});

test('admin exposes separate email and WhatsApp status without client secrets',()=>{
  const panel=readFileSync('components/admin/MonitoringPanel.tsx','utf8');
  const env=readFileSync('.env.example','utf8');
  assert.match(panel,/WhatsApp:/);
  assert.match(panel,/configured channels/);
  assert.doesNotMatch(env,/NEXT_PUBLIC_WHATSAPP/);
  assert.match(env,/WHATSAPP_ACCESS_TOKEN=/);
  assert.match(env,/WHATSAPP_APP_SECRET=/);
});
