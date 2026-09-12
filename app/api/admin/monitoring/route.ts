import {NextRequest,NextResponse} from 'next/server';
import {requireAdmin,requireAdminMutation} from '@/lib/admin-auth';
import {monitoringSummary,incident,runMonitoring,enqueue,allow} from '@/lib/monitoring';
import {randomUUID} from 'node:crypto';
import {after} from 'next/server';
import {supabaseServer as db} from '@/lib/supabase-server';
import {isUuid,readBoundedJson} from '@/lib/request-security';
export async function GET(request:NextRequest) {
  const denied=requireAdmin(request); if(denied) return denied;
  try {return NextResponse.json(await monitoringSummary(),{headers:{'Cache-Control':'no-store'}});}
  catch {return NextResponse.json({error:'Monitoring database is not configured or unavailable'},{status:503});}
}
export async function PATCH(request:NextRequest) {
  const denied=requireAdminMutation(request); if(denied) return denied;
  const parsed=await readBoundedJson(request,{maxBytes:4096,allowedKeys:['resolveId','visitor_alerts','summary_enabled','summary_hour']});if(!parsed.ok)return parsed.response;
  const body=parsed.value;
  if(typeof body.resolveId==='string'){
    if(!isUuid(body.resolveId))return NextResponse.json({error:'Invalid incident ID'},{status:400});
    const {data,error}=await db!.from('monitoring_events').select('record_type,is_test').eq('id',body.resolveId).eq('kind','incident').is('resolved_at',null).maybeSingle();
    if(error||!data)return NextResponse.json({error:'Open incident not found'},{status:404});
    await incident(data.record_type,true,data.is_test);
    after(async()=>{await runMonitoring().catch(()=>{});});
    return NextResponse.json({success:true});
  }
  const summaryHour=body.summary_hour;
  if(typeof body.visitor_alerts!=='boolean'||typeof body.summary_enabled!=='boolean'||typeof summaryHour!=='number'||!Number.isInteger(summaryHour)||summaryHour<0||summaryHour>23) return NextResponse.json({error:'Invalid settings'},{status:400});
  const result=await db?.from('monitoring_settings').update({visitor_alerts:body.visitor_alerts,summary_enabled:body.summary_enabled,summary_hour:summaryHour,updated_at:new Date().toISOString()}).eq('id',true);
  return NextResponse.json({success:Boolean(result&&!result.error)},{status:result&&!result.error?200:503});
}
export async function POST(request:NextRequest){
  const denied=requireAdminMutation(request);if(denied)return denied;
  if(!await allow('owner-test-alert',2,3600))return NextResponse.json({error:'Test limit reached or monitoring unavailable'},{status:429});
  await enqueue({event_key:`owner-test:${randomUUID()}`,kind:'test',subject:'Owner delivery verification',is_test:true,details:{message:'[MONITORING TEST] No customer enquiry. Confirm receipt and inspect delivery status in the dashboard.'}});
  after(async()=>{await runMonitoring().catch(()=>{});});
  return NextResponse.json({queued:true},{status:202});
}
