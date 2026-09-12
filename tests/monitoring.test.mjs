import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import {transition,deliver} from '../scripts/monitor-external.mjs';
const require=createRequire(import.meta.url);
const formatterModule={exports:{}};
vm.runInNewContext(ts.transpileModule(readFileSync('lib/submission-format.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:formatterModule,exports:formatterModule.exports});

function monitoringHarness(){
  const events=[]; const calls=[]; let fail=true;
  const db={
    rpc:async(name)=>{
      if(name==='monitoring_allow')return {data:true};
      if(name==='monitoring_reconcile')return {};
      const event=events.find(e=>['pending','retry'].includes(e.status)&&Date.parse(e.next_attempt_at)<=Date.now());
      if(event){event.status='sending';event.attempts++;event.lease_token='lease';}
      return {data:event?[{...event}]:[]};
    },
    from(table){
      const filters=[];let update,upsert;
      const q={select(){return q;},eq(k,v){filters.push([k,v]);return q;},is(){return q;},not(){return q;},gte(){return q;},lt(){return q;},order(){return q;},limit(){return q;},single(){return q;},delete(){return q;},update(v){update=v;return q;},upsert(v){upsert=v;return q;},then(resolve){
        if(upsert&&!events.some(e=>e.event_key===upsert.event_key))events.push({...upsert,id:'test-event',created_at:new Date().toISOString(),status:'pending',attempts:0,next_attempt_at:new Date().toISOString(),details:{name:'[MONITORING TEST] Owner alert'}});
        const selected=events.filter(e=>filters.every(([k,v])=>e[k]===v));
        if(update)selected.forEach(e=>Object.assign(e,update));
        resolve({data:table==='monitoring_settings'?{summary_enabled:false,summary_hour:8}:table==='monitoring_events'?selected:[],count:0,error:null});
      }};return q;
    },
  };
  const module={exports:{}};
  const code=ts.transpileModule(readFileSync('lib/monitoring.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(code,{module,exports:module.exports,require:n=>n==='server-only'?{}:n==='@/lib/supabase-server'?{supabaseServer:db}:n==='@/lib/email'?{sendAdminNotification:async m=>{calls.push(m);if(fail)throw Error('Labelled simulated provider failure');return {id:'provider-test-id',skipped:false};}}:n==='@/lib/submission-format'?formatterModule.exports:require(n),process:{env:{RESEND_API_KEY:'test-only',EMAIL_FROM:'test@example.com',EMAIL_TO:'owner@example.com'}},console,fetch:async()=>({ok:true,json:async()=>({last_event:'delivered'})}),AbortSignal,Buffer,Date});
  return {api:module.exports,events,calls,recover:()=>{fail=false;}};
}
test('owner event: failure retains queue, retry deduplicates and confirms provider delivery',async()=>{
  const h=monitoringHarness();const event={event_key:'test:saved:1',kind:'enquiry_saved',subject:'[MONITORING TEST]',record_type:'contact',record_id:'1',is_test:true};
  await h.api.enqueue(event);await h.api.enqueue(event);assert.equal(h.events.length,1);
  await h.api.runMonitoring();assert.equal(h.events[0].status,'retry');assert.equal(h.events[0].attempts,1);assert.ok(Date.parse(h.events[0].next_attempt_at)>Date.now());
  h.recover();h.events[0].next_attempt_at=new Date(0).toISOString();await h.api.runMonitoring();
  assert.equal(h.events[0].status,'delivered');assert.equal(h.events[0].attempts,2);
  assert.equal(h.calls[0].idempotencyKey,h.calls[1].idempotencyKey);assert.match(h.calls[1].text,/admin\/monitoring\/records\/contact\/1/);
  await h.api.runMonitoring();assert.equal(h.calls.length,2);
});
test('read-only bearer rejects missing, incorrect and short credentials',()=>{
  const {api}=monitoringHarness();const key='a'.repeat(40);
  assert.equal(api.authorizedBearer(null,key),false);assert.equal(api.authorizedBearer(`Bearer ${key}`,undefined),false);
  assert.equal(api.authorizedBearer('Bearer wrong',key),false);assert.equal(api.authorizedBearer('Bearer short','short'),false);
  assert.equal(api.authorizedBearer(`Bearer ${key}`,key),true);
});
test('external outage debounce, duplicate prevention and recovery preserve failed delivery',()=>{
  let s=transition({},false,'2026-09-08T12:00:00Z');assert.equal(s.pending.length,0);
  s=transition(s,false,'2026-09-08T12:05:00Z');assert.equal(s.pending.length,1);
  s=transition(s,false,'2026-09-08T12:10:00Z');assert.equal(s.pending.length,1);
  s=transition(s,true,'2026-09-08T12:15:00Z');assert.equal(s.pending.length,2);assert.match(s.pending[1].subject,/recovered/);
});
test('independent sender failure is retryable with identical provider key',async()=>{
  const calls=[];const env={RESEND_API_KEY:'test',EMAIL_FROM:'test@example.com',EMAIL_TO:'owner@example.com'};
  const event={key:'test-123',subject:'[MONITORING TEST] outage',time:'2026-09-08'};
  await assert.rejects(deliver(event,env,async(u,o)=>{calls.push(o);return {ok:false,status:503};}));
  assert.equal(await deliver(event,env,async(u,o)=>{calls.push(o);return {ok:true,json:async()=>({id:'test-id'})};}),'test-id');
  assert.equal(calls[0].headers['Idempotency-Key'],calls[1].headers['Idempotency-Key']);assert.equal(calls[0].body,calls[1].body);
});
test('acquisition alerts are readable and include the authenticated record link',()=>{
  const message=formatterModule.exports.formatEnquiryNotification('acquisition',{
    reference_number:'ACQ-TEST',product_name:'Test App',buyer_full_name:'[MONITORING TEST] Buyer',buyer_company:'Test Company',buyer_email:'owner@example.com',buyer_country:'Ghana',acquisition_type:'source-code',acquisition_timeline:'30-days',
  },'2026-09-12T00:00:00Z','https://www.frontier-devconsults.com/admin/monitoring/records/acquisition/00000000-0000-4000-8000-000000000001');
  assert.match(message,/New application acquisition enquiry/);
  assert.match(message,/Reference: ACQ-TEST/);
  assert.match(message,/admin\/monitoring\/records\/acquisition/);
  assert.doesNotMatch(message,/\{\s*"/);
});
test('daily Vercel fallback is authenticated and consent-aware visitor tracking is mounted',()=>{
  const route=readFileSync('app/api/monitoring/run/route.ts','utf8');
  const layout=readFileSync('app/layout.tsx','utf8');
  const vercel=JSON.parse(readFileSync('vercel.json','utf8'));
  assert.match(route,/process\.env\.CRON_SECRET/);
  assert.match(route,/runMonitoring\(\{forceDailySummary:true\}\)/);
  assert.match(layout,/<VisitorTracker \/>/);
  assert.deepEqual(vercel.crons,[{path:'/api/monitoring/run',schedule:'17 23 * * *'}]);
});
