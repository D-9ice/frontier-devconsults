import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
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
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
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

      if (error) {
        console.error('Supabase error:', error);
      } else {
        console.log('✅ Build request saved to Supabase:', data);
      }
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

    // Here you would integrate with your email service
    // For now, we'll use a placeholder that you can replace with your actual service
    
    // Option 1: Using Resend (recommended for Next.js)
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'noreply@frontier-devconsults.com',
    //   to: 'info@frontier-devconsults.com',
    //   subject: emailSubject,
    //   text: emailBody,
    // });

    // Option 2: Using SendGrid
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to: 'info@frontier-devconsults.com',
    //   from: 'noreply@frontier-devconsults.com',
    //   subject: emailSubject,
    //   text: emailBody,
    // });

    // Option 3: Using Nodemailer (for SMTP)
    // const nodemailer = require('nodemailer');
    // const transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST,
    //   port: process.env.SMTP_PORT,
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASS,
    //   },
    // });
    // await transporter.sendMail({
    //   from: process.env.SMTP_FROM,
    //   to: 'info@frontier-devconsults.com',
    //   subject: emailSubject,
    //   text: emailBody,
    // });

    // For development/testing, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log('=== NEW PROJECT REQUEST ===');
      console.log(emailBody);
      console.log('===========================');
    }

    // Optionally save to database
    // const prisma = new PrismaClient();
    // await prisma.projectRequest.create({
    //   data: {
    //     name: body.name,
    //     email: body.email,
    //     phone: body.phone,
    //     company: body.company,
    //     projectType: body.projectType,
    //     projectName: body.projectName,
    //     description: body.description,
    //     features: body.features,
    //     timeline: body.timeline,
    //     budget: body.budget,
    //     startDate: body.startDate,
    //     additionalInfo: body.additionalInfo,
    //     submittedAt: new Date(),
    //   },
    // });

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
