import { NextRequest, NextResponse } from 'next/server';
import { sendAdminNotification } from '@/lib/email';
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
            description: `${body.projectName}\n\n${body.description}`,
            features: body.features || null,
            reference_links: body.referenceLinks || null,
          }
        ])
        .select();

      if (error) throw error;
    } else {
      return NextResponse.json({ error: 'Form storage is temporarily unavailable.' }, { status: 503 });
    }

    // Format the email content
    const emailSubject = `New Project Request: ${body.projectName}`;
    const emailBody = `
New Project Request from Frontier DevConsults Website

=== PERSONAL INFORMATION ===
Name: ${body.name}
Email: ${body.email}
Phone: ${body.phone}
Company: ${body.company || 'Not provided'}

=== PROJECT DETAILS ===
Project Type: ${body.projectType}
Project Name: ${body.projectName}
Description: ${body.description}
Key Features: ${body.features || 'Not provided'}

=== TIMELINE & BUDGET ===
Timeline: ${body.timeline || 'Not specified'}
Budget Range: ${body.budget || 'Not specified'}
Preferred Start Date: ${body.startDate || 'Flexible'}

=== ADDITIONAL INFORMATION ===
${body.additionalInfo || 'None provided'}

---
Submitted on: ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Accra' })}
`;

    try {
      await sendAdminNotification({
        subject: emailSubject,
        text: emailBody,
        replyTo: body.email,
      });
    } catch (emailError) {
      console.error('Build request saved, but notification email failed:', emailError);
    }

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
