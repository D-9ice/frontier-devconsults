import { NextRequest, NextResponse, after } from 'next/server';
import { isAdminRequest, requireAdmin } from '@/lib/admin-auth';
import { supabaseServer as db } from '@/lib/supabase-server';
import { allow, enqueue, monitoringSummary, runMonitoring } from '@/lib/monitoring';
import { readBoundedJson, sourceHash } from '@/lib/request-security';
export async function POST(request: NextRequest) {
  const ignored = () => NextResponse.json({tracked:false});
  if (isAdminRequest(request) || /bot|crawler|spider|headless|lighthouse|preview|monitor|uptime/i.test(request.headers.get('user-agent') || '') || request.headers.get('dnt')==='1' || request.headers.get('sec-gpc')==='1') return ignored();
  if (request.headers.get('origin') !== request.nextUrl.origin) return ignored();
  try {
    const parsed = await readBoundedJson(request, { maxBytes: 8 * 1024, allowedKeys: ['consent', 'session', 'page', 'referrer', 'heartbeat'] });
    if (!parsed.ok) return ignored();
    const body = parsed.value;
    if (!db || body.consent !== true || typeof body.session !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.session) || typeof body.page !== 'string' || !/^\/(?!\/)/.test(body.page) || body.page.startsWith('/admin') || body.page.length>250) return ignored();
    const page = body.page.split(/[?#]/)[0];
    const key = sourceHash(request);
    if (!await allow(`visitor:${key}`,120,60)) return ignored();
    let source='Direct'; try { if(typeof body.referrer==='string')source=new URL(body.referrer).hostname; } catch {}
    const country=process.env.VERCEL ? request.headers.get('x-vercel-ip-country')?.slice(0,3) || null : null;
    const city=process.env.VERCEL ? request.headers.get('x-vercel-ip-city')?.slice(0,100) || null : null;
    const {data:previous}=await db.from('monitoring_sessions').select('id,views').eq('id',body.session).maybeSingle();
    const {error}=await db.from('monitoring_sessions').upsert({id:body.session,page,source,country,city,last_seen:new Date().toISOString(),views:(previous?.views||0)+(body.heartbeat?0:1)});
    if (error) return ignored();
    if (!body.heartbeat) {
      await db.from('monitoring_views').insert({session_id:body.session,page,source,country,city});
      await db.from('visitors').insert({page,referrer:source,user_agent:null});
    }
    if (!previous) {
      const {data:settings}=await db.from('monitoring_settings').select('visitor_alerts').eq('id',true).single();
      if(settings?.visitor_alerts && await allow('visitor-arrival-alert',6,3600)) {
        await enqueue({event_key:`arrival:${body.session}`,kind:'visitor_arrival',subject:'Anonymous visitor arrived',details:{page,source,country,city,notice:'Approximate location; not an identity.'}});
        after(async()=>{await runMonitoring().catch(()=>{});});
      }
    }
    return NextResponse.json({tracked:true});
  } catch { return ignored(); }
}
export async function GET(request: NextRequest) {
  const denied=requireAdmin(request); if(denied) return denied;
  try { return NextResponse.json(await monitoringSummary(),{headers:{'Cache-Control':'no-store'}}); }
  catch { return NextResponse.json({error:'Monitoring unavailable'},{status:503}); }
}
