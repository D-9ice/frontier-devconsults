import { NextRequest, NextResponse } from 'next/server';
import {isAdminRequest, requireSameOrigin} from '@/lib/admin-auth';
import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';
import { allow } from '@/lib/monitoring';
import { readBoundedJson, sourceHash } from '@/lib/request-security';
import { recordSecurityEvent } from '@/lib/security-monitoring';

const allowedEvents = ['product_view', 'product_demo_click', 'acquisition_cta_click', 'acquisition_form_started', 'acquisition_form_completed', 'acquisition_request_submitted', 'licensing_inquiry', 'partnership_inquiry', 'custom_completion_inquiry', 'request_build_click', 'specialized_solution_page_view', 'specialized_solution_cta_click', 'specialized_project_form_started', 'specialized_project_form_submitted', 'specialized_capability_view', 'specialized_example_view'];
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const allowedKeys = ['consent', 'eventName', 'productSlug', 'pagePath', 'referrer', 'utmSource', 'utmMedium', 'utmCampaign'] as const;

export async function POST(request: NextRequest) {
  const invalidOrigin = requireSameOrigin(request); if (invalidOrigin) return invalidOrigin;
  if(isAdminRequest(request)||request.headers.get('dnt')==='1'||request.headers.get('sec-gpc')==='1'||/bot|crawler|spider|headless|monitor/i.test(request.headers.get('user-agent')||'')) return NextResponse.json({recorded:false});
  if (!isSupabaseServerConfigured() || !supabaseServer) return NextResponse.json({ recorded: false }, { status: 202 });
  try {
    const parsed = await readBoundedJson(request, { maxBytes: 12 * 1024, allowedKeys }); if (!parsed.ok) return parsed.response;
    const body = parsed.value;
    if(body.consent!==true) return NextResponse.json({recorded:false});
    const eventName = clean(body.eventName, 80);
    if (!allowedEvents.includes(eventName)) return NextResponse.json({ error: 'Invalid event.' }, { status: 400 });
    if (!await allow(`commercial-event:${sourceHash(request)}`, 60, 60)) {
      await recordSecurityEvent(request, { category: 'api-rate-limit', severity: 'high', result: 'commercial-events-blocked', alert: true });
      return NextResponse.json({ recorded: false }, { status: 202 });
    }
    const { error } = await supabaseServer.from('commercial_events').insert({
      event_name: eventName, product_slug: clean(body.productSlug, 255) || null, page_path: clean(body.pagePath, 1000) || '/', referrer: clean(body.referrer, 1000) || null,
      utm_source: clean(body.utmSource, 240) || null, utm_medium: clean(body.utmMedium, 240) || null, utm_campaign: clean(body.utmCampaign, 240) || null,
    });
    if (error) throw error;
    return NextResponse.json({ recorded: true });
  } catch (error) { console.error('Commercial event error:', error); return NextResponse.json({ recorded: false }, { status: 202 }); }
}
