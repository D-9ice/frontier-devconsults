import { NextRequest, NextResponse } from 'next/server';
import { acquisitionReference, validateAcquisitionInput } from '@/lib/acquisitions';
import { labels } from '@/lib/acquisition-options';
import { getPublishedAppBySlug } from '@/lib/apps';
import { isAcquisitionEnabled } from '@/lib/application-presentation';
import { sendAdminNotification, sendBuyerConfirmation } from '@/lib/email';
import { validatePublicSubmission } from '@/lib/form-protection';
import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  if (!isSupabaseServerConfigured() || !supabaseServer) return NextResponse.json({ error: 'Acquisition request storage is temporarily unavailable.' }, { status: 503 });
  try {
    const body = await request.json();
    const protectionError = validatePublicSubmission(request, body.websiteField);
    if (protectionError) return NextResponse.json({ error: protectionError }, { status: 429 });
    const slug = typeof body.productSlug === 'string' ? body.productSlug.trim() : '';
    const app = slug ? await getPublishedAppBySlug(slug) : null;
    if (!app || !isAcquisitionEnabled(app)) return NextResponse.json({ error: 'This application is not currently accepting acquisition requests.' }, { status: 404 });
    const validation = validateAcquisitionInput(body, app);
    if (!validation.valid) return NextResponse.json({ error: 'Please correct the highlighted fields.', fields: validation.errors }, { status: 400 });
    const value = validation.cleaned;
    const existing = await supabaseServer.from('application_acquisition_requests').select('reference_number').eq('idempotency_key', value.idempotencyKey).maybeSingle();
    if (existing.error) throw existing.error;
    if (existing.data) return NextResponse.json({ success: true, reference: existing.data.reference_number, duplicate: true });
    const reference = acquisitionReference();
    const { error } = await supabaseServer.from('application_acquisition_requests').insert({
      reference_number: reference, idempotency_key: value.idempotencyKey, product_id: app.id, product_slug: app.slug, product_name: app.name,
      buyer_full_name: value.fullName, buyer_company: value.company, buyer_email: value.email, buyer_phone: value.phone || null, buyer_country: value.country,
      buyer_website: value.website || null, buyer_role: value.role || null, buyer_type: value.buyerType, acquisition_type: value.acquisitionType,
      intended_use: value.intendedUse, deployment_market: value.deploymentMarket, source_code_transfer: value.sourceCodeTransfer,
      ip_branding_transfer: value.ipBrandingTransfer, completion_requirement: value.completionRequirement,
      additional_development_requirements: value.additionalDevelopmentRequirements || null, support_requirement: value.supportRequirement,
      budget_range: value.budgetRange || null, acquisition_timeline: value.acquisitionTimeline, additional_requirements: value.additionalRequirements || null,
      legal_acknowledged: value.legalAcknowledged, privacy_acknowledged: value.privacyAcknowledged,
      utm_source: value.attribution?.utmSource || null, utm_medium: value.attribution?.utmMedium || null, utm_campaign: value.attribution?.utmCampaign || null,
      utm_content: value.attribution?.utmContent || null, utm_term: value.attribution?.utmTerm || null, referrer: value.attribution?.referrer || null, landing_page: value.attribution?.landingPage || null,
    });
    if (error) throw error;
    const typeLabel = labels.acquisitionType[value.acquisitionType as keyof typeof labels.acquisitionType];
    const summary = `Application: ${app.name}\nReference: ${reference}\nBuyer: ${value.fullName}\nCompany: ${value.company}\nCountry: ${value.country}\nRequest type: ${typeLabel}\nBudget: ${value.budgetRange ? labels.budget[value.budgetRange as keyof typeof labels.budget] : 'Not disclosed'}\nTimeline: ${labels.timeline[value.acquisitionTimeline as keyof typeof labels.timeline]}`;
    const adminUrl = 'https://www.frontier-devconsults.com/admin/acquisitions';
    await Promise.allSettled([
      sendAdminNotification({ subject: `Application acquisition request — ${app.name} — ${reference}`, text: `${summary}\n\nAdmin: ${adminUrl}`, replyTo: value.email }),
      sendBuyerConfirmation({ to: value.email, subject: 'Frontier DevConsults — Application Acquisition Request Received', text: `Hello ${value.fullName},\n\nYour application acquisition request has been received.\n\n${summary}\n\nFrontier DevConsults will review the request and contact you using the information provided. Submission begins our review process and is not a purchase agreement or transfer of ownership.\n\nFrontier DevConsults` }),
    ]);
    return NextResponse.json({ success: true, reference }, { status: 201 });
  } catch (error) {
    console.error('Acquisition submission error:', error);
    return NextResponse.json({ error: 'We could not submit the acquisition request. Please try again.' }, { status: 500 });
  }
}
