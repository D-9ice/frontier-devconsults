import 'server-only';
import { createHash, timingSafeEqual } from 'node:crypto';
import { supabaseServer as db } from '@/lib/supabase-server';
import { sendAdminNotification } from '@/lib/email';
import { formatEnquiryNotification } from '@/lib/submission-format';

export const site = 'https://www.frontier-devconsults.com';
export const recordTables = { contact: 'contact_submissions', build: 'build_requests', acquisition: 'application_acquisition_requests', specialized: 'specialized_engineering_requests' } as const;
export function authorizedBearer(header: string | null, secret: string | undefined) {
  if (!secret || secret.length < 32 || !header?.startsWith('Bearer ')) return false;
  return timingSafeEqual(createHash('sha256').update(header.slice(7)).digest(),createHash('sha256').update(secret).digest());
}
export async function allow(key: string, max: number, seconds: number) {
  if (!db) return false;
  const { data, error } = await db.rpc('monitoring_allow',{p_key:key,p_max:max,p_seconds:seconds});
  return !error && data === true;
}
export async function enqueue(event: {event_key:string;kind:string;subject:string;details?:unknown;is_test?:boolean;record_type?:string;record_id?:string}) {
  if (!db) throw new Error('Monitoring database not configured');
  const {error}=await db.from('monitoring_events').upsert(event,{onConflict:'event_key',ignoreDuplicates:true});
  if(error) throw new Error('Monitoring queue unavailable');
}
export async function incident(component:string, recovered:boolean, isTest=false) {
  try {
    if (!db) return;
    const {data:open,error}=await db.from('monitoring_events').select('id,event_key').eq('kind','incident').eq('record_type',component).is('resolved_at',null).eq('is_test',isTest).limit(1).maybeSingle();
    if(error) return;
    if(recovered && open) {
      await enqueue({event_key:`recovery:${open.id}`,kind:'recovery',subject:`Recovered: ${component}`,record_type:component,is_test:isTest});
      await db.from('monitoring_events').update({resolved_at:new Date().toISOString()}).eq('id',open.id);
    } else if(!recovered && !open) {
      await enqueue({event_key:`incident:${component}:${isTest}:${Math.floor(Date.now()/300000)}`,kind:'incident',subject:`Action needed: ${component}`,record_type:component,is_test:isTest,details:{message:'A server operation failed. Review hosting logs; enquiry text and credentials are intentionally excluded.'}});
    }
  } catch { console.error('Monitoring incident recording unavailable'); }
}
export async function monitoringSummary() {
  if(!db) throw new Error('Database unavailable');
  const since=new Date(Date.now()-86400000).toISOString();
  const results=await Promise.all([
    db.from('monitoring_sessions').select('id,page,source,country,city,last_seen,views',{count:'exact'}).gte('last_seen',new Date(Date.now()-90000).toISOString()).limit(100),
    db.from('monitoring_views').select('page,source,country,city,created_at').gte('created_at',since).order('created_at',{ascending:false}).limit(100),
    db.from('monitoring_views').select('*',{count:'exact',head:true}).gte('created_at',since),
    db.from('monitoring_events').select('id,kind,subject,details,record_type,record_id,status,attempts,provider_id,last_error,created_at,delivered_at,resolved_at,is_test').order('created_at',{ascending:false}).limit(100),
    db.from('monitoring_settings').select('*').eq('id',true).single(),
    ...Object.values(recordTables).map(table=>db!.from(table).select('*',{count:'exact',head:true}).gte('created_at',since)),
    db.from('contact_submissions').select('*',{count:'exact',head:true}).eq('responded',false).eq('archived',false),
    db.from('build_requests').select('*',{count:'exact',head:true}).eq('responded',false).eq('archived',false),
    db.from('application_acquisition_requests').select('*',{count:'exact',head:true}).not('status','in','(acquisition_completed,declined,withdrawn,closed)'),
    db.from('specialized_engineering_requests').select('*',{count:'exact',head:true}).not('status','in','(completed,declined,archived)'),
    db.from('monitoring_events').select('*',{count:'exact',head:true}).eq('kind','incident').is('resolved_at',null).eq('is_test',false),
  ]);
  if(results.some(r=>r.error)) throw new Error('Monitoring migration or database unavailable');
  return {generatedAt:new Date().toISOString(),activeSessionCount:results[0].count||0,activeSessions:results[0].data, recentViews:results[1].data,views24h:results[2].count,events:results[3].data,settings:results[4].data,
    enquiries24h:Object.fromEntries(Object.keys(recordTables).map((k,i)=>[k,results[5+i].count||0])),unresolvedEnquiries:results.slice(9,13).reduce((n,r)=>n+(r.count||0),0),openIncidents:results[13].count||0,
    notificationConfigured:Boolean(process.env.RESEND_API_KEY&&process.env.EMAIL_FROM&&process.env.EMAIL_TO),locationNotice:'Approximate hosting-provider location when available; sessions are anonymous and do not identify a person.'};
}

export async function runMonitoring(options: { forceDailySummary?: boolean } = {}) {
  if(!db) throw new Error('Database unavailable');
  // Bounded reconciliation rescues trigger failures without changing or losing enquiries.
  const reconciliation=await db.rpc('monitoring_reconcile');
  if(reconciliation.error) throw new Error('Enquiry reconciliation unavailable');
  const summary=await monitoringSummary();
  if(summary.settings.summary_enabled && (options.forceDailySummary || new Date().getUTCHours()>=summary.settings.summary_hour)) {
    await enqueue({event_key:`summary:${new Date().toISOString().slice(0,10)}`,kind:'summary',subject:'Daily monitoring summary',details:{views24h:summary.views24h,enquiries24h:summary.enquiries24h,unresolvedEnquiries:summary.unresolvedEnquiries,openIncidents:summary.openIncidents}});
  }
  let processed=0;
  if(summary.notificationConfigured) for(let i=0;i<3;i++) {
    if(!await allow('owner-email',10,60)) break;
    const {data,error}=await db.rpc('monitoring_claim');
    if(error) throw new Error('Notification claim unavailable');
    const event=data?.[0]; if(!event) break;
    try {
      const link=event.record_id&&event.record_type in recordTables?`${site}/admin/monitoring/records/${event.record_type}/${encodeURIComponent(event.record_id)}`:`${site}/admin/dashboard`;
      const result=await sendAdminNotification({subject:`${event.is_test?'[MONITORING TEST] ':''}${event.subject}`,text:formatEnquiryNotification(event.record_type,{subject:event.subject,...(event.details||{})},event.created_at,link),replyTo:event.details?.email||event.details?.buyer_email||process.env.EMAIL_TO!,idempotencyKey:`monitoring/${event.id}`});
      if(result.skipped || !result.id) throw new Error('Notification channel unavailable');
      const {error:updateError}=await db.from('monitoring_events').update({status:'accepted',provider_id:result.id,lease_until:null,last_error:null}).eq('id',event.id).eq('lease_token',event.lease_token);
      if(updateError) throw new Error('Delivery status write failed');
    } catch {
      await db.from('monitoring_events').update({status:event.attempts>=6?'failed':'retry',next_attempt_at:new Date(Date.now()+Math.min(3600000,30000*2**event.attempts)).toISOString(),lease_until:null,last_error:'Delivery attempt failed; will retry up to six attempts. Check provider access and status.'}).eq('id',event.id).eq('lease_token',event.lease_token);
    }
    processed++;
  }
  // Provider acceptance is not delivery. Reconcile actual mailbox-server delivery separately.
  const {data:sent}=await db.from('monitoring_events').select('id,provider_id').eq('status','accepted').order('created_at').limit(3);
  for(const event of sent||[]) {
    try {
      const response=await fetch(`https://api.resend.com/emails/${event.provider_id}`,{headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`},signal:AbortSignal.timeout(8000)});
      if(response.ok) {
        const result=await response.json();
        if(['delivered','bounced','failed','complained'].includes(result.last_event)) await db.from('monitoring_events').update({status:result.last_event,last_error:null,delivered_at:result.last_event==='delivered'?new Date().toISOString():null}).eq('id',event.id);
      } else await db.from('monitoring_events').update({last_error:`Delivery status lookup returned HTTP ${response.status}; verify email-status read access on the Resend key.`}).eq('id',event.id);
    } catch {await db.from('monitoring_events').update({last_error:'Delivery status lookup temporarily unavailable; acceptance is not confirmed delivery.'}).eq('id',event.id);}
  }
  await db.from('monitoring_limits').delete().lt('expires_at',new Date(Date.now()-86400000).toISOString());
  await db.from('monitoring_sessions').delete().lt('last_seen',new Date(Date.now()-30*86400000).toISOString());
  await db.from('monitoring_views').delete().lt('created_at',new Date(Date.now()-30*86400000).toISOString());
  await db.from('monitoring_events').delete().eq('kind','security').eq('status','logged').lt('created_at',new Date(Date.now()-90*86400000).toISOString());
  return {processed,notificationConfigured:summary.notificationConfigured};
}
