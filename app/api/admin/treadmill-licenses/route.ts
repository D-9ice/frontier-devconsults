import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, requireAdminMutation } from '@/lib/admin-auth';
import { readBoundedJson, cleanText } from '@/lib/request-security';
import {
  createTreadmillLicense,
  isLicenseType,
  listTreadmillLicenses,
  treadmillLicenseStats,
} from '@/lib/treadmill-licenses';

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const [licenses, stats] = await Promise.all([
      listTreadmillLicenses(),
      treadmillLicenseStats(),
    ]);
    return NextResponse.json({ licenses, stats }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Treadmill license admin fetch error:', error);
    return NextResponse.json({ error: 'Failed to load treadmill licensing data.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminMutation(request);
  if (unauthorized) return unauthorized;

  const parsed = await readBoundedJson(request, {
    maxBytes: 64 * 1024,
    allowedKeys: [
      'customerName',
      'licenseType',
      'maxInstallations',
      'expiresAt',
      'revalidateDays',
      'offlineGraceDays',
      'brandProfile',
      'modules',
      'notes',
    ],
  });
  if (!parsed.ok) return parsed.response;

  const input = parsed.value;
  const customerName = cleanText(input.customerName, 160);
  if (!customerName) return NextResponse.json({ error: 'Customer/company name is required.' }, { status: 400 });
  if (!isLicenseType(input.licenseType)) return NextResponse.json({ error: 'Invalid license type.' }, { status: 400 });

  const maxInstallations = Number(input.maxInstallations ?? 1);
  const revalidateDays = Number(input.revalidateDays ?? 7);
  const offlineGraceDays = Number(input.offlineGraceDays ?? 30);
  if (!Number.isInteger(maxInstallations) || maxInstallations < 1 || maxInstallations > 10000) {
    return NextResponse.json({ error: 'Installation limit must be between 1 and 10,000.' }, { status: 400 });
  }
  if (!Number.isInteger(revalidateDays) || revalidateDays < 1 || revalidateDays > 90) {
    return NextResponse.json({ error: 'Revalidation period must be between 1 and 90 days.' }, { status: 400 });
  }
  if (!Number.isInteger(offlineGraceDays) || offlineGraceDays < 1 || offlineGraceDays > 365) {
    return NextResponse.json({ error: 'Offline grace period must be between 1 and 365 days.' }, { status: 400 });
  }

  const expiresAt = input.expiresAt ? new Date(String(input.expiresAt)) : null;
  if (expiresAt && Number.isNaN(expiresAt.getTime())) {
    return NextResponse.json({ error: 'Invalid expiry date.' }, { status: 400 });
  }

  const brandProfile = input.brandProfile && typeof input.brandProfile === 'object' && !Array.isArray(input.brandProfile)
    ? input.brandProfile as Record<string, unknown>
    : {};
  const modules = Array.isArray(input.modules)
    ? input.modules.map((item) => cleanText(item, 60)).filter(Boolean).slice(0, 30)
    : undefined;
  const notes = input.notes === null ? null : cleanText(input.notes, 2000) || null;

  try {
    const result = await createTreadmillLicense({
      customerName,
      licenseType: input.licenseType,
      maxInstallations,
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
      revalidateDays,
      offlineGraceDays,
      brandProfile,
      modules,
      notes,
    });

    return NextResponse.json({
      ...result,
      warning: 'The raw license key and Engineering credential are shown only in this response. Store or deliver them securely.',
    }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Treadmill license create error:', error);
    return NextResponse.json({ error: 'Failed to create treadmill license.' }, { status: 500 });
  }
}
