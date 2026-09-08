import { NextRequest, NextResponse, after } from 'next/server';
import { incident, runMonitoring } from '@/lib/monitoring';
import { validatePublicSubmission } from '@/lib/form-protection';
import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const protectionError = validatePublicSubmission(request, body.website);
    if (protectionError) {
      return NextResponse.json({ error: protectionError }, { status: 429 });
    }
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'projectType', 'projectName', 'description'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (!phoneRegex.test(body.phone)) {
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
            name: body.name,
            email: body.email,
            phone: body.phone,
            company: body.company || null,
            project_type: body.projectType,
            budget: body.budget || null,
            timeline: body.timeline || null,
            description: `${body.projectName}\n\n${body.description}\n\nPreferred start: ${body.startDate || 'Not specified'}\nAdditional information: ${body.additionalInfo || 'None'}`,
            features: body.features || null,
            reference_links: body.referenceLinks || null,
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
          projectName: body.projectName,
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
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
