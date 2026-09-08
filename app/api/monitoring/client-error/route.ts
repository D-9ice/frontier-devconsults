import {NextRequest,NextResponse,after} from 'next/server';
import {allow,incident,runMonitoring} from '@/lib/monitoring';
export async function POST(request:NextRequest){
  if(request.headers.get('origin')!==request.nextUrl.origin||/bot|crawler|spider|headless/i.test(request.headers.get('user-agent')||''))return NextResponse.json({recorded:false});
  try{
    const body=await request.json();
    if(body.kind!=='browser-error'||!await allow('browser-error-report',3,300))return NextResponse.json({recorded:false});
    after(async()=>{await incident('browser-error',false);await runMonitoring().catch(()=>{});});
    return NextResponse.json({recorded:true});
  }catch{return NextResponse.json({recorded:false});}
}
