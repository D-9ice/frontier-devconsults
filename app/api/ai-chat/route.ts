import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rate limiting storage (in production, use Redis or database)
const dailyUsage = new Map<string, { count: number; date: string }>();
const sessionUsage = new Map<string, number>();

const DAILY_LIMIT = 50;
const SESSION_LIMIT = 10;

// System prompt with Frontier DevConsults context
const SYSTEM_PROMPT = `You are an AI assistant for Frontier DevConsults, a software development company based in Greater Accra, Ghana.

Company Information:
- We transform ideas into production-ready applications
- Specialties: Mobile apps (Flutter), Web platforms (Next.js, React), AI-powered solutions (TensorFlow)
- Services: Custom software development, e-commerce solutions, mobile app development, web development, AI integration
- Contact: info@frontier-devconsults.com, +1 (754) 217-0678, +233 249 078 976
- Website: www.frontier-devconsults.com
- Location: Greater Accra, Ghana

Featured Projects:
1. MacSunny - Food delivery app with real-time tracking
2. Lotto - Digital lottery platform
3. C-ZAN - Custom CRM solution
4. Digital Savings - Mobile banking app
5. Circuit Designer - Electronics design tool
6. Scripture Alive - Bible study platform
7. BETHEL - Church management system
8. Lotus Hill Academy - Educational platform
9. LiveSource - Live streaming platform
10. Kelélé Bespoke Clothing - AI-powered fashion app
11. GH-MARKET - E-commerce marketplace
12. Family Tree - Genealogy and family history app

Pricing Approach:
- We provide free initial consultations
- Custom quotes based on project scope
- Transparent pricing with detailed proposals
- Flexible payment plans available
- Typical turnaround: 2-8 weeks depending on complexity

Your Role:
- Answer questions about our services, projects, and capabilities
- Help potential clients understand what we can build for them
- Guide users to contact us for quotes and consultations
- Be professional, friendly, and helpful
- If asked about specific pricing, explain we provide custom quotes after consultation
- Encourage users to fill out the "Request a Build" form or contact us directly

Keep responses concise, helpful, and focused on helping potential clients.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact us directly.' },
        { status: 503 }
      );
    }

    // Check daily rate limit
    const today = new Date().toISOString().split('T')[0];
    const dailyKey = 'global';
    const dailyData = dailyUsage.get(dailyKey);

    if (dailyData) {
      if (dailyData.date !== today) {
        // Reset for new day
        dailyUsage.set(dailyKey, { count: 1, date: today });
      } else if (dailyData.count >= DAILY_LIMIT) {
        return NextResponse.json({
          error: 'daily_limit',
          message: 'Our AI assistant has reached its daily capacity. Please contact us directly at info@frontier-devconsults.com or use our live chat.',
        }, { status: 429 });
      } else {
        dailyData.count++;
      }
    } else {
      dailyUsage.set(dailyKey, { count: 1, date: today });
    }

    // Check session rate limit
    const sessionCount = sessionUsage.get(sessionId) || 0;
    if (sessionCount >= SESSION_LIMIT) {
      return NextResponse.json({
        error: 'session_limit',
        message: 'You\'ve reached the conversation limit for this session. Please contact us directly for more assistance at info@frontier-devconsults.com.',
      }, { status: 429 });
    }
    sessionUsage.set(sessionId, sessionCount + 1);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again or contact us directly.';

    // Track usage stats
    const usage = {
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      totalTokens: completion.usage?.total_tokens || 0,
    };

    return NextResponse.json({
      reply,
      usage,
      remainingDaily: DAILY_LIMIT - (dailyUsage.get(dailyKey)?.count || 0),
      remainingSession: SESSION_LIMIT - (sessionUsage.get(sessionId) || 0),
    });

  } catch (error: any) {
    console.error('AI Chat Error:', error);
    
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'AI service quota exceeded. Please contact us directly at info@frontier-devconsults.com.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred. Please try again or contact us directly.' },
      { status: 500 }
    );
  }
}

// GET endpoint for usage stats
export async function GET() {
  const today = new Date().toISOString().split('T')[0];
  const dailyData = dailyUsage.get('global');
  
  return NextResponse.json({
    dailyUsed: dailyData?.date === today ? dailyData.count : 0,
    dailyLimit: DAILY_LIMIT,
    sessionLimit: SESSION_LIMIT,
  });
}
