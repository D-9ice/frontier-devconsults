import { NextRequest, NextResponse, after } from 'next/server';
import { sendBuyerConfirmation } from '@/lib/email';
import { incident, runMonitoring } from '@/lib/monitoring';
import { validatePublicSubmission } from '@/lib/form-protection';
import { specializedLabels } from '@/lib/specialized-options';
import { specializedRequestReference, validateSpecializedRequest } from '@/lib/specialized-requests';
import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';
import { requireSameOrigin } from '@/lib/admin-auth';
import { readBoundedJson } from '@/lib/request-security';

const allowedKeys = ['idempotencyKey', 'fullName', 'email', 'country', 'company', 'phone', 'website', 'jobTitle', 'projectTypes', 'currentSystemState', 'projectDescription', 'equipmentType', 'operatingVoltage', 'powerLevel', 'motorType', 'batteryType', 'existingController', 'existingCommunicationInterface', 'sensorCount', 'deviceCount', 'environment', 'controlRequirements', 'monitoringRequirements', 'interfaceRequirements', 'connectivityRequirements', 'developmentScope', 'timeline', 'budgetRange', 'additionalInformation', 'privacyAcknowledged', 'websiteField', 'attribution'] as const;

export async function POST(request: NextRequest) {
  const invalidOrigin = requireSameOrigin(request); if (invalidOrigin) return invalidOrigin;
  if (!isSupabaseServerConfigured() || !supabaseServer) return NextResponse.json({ error: 'Specialized-project storage is temporarily unavailable.' }, { status: 503 });
  try {
    const parsed = await readBoundedJson(request, { maxBytes: 128 * 1024, allowedKeys }); if (!parsed.ok) return parsed.response;
    const body = parsed.value;
    const protectionError = await validatePublicSubmission(request, body.websiteField, 'specialized-project');
    if (protectionError) return NextResponse.json({ error: protectionError }, { status: 429 });
    const validation = validateSpecializedRequest(body);
    if (!validation.valid) return NextResponse.json({ error: 'Please correct the highlighted fields.', fields: validation.errors }, { status: 400 });
    const value = validation.cleaned;
    const existing = await supabaseServer.from('specialized_engineering_requests').select('reference_number').eq('idempotency_key', value.idempotencyKey).maybeSingle();
    if (existing.error) throw existing.error;
    if (existing.data) return NextResponse.json({ success: true, reference: existing.data.reference_number, duplicate: true });

    const reference = specializedRequestReference();
    const { error } = await supabaseServer.from('specialized_engineering_requests').insert({
      reference_number: reference, idempotency_key: value.idempotencyKey, full_name: value.fullName, email: value.email, country: value.country,
      company: value.company || null, phone: value.phone || null, website: value.website || null, job_title: value.jobTitle || null,
      project_types: value.projectTypes, current_system_state: value.currentSystemState, project_description: value.projectDescription,
      equipment_type: value.equipmentType || null, operating_voltage: value.operatingVoltage || null, power_level: value.powerLevel || null,
      motor_type: value.motorType || null, battery_type: value.batteryType || null, existing_controller: value.existingController || null,
      existing_communication_interface: value.existingCommunicationInterface || null, sensor_count: value.sensorCount || null, device_count: value.deviceCount || null, environment: value.environment || null,
      control_requirements: value.controlRequirements, monitoring_requirements: value.monitoringRequirements, interface_requirements: value.interfaceRequirements,
      connectivity_requirements: value.connectivityRequirements, development_scope: value.developmentScope, timeline: value.timeline || null,
      budget_range: value.budgetRange || null, additional_information: value.additionalInformation || null, privacy_acknowledged: value.privacyAcknowledged,
      utm_source: value.attribution.utmSource || null, utm_medium: value.attribution.utmMedium || null, utm_campaign: value.attribution.utmCampaign || null,
      utm_content: value.attribution.utmContent || null, utm_term: value.attribution.utmTerm || null, referrer: value.attribution.referrer || null, landing_page: value.attribution.landingPage || null,
    });
    if (error) throw error;

    const projectSummary = value.projectTypes.map((type) => specializedLabels.projectType[type as keyof typeof specializedLabels.projectType]).join(', ');
    const summary = `Reference: ${reference}\nClient: ${value.fullName}\nCompany: ${value.company || 'Not provided'}\nCountry: ${value.country}\nProject type: ${projectSummary}\nTimeline: ${value.timeline ? specializedLabels.timeline[value.timeline as keyof typeof specializedLabels.timeline] : 'Not specified'}\n\nProject description:\n${value.projectDescription}`;
    after(async () => { await incident('specialized-submission', true); await runMonitoring().catch(() => console.error('Monitoring worker unavailable')); });
    after(async () => { await Promise.allSettled([
      sendBuyerConfirmation({ to: value.email, subject: 'Frontier DevConsults — Specialized Engineering Request Received', text: `Hello ${value.fullName},\n\nYour specialized engineering request has been received.\n\n${summary}\n\nFrontier DevConsults will review the technical requirements and contact you using the information provided. Feasibility, safety, certification, delivery and commercial scope require project-specific assessment and written agreement.\n\nFrontier DevConsults` }),
    ]); });
    return NextResponse.json({ success: true, reference }, { status: 201 });
  } catch (error) {
    after(() => incident('specialized-submission', false));
    console.error('Specialized engineering submission error:', error);
    return NextResponse.json({ error: 'We could not submit the specialized engineering request. Please try again.' }, { status: 500 });
  }
}
