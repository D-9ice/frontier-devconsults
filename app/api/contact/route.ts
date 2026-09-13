import { NextRequest, NextResponse, after } from 'next/server';
import { incident, runMonitoring } from '@/lib/monitoring';
import { validatePublicSubmission } from '@/lib/form-protection';
import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';
import { requireSameOrigin } from '@/lib/admin-auth';
import { cleanText, readBoundedJson } from '@/lib/request-security';

const allowedKeys = ['name', 'email', 'phone', 'subject', 'message', 'website'] as const;

export async function POST(request: NextRequest) {
  const invalidOrigin = requireSameOrigin(request);
  if (invalidOrigin) return invalidOrigin;
  try {
    const parsed = await readBoundedJson(request, { maxBytes: 16 * 1024, allowedKeys });
    if (!parsed.ok) return parsed.response;
    const body = parsed.value;

    const protectionError = await validatePublicSubmission(request, body.website, 'contact');
    if (protectionError) {
      return NextResponse.json({ error: protectionError }, { status: 429 });
    }
    
    // Validate required fields
    const value = {
      name: cleanText(body.name, 200), email: cleanText(body.email, 320).toLowerCase(), phone: cleanText(body.phone, 80),
      subject: cleanText(body.subject, 240), message: cleanText(body.message, 8_000),
    };
    const requiredFields = ['name', 'email', 'subject', 'message'] as const;
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

    // Save to Supabase if configured
    if (isSupabaseServerConfigured() && supabaseServer) {
      const { error } = await supabaseServer
        .from('contact_submissions')
        .insert([
          {
            name: value.name,
            email: value.email,
            phone: value.phone || null,
            message: `Subject: ${value.subject}\n\n${value.message}`,
          }
        ])
        .select();

      if (error) throw error;
    } else {
      return NextResponse.json({ error: 'Form storage is temporarily unavailable.' }, { status: 503 });
    }

    after(async () => { await incident("contact-submission", true); await runMonitoring().catch(() => console.error("Monitoring worker unavailable")); });

    return NextResponse.json(
      { 
        success: true,
        message: 'Thank you for your message! We will get back to you soon.',
      },
      { status: 200 }
    );

  } catch (error) {
    after(() => incident('contact-submission', false));
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'An error occurred while sending your message. Please try again.' },
      { status: 500 }
    );
  }
}

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
