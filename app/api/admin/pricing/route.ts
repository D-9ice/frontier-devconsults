import { NextRequest, NextResponse } from 'next/server';
import { getPricingSettings, savePricingSettings } from '@/lib/pricing-store';
import { mergePricingSettings, PricingSettings } from '@/lib/pricing';

function hasAdminToken(request: NextRequest) {
  return Boolean(request.headers.get('x-admin-token'));
}

function validateSettings(settings: PricingSettings) {
  if (!Number.isFinite(settings.exchangeRate) || settings.exchangeRate <= 0) {
    return 'Exchange rate must be greater than 0.';
  }

  if (!Number.isFinite(settings.roundingIncrement) || settings.roundingIncrement <= 0) {
    return 'Rounding increment must be greater than 0.';
  }

  const prices = [
    ...settings.tiers.map((item) => item.price),
    ...settings.developmentServices.map((item) => item.price),
    ...settings.additionalServices.map((item) => item.price),
  ];

  for (const price of prices) {
    if (!Number.isFinite(price.minUsd) || price.minUsd <= 0) {
      return 'Every price must have a minimum USD amount greater than 0.';
    }

    if (price.maxUsd !== undefined && (!Number.isFinite(price.maxUsd) || price.maxUsd < price.minUsd)) {
      return 'Maximum USD amounts must be greater than or equal to minimum USD amounts.';
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  if (!hasAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = await getPricingSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Admin pricing fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to load pricing settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!hasAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const settings = mergePricingSettings(body);
    const validationError = validateSettings(settings);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const saved = await savePricingSettings(settings);
    return NextResponse.json({
      success: true,
      settings: saved,
    });
  } catch (error) {
    console.error('Admin pricing save error:', error);
    return NextResponse.json(
      { error: 'Failed to save pricing settings' },
      { status: 500 }
    );
  }
}
