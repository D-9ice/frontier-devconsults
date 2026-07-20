import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { setAdminSession } from '@/lib/admin-auth';
import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';

const fallbackPassword = process.env.ADMIN_PASSWORD || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    let isValid = false;

    if (isSupabaseServerConfigured() && supabaseServer) {
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
    }

    // This supports local development before the secure database environment is configured.
    // Production must use the database-backed credential and ADMIN_SESSION_SECRET.
    if (!isValid && process.env.NODE_ENV !== 'production' && fallbackPassword) {
      isValid = password === fallbackPassword;
    }

    if (isValid) {
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
      });
      setAdminSession(response);
      return response;
    } else {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
