import { NextResponse } from 'next/server';
import { getPricingSettings } from '@/lib/pricing-store';

export async function GET() {
  try {
    const settings = await getPricingSettings();
    return NextResponse.json(settings, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Pricing settings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to load pricing settings' },
      { status: 500 }
    );
  }
}
