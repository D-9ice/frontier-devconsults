import { NextRequest, NextResponse } from 'next/server';
import { clearAdminSession, requireSameOrigin } from '@/lib/admin-auth';

export function POST(request: NextRequest) {
  const invalidOrigin = requireSameOrigin(request);
  if (invalidOrigin) return invalidOrigin;

  const response = NextResponse.json({ success: true });
  clearAdminSession(response);
  return response;
}
