import { NextRequest, NextResponse } from 'next/server';
import {isAdminRequest} from '@/lib/admin-auth';
import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';

const allowedEvents = ['product_view', 'product_demo_click', 'acquisition_cta_click', 'acquisition_form_started', 'acquisition_form_completed', 'acquisition_request_submitted', 'licensing_inquiry', 'partnership_inquiry', 'custom_completion_inquiry', 'request_build_click', 'specialized_solution_page_view', 'specialized_solution_cta_click', 'specialized_project_form_started', 'specialized_project_form_submitted', 'specialized_capability_view', 'specialized_example_view'];
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const eventWindows = new Map<string, number[]>();
function eventRateLimited(request: NextRequest) {
  const address = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  const now = Date.now();
  const recent = (eventWindows.get(address) || []).filter((timestamp) => now - timestamp < 60_000);
  if (recent.length >= 60) { eventWindows.set(address, recent); return true; }
  recent.push(now); eventWindows.set(address, recent); return false;
}

export async function POST(request: NextRequest) {
  if(isAdminRequest(request)||request.headers.get('dnt')==='1'||request.headers.get('sec-gpc')==='1'||/bot|crawler|spider|headless|monitor/i.test(request.headers.get('user-agent')||'')) return NextResponse.json({recorded:false});
  if (!isSupabaseServerConfigured() || !supabaseServer) return NextResponse.json({ recorded: false }, { status: 202 });
  try {
    const body = await request.json();
    if(body.consent!==true) return NextResponse.json({recorded:false});
    const eventName = clean(body.eventName, 80);
    if (!allowedEvents.includes(eventName)) return NextResponse.json({ error: 'Invalid event.' }, { status: 400 });
    if (eventRateLimited(request)) return NextResponse.json({ recorded: false }, { status: 202 });
    const { error } = await supabaseServer.from('commercial_events').insert({
      event_name: eventName, product_slug: clean(body.productSlug, 255) || null, page_path: clean(body.pagePath, 1000) || '/', referrer: clean(body.referrer, 1000) || null,
      utm_source: clean(body.utmSource, 240) || null, utm_medium: clean(body.utmMedium, 240) || null, utm_campaign: clean(body.utmCampaign, 240) || null,
    });
    if (error) throw error;
    return NextResponse.json({ recorded: true });
  } catch (error) { console.error('Commercial event error:', error); return NextResponse.json({ recorded: false }, { status: 202 }); }
}
