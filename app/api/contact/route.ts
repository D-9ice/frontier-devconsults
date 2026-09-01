import { NextRequest, NextResponse } from 'next/server';
import { sendAdminNotification } from '@/lib/email';
import { validatePublicSubmission } from '@/lib/form-protection';
import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';
import { sendWhatsAppContactAlert } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const protectionError = validatePublicSubmission(request, body.website);
    if (protectionError) {
      return NextResponse.json({ error: protectionError }, { status: 429 });
    }
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'subject', 'message'];
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

    // Save to Supabase if configured
    if (isSupabaseServerConfigured() && supabaseServer) {
      const { error } = await supabaseServer
        .from('contact_submissions')
        .insert([
          {
            name: body.name,
            email: body.email,
            phone: body.phone || null,
            message: `Subject: ${body.subject}\n\n${body.message}`,
          }
        ])
        .select();

      if (error) throw error;
    } else {
      return NextResponse.json({ error: 'Form storage is temporarily unavailable.' }, { status: 503 });
    }

    // Format the email content
    const emailSubject = `Contact Form: ${body.subject}`;
    const emailBody = `
New Contact Form Submission

From: ${body.name}
Email: ${body.email}
Subject: ${body.subject}

Message:
${body.message}

---
Submitted on: ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Accra' })}
`;

    const submittedAt = new Date().toLocaleString('en-US', { timeZone: 'Africa/Accra' });
    const [emailNotification, whatsAppNotification] = await Promise.allSettled([
      sendAdminNotification({
        subject: emailSubject,
        text: emailBody,
        replyTo: body.email,
      }),
      sendWhatsAppContactAlert({
        name: String(body.name),
        email: String(body.email),
        subject: String(body.subject),
        message: String(body.message),
        submittedAt,
      }),
    ]);
    if (emailNotification.status === 'rejected') console.error('Contact submission saved, but notification email failed:', emailNotification.reason);
    if (whatsAppNotification.status === 'rejected') console.error('Contact submission saved, but WhatsApp alert failed:', whatsAppNotification.reason);

    return NextResponse.json(
      { 
        success: true,
        message: 'Thank you for your message! We will get back to you soon.',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'An error occurred while sending your message. Please try again.' },
      { status: 500 }
    );
  }
}

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
