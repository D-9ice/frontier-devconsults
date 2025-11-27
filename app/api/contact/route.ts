import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
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
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
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

      if (error) {
        console.error('Supabase error:', error);
      } else {
        console.log('✅ Contact form saved to Supabase:', data);
      }
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

    // Email service integration (same options as request-build)
    if (process.env.NODE_ENV === 'development') {
      console.log('=== NEW CONTACT MESSAGE ===');
      console.log(emailBody);
      console.log('===========================');
    }

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
