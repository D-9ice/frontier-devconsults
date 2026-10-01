import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, requireAdminMutation } from '@/lib/admin-auth';
import { cleanText, isUuid, readBoundedJson } from '@/lib/request-security';
import {
  getTreadmillLicense,
  isLicenseStatus,
  updateTreadmillLicense,
} from '@/lib/treadmill-licenses';

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  if (!isUuid(id)) return NextResponse.json({ error: 'Invalid license id.' }, { status: 400 });

  try {
    return NextResponse.json(await getTreadmillLicense(id), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Treadmill license detail fetch error:', error);
    return NextResponse.json({ error: 'Failed to load license detail.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  const unauthorized = requireAdminMutation(request);
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  if (!isUuid(id)) return NextResponse.json({ error: 'Invalid license id.' }, { status: 400 });

  const parsed = await readBoundedJson(request, {
    maxBytes: 64 * 1024,
    allowedKeys: [
      'customerName',
      'status',
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
  const patch: Parameters<typeof updateTreadmillLicense>[1] = {};

  if (input.customerName !== undefined) {
    const customerName = cleanText(input.customerName, 160);
    if (!customerName) return NextResponse.json({ error: 'Customer/company name cannot be empty.' }, { status: 400 });
    patch.customerName = customerName;
  }
  if (input.status !== undefined) {
    if (!isLicenseStatus(input.status)) return NextResponse.json({ error: 'Invalid license status.' }, { status: 400 });
    patch.status = input.status;
  }
  if (input.maxInstallations !== undefined) {
    const value = Number(input.maxInstallations);
    if (!Number.isInteger(value) || value < 1 || value > 10000) {
      return NextResponse.json({ error: 'Installation limit must be between 1 and 10,000.' }, { status: 400 });
    }
    patch.maxInstallations = value;
  }
  if (input.revalidateDays !== undefined) {
    const value = Number(input.revalidateDays);
    if (!Number.isInteger(value) || value < 1 || value > 90) {
      return NextResponse.json({ error: 'Revalidation period must be between 1 and 90 days.' }, { status: 400 });
    }
    patch.revalidateDays = value;
  }
  if (input.offlineGraceDays !== undefined) {
    const value = Number(input.offlineGraceDays);
    if (!Number.isInteger(value) || value < 1 || value > 365) {
      return NextResponse.json({ error: 'Offline grace period must be between 1 and 365 days.' }, { status: 400 });
    }
    patch.offlineGraceDays = value;
  }
  if (input.expiresAt !== undefined) {
    if (input.expiresAt === null || input.expiresAt === '') {
      patch.expiresAt = null;
    } else {
      const date = new Date(String(input.expiresAt));
      if (Number.isNaN(date.getTime())) return NextResponse.json({ error: 'Invalid expiry date.' }, { status: 400 });
      patch.expiresAt = date.toISOString();
    }
  }
  if (input.brandProfile !== undefined) {
    if (!input.brandProfile || typeof input.brandProfile !== 'object' || Array.isArray(input.brandProfile)) {
      return NextResponse.json({ error: 'Brand profile must be an object.' }, { status: 400 });
    }
    patch.brandProfile = input.brandProfile as Record<string, unknown>;
  }
  if (input.modules !== undefined) {
    if (!Array.isArray(input.modules)) return NextResponse.json({ error: 'Modules must be an array.' }, { status: 400 });
    patch.modules = input.modules.map((item) => cleanText(item, 60)).filter(Boolean).slice(0, 30);
  }
  if (input.notes !== undefined) {
    patch.notes = input.notes === null ? null : cleanText(input.notes, 2000) || null;
  }

  try {
    const license = await updateTreadmillLicense(id, patch);
    return NextResponse.json({ license }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Treadmill license update error:', error);
    return NextResponse.json({ error: 'Failed to update treadmill license.' }, { status: 500 });
  }
}
