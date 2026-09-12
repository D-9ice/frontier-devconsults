import {NextRequest,NextResponse} from 'next/server';
import {authorizedBearer,allow,monitoringSummary,recordTables} from '@/lib/monitoring';
import {isAdminRequest} from '@/lib/admin-auth';
import {supabaseServer as db} from '@/lib/supabase-server';
import {isUuid,sourceHash} from '@/lib/request-security';
import {recordSecurityEvent} from '@/lib/security-monitoring';
export async function GET(request:NextRequest) {
  if(!isAdminRequest(request)&&!authorizedBearer(request.headers.get('authorization'),process.env.MONITORING_READ_TOKEN)) {await recordSecurityEvent(request,{category:'monitoring-read-auth-failed',severity:'high',result:'blocked',alert:true});return NextResponse.json({error:'Unauthorized'},{status:401});}
  if(!await allow(`monitoring-read:${sourceHash(request)}`,60,60)) return NextResponse.json({error:'Rate limited or unavailable'},{status:429});
  const type=request.nextUrl.searchParams.get('type'); const id=request.nextUrl.searchParams.get('id');
  try {
    if(!type) return NextResponse.json(await monitoringSummary(),{headers:{'Cache-Control':'private, no-store'}});
    if(!Object.hasOwn(recordTables,type)||!isUuid(id)) return NextResponse.json({error:'Valid type and record id required'},{status:400});
    const {data,error}=await db!.from(recordTables[type as keyof typeof recordTables]).select('*').eq('id',id).maybeSingle();
    if(error) throw error; if(!data) return NextResponse.json({error:'Not found'},{status:404});
    delete data.internal_notes;
    return NextResponse.json({record:data},{headers:{'Cache-Control':'private, no-store'}});
  } catch {return NextResponse.json({error:'Monitoring unavailable'},{status:503});}
}
