import { NextRequest, NextResponse } from 'next/server';
import { requireAdminMutation } from '@/lib/admin-auth';
import { cleanText, isUuid, readBoundedJson } from '@/lib/request-security';
import {
  recordTreadmillAdminAudit,
  revokeEngineeringSessions,
  rotateEngineeringCredential,
  updateActivationStatus,
  updateTreadmillLicense,
} from '@/lib/treadmill-licenses';

type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: Context) {
  const unauthorized = requireAdminMutation(request);
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  if (!isUuid(id)) return NextResponse.json({ error: 'Invalid license id.' }, { status: 400 });

  const parsed = await readBoundedJson(request, {
    maxBytes: 16 * 1024,
    allowedKeys: ['action', 'activationId', 'activationStatus'],
  });
  if (!parsed.ok) return parsed.response;

  const action = cleanText(parsed.value.action, 80);

  try {
    if (action === 'suspend') {
      const license = await updateTreadmillLicense(id, { status: 'suspended' });
      await revokeEngineeringSessions(id);
      await recordTreadmillAdminAudit({ licenseId: id, action: 'license_suspended' });
      return NextResponse.json({ license });
    }

    if (action === 'allow') {
      const license = await updateTreadmillLicense(id, { status: 'active' });
      await recordTreadmillAdminAudit({ licenseId: id, action: 'license_allowed' });
      return NextResponse.json({ license });
    }

    if (action === 'revoke') {
      const license = await updateTreadmillLicense(id, { status: 'revoked' });
      await revokeEngineeringSessions(id);
      await recordTreadmillAdminAudit({ licenseId: id, action: 'license_revoked' });
      return NextResponse.json({ license });
    }

    if (action === 'rotate-engineering-credential') {
      const result = await rotateEngineeringCredential(id);
      await recordTreadmillAdminAudit({ licenseId: id, action: 'engineering_credential_rotated' });
      return NextResponse.json({
        ...result,
        warning: 'This new Engineering credential is shown only once.',
      }, { headers: { 'Cache-Control': 'no-store' } });
    }

    if (action === 'revoke-engineering-sessions') {
      await revokeEngineeringSessions(id);
      await recordTreadmillAdminAudit({ licenseId: id, action: 'engineering_sessions_revoked' });
      return NextResponse.json({ ok: true });
    }

    if (action === 'activation-status') {
      const activationId = cleanText(parsed.value.activationId, 80);
      if (!isUuid(activationId)) return NextResponse.json({ error: 'Invalid activation id.' }, { status: 400 });
      const status = parsed.value.activationStatus;
      if (status !== 'active' && status !== 'deactivated' && status !== 'revoked') {
        return NextResponse.json({ error: 'Invalid activation status.' }, { status: 400 });
      }
      const activation = await updateActivationStatus(id, activationId, status);
      await recordTreadmillAdminAudit({
        licenseId: id,
        activationId,
        action: 'activation_status_changed',
        details: { status },
      });
      return NextResponse.json({ activation });
    }

    return NextResponse.json({ error: 'Unsupported license action.' }, { status: 400 });
  } catch (error) {
    console.error('Treadmill license action error:', error);
    return NextResponse.json({ error: 'License action failed.' }, { status: 500 });
  }
}
