import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireAdmin } from '@/lib/admin-auth';
import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (!isSupabaseServerConfigured() || !supabaseServer) {
      return NextResponse.json(
        { error: 'Secure Supabase server access is not configured.' },
        { status: 503 }
      );
    }

    const { data, error: loadError } = await supabaseServer
      .from('admin_credentials')
      .select('password_hash')
      .eq('username', 'admin')
      .single();

    const isCurrentPasswordValid = !loadError && Boolean(data?.password_hash) && data.password_hash !== 'placeholder'
      ? await bcrypt.compare(currentPassword, data.password_hash)
      : false;

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const { error: saveError } = await supabaseServer
      .from('admin_credentials')
      .upsert({
        username: 'admin',
        password_hash: hashedPassword,
        last_changed: new Date().toISOString(),
      }, { onConflict: 'username' });

    if (saveError) {
      console.error('Error saving password to Supabase:', saveError);
      return NextResponse.json(
        { error: 'Failed to save new password. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully! Please log in with your new password.',
    });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'An error occurred while changing password' },
      { status: 500 }
    );
  }
}
