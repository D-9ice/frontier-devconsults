import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireSameOrigin, setAdminSession } from '@/lib/admin-auth';
import {
  getAdminLoginClientIp,
  hashAdminLoginClientIp,
  parseLoginThrottleDecision,
} from '@/lib/login-throttle';
import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';

const fallbackPassword = process.env.ADMIN_PASSWORD || '';
const genericFailureMessage = 'Unable to sign in with those credentials.';

function getThrottleSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    (process.env.NODE_ENV !== 'production' ? fallbackPassword : '');

  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET must be configured for login throttling.');
  }

  return secret;
}

function loginFailure(status: 401 | 429, retryAfterSeconds = 0) {
  const response = NextResponse.json(
    { error: genericFailureMessage, message: genericFailureMessage },
    { status }
  );

  if (retryAfterSeconds > 0) {
    response.headers.set('Retry-After', String(retryAfterSeconds));
  }

  return response;
}

async function beginLoginAttempt(ipHash: string) {
  if (!supabaseServer) {
    throw new Error('The server-only Supabase client is unavailable.');
  }

  const { data, error } = await supabaseServer.rpc('begin_admin_login_attempt', {
    p_ip_hash: ipHash,
  });

  if (error) throw error;
  return parseLoginThrottleDecision(data);
}

async function clearFailures(ipHash: string) {
  if (!supabaseServer) {
    throw new Error('The server-only Supabase client is unavailable.');
  }

  const { error } = await supabaseServer.rpc('clear_admin_login_throttle', {
    p_ip_hash: ipHash,
  });

  if (error) throw error;
}

export async function POST(request: NextRequest) {
  const invalidOrigin = requireSameOrigin(request);
  if (invalidOrigin) return invalidOrigin;

  try {
    const hasServerSupabase = isSupabaseServerConfigured() && Boolean(supabaseServer);

    if (!hasServerSupabase && process.env.NODE_ENV === 'production') {
      throw new Error('Admin login requires the server-only Supabase client.');
    }

    let ipHash: string | null = null;
    let attemptRetryAfterSeconds = 0;

    if (hasServerSupabase) {
      const clientIp = getAdminLoginClientIp(request.headers);
      ipHash = hashAdminLoginClientIp(clientIp, getThrottleSecret());
      const throttle = await beginLoginAttempt(ipHash);
      attemptRetryAfterSeconds = throttle.retryAfterSeconds;

      if (!throttle.allowed) {
        return loginFailure(429, throttle.retryAfterSeconds);
      }
    }

    const body = await request.json().catch(() => null);
    const password =
      body && typeof body === 'object' && typeof body.password === 'string'
        ? body.password
        : '';
    let isValid = false;

    if (supabaseServer && hasServerSupabase) {
      try {
        const { data, error } = await supabaseServer
          .from('admin_credentials')
          .select('password_hash')
          .eq('username', 'admin')
          .single();

        if (!error && data?.password_hash && data.password_hash !== 'placeholder') {
          isValid = await bcrypt.compare(password, data.password_hash);
        } else if (fallbackPassword && password === fallbackPassword) {
          // Migrate the earlier placeholder credential on the first secure login.
          // The environment password is only used for this one-time bootstrap.
          const passwordHash = await bcrypt.hash(password, 12);
          const { error: saveError } = await supabaseServer
            .from('admin_credentials')
            .upsert({
              username: 'admin',
              password_hash: passwordHash,
              last_changed: new Date().toISOString(),
            }, { onConflict: 'username' });

          if (saveError) {
            console.error('Admin credential bootstrap failed:', saveError);
          } else {
            isValid = true;
          }
        }
      } catch (err) {
        console.error('Supabase password check error:', err);
      }
    } else if (fallbackPassword) {
      isValid = password === fallbackPassword;
    }

    if (isValid) {
      if (ipHash) {
        await clearFailures(ipHash);
      }
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
      });
      setAdminSession(response);
      return response;
    }

    if (!ipHash) {
      return loginFailure(401);
    }

    return attemptRetryAfterSeconds > 0
      ? loginFailure(429, attemptRetryAfterSeconds)
      : loginFailure(401);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Admin sign-in is temporarily unavailable.' },
      { status: 503 }
    );
  }
}
