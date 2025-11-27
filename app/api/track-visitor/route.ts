import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { page, timestamp, referrer } = body;
    const userAgent = request.headers.get('user-agent');

    // Save to Supabase if configured
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('visitor_logs')
        .insert([
          {
            page,
            referrer: referrer || null,
            user_agent: userAgent,
            ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          }
        ]);

      if (error) {
        console.error('Visitor tracking error:', error);
      }
    } else {
      // Fallback: Just log
      console.log('📊 Visitor tracked:', {
        page,
        timestamp,
        referrer: referrer || 'Direct',
        userAgent,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Visit tracked',
    });
  } catch (error) {
    console.error('Visitor tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track visit' },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({
      totalVisitors: 0,
      visitsToday: 0,
      message: 'Connect Supabase to enable visitor tracking',
    });
  }

  try {
    // Get total visitors
    const { count: totalVisitors } = await supabase
      .from('visitor_logs')
      .select('*', { count: 'exact', head: true });

    // Get today's visitors
    const today = new Date().toISOString().split('T')[0];
    const { count: visitsToday } = await supabase
      .from('visitor_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);

    return NextResponse.json({
      totalVisitors: totalVisitors || 0,
      visitsToday: visitsToday || 0,
    });
  } catch (error) {
    console.error('Error fetching visitor stats:', error);
    return NextResponse.json({
      totalVisitors: 0,
      visitsToday: 0,
      error: 'Failed to fetch stats',
    });
  }
}
