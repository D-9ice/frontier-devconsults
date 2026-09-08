import { NextRequest, NextResponse } from 'next/server';
import { authorizedBearer, runMonitoring } from '@/lib/monitoring';
import {supabaseServer as db} from '@/lib/supabase-server';
export const maxDuration = 60;
export async function POST(request: NextRequest) {
  if(!authorizedBearer(request.headers.get('authorization'),process.env.MONITORING_JOB_TOKEN)) return NextResponse.json({error:'Unauthorized'},{status:401});
  try {
    const body=await request.json().catch(()=>({}));
    if(Array.isArray(body.external)&&body.external.length<=60&&db){
      for(const event of body.external){
        if(!['website','worker','deployment'].includes(event.component)||typeof event.key!=='string'||event.key.length>150||!Number.isFinite(Date.parse(event.time)))continue;
        await db.from('monitoring_events').upsert({event_key:`external:${event.key}`,kind:event.key.includes(':recovery:')?'recovery':'incident',subject:`External ${event.component}: ${event.key.includes(':recovery:')?'recovered':'failed'}`,record_type:`external-${event.component}`,created_at:event.time,status:['accepted','delivered','bounced','failed','complained'].includes(event.status)?event.status:'external-retry',provider_id:typeof event.id==='string'?event.id:null,resolved_at:event.resolved?new Date().toISOString():null},{onConflict:'event_key'});
      }
    }
    return NextResponse.json(await runMonitoring(),{headers:{'Cache-Control':'no-store'}});
  }
  catch { return NextResponse.json({error:'Monitoring worker unavailable'},{status:503}); }
}
