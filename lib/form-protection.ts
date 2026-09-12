import { NextRequest } from 'next/server';
import { allow } from '@/lib/monitoring';
import { sourceHash } from '@/lib/request-security';
import { recordSecurityEvent } from '@/lib/security-monitoring';

export async function validatePublicSubmission(request: NextRequest, honeypot: unknown, category = 'public-form') {
  if (typeof honeypot === 'string' && honeypot.trim()) {
    await recordSecurityEvent(request, { category: 'form-honeypot', severity: 'medium', result: category });
    return 'Unable to process this submission.';
  }
  const permitted = await allow(`public-form:${category}:${sourceHash(request)}`, 5, 600);
  if (!permitted) {
    await recordSecurityEvent(request, { category: 'form-rate-limit', severity: 'high', result: category, alert: true });
    return 'Too many submissions. Please wait a few minutes and try again.';
  }
  return null;
}
