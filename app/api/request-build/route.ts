import { NextRequest, NextResponse, after } from 'next/server';
import { incident, runMonitoring } from '@/lib/monitoring';
import { validatePublicSubmission } from '@/lib/form-protection';
import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';
import { requireSameOrigin } from '@/lib/admin-auth';
import { cleanText, readBoundedJson } from '@/lib/request-security';

const allowedKeys = ['name', 'email', 'phone', 'company', 'projectType', 'projectName', 'description', 'features', 'timeline', 'budget', 'startDate', 'additionalInfo', 'referenceLinks', 'website'] as const;

export async function POST(request: NextRequest) {
  const invalidOrigin = requireSameOrigin(request);
  if (invalidOrigin) return invalidOrigin;
  try {
    const parsed = await readBoundedJson(request, { maxBytes: 64 * 1024, allowedKeys });
    if (!parsed.ok) return parsed.response;
    const body = parsed.value;

    const protectionError = await validatePublicSubmission(request, body.website, 'request-build');
    if (protectionError) {
      return NextResponse.json({ error: protectionError }, { status: 429 });
    }
    
    // Validate required fields
    const value = {
      name: cleanText(body.name, 200), email: cleanText(body.email, 320).toLowerCase(), phone: cleanText(body.phone, 80), company: cleanText(body.company, 240),
      projectType: cleanText(body.projectType, 120), projectName: cleanText(body.projectName, 240), description: cleanText(body.description, 8_000),
      features: cleanText(body.features, 5_000), timeline: cleanText(body.timeline, 120), budget: cleanText(body.budget, 120), startDate: cleanText(body.startDate, 40),
      additionalInfo: cleanText(body.additionalInfo, 8_000), referenceLinks: cleanText(body.referenceLinks, 4_000),
    };
    const requiredFields = ['name', 'email', 'phone', 'projectType', 'projectName', 'description'] as const;
    const missingFields = requiredFields.filter(field => !value[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (!phoneRegex.test(value.phone)) {
      return NextResponse.json(
        { error: 'Invalid phone format' },
        { status: 400 }
      );
    }

    // Save to Supabase if configured
    if (isSupabaseServerConfigured() && supabaseServer) {
      const { error } = await supabaseServer
        .from('build_requests')
        .insert([
          {
            name: value.name,
            email: value.email,
            phone: value.phone,
            company: value.company || null,
            project_type: value.projectType,
            budget: value.budget || null,
            timeline: value.timeline || null,
            description: `${value.projectName}\n\n${value.description}\n\nPreferred start: ${value.startDate || 'Not specified'}\nAdditional information: ${value.additionalInfo || 'None'}`,
            features: value.features || null,
            reference_links: value.referenceLinks || null,
          }
        ])
        .select();

      if (error) throw error;
    } else {
      return NextResponse.json({ error: 'Form storage is temporarily unavailable.' }, { status: 503 });
    }

    after(async () => { await incident("build-submission", true); await runMonitoring().catch(() => console.error("Monitoring worker unavailable")); });

    return NextResponse.json(
      { 
        success: true,
        message: 'Your project request has been received! We will contact you within 24-48 hours.',
        data: {
          projectName: value.projectName,
          submittedAt: new Date().toISOString(),
        }
      },
      { status: 200 }
    );

  } catch (error) {
    after(() => incident('build-submission', false));
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request. Please try again or contact us directly.' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  const invalidOrigin = requireSameOrigin(request);
  if (invalidOrigin) return invalidOrigin;
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': request.nextUrl.origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    },
  });
}
