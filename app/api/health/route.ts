import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
export const dynamic = 'force-dynamic';
export async function GET() {
  const result=await supabaseServer?.from('contact_submissions').select('id').limit(1);
  const ok=Boolean(result && !result.error);
  return NextResponse.json({status:ok?'ok':'degraded'},{status:ok?200:503,headers:{'Cache-Control':'no-store'}});
}
