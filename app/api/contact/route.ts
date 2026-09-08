import { NextRequest, NextResponse, after } from 'next/server';
import { incident, runMonitoring } from '@/lib/monitoring';
import {sendWhatsAppContactAlert,whatsAppAlertConfigured} from '@/lib/whatsapp';
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

    after(async () => { await incident("contact-submission", true); await runMonitoring().catch(() => console.error("Monitoring worker unavailable")); });
    if(whatsAppAlertConfigured()) after(async()=>{await sendWhatsAppContactAlert({name:body.name,email:body.email,subject:body.subject,message:body.message,submittedAt:new Date().toISOString()}).catch(()=>console.error('WhatsApp notification unavailable'));});

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
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
