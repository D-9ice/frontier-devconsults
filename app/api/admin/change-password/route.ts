import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { clearAdminSession, requireAdminMutation } from '@/lib/admin-auth';
import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';
import { readBoundedJson } from '@/lib/request-security';

export async function POST(request: NextRequest) {
  try {
  const unauthorized = requireAdminMutation(request);
    if (unauthorized) return unauthorized;

    const parsed = await readBoundedJson(request, { maxBytes: 4096, allowedKeys: ['currentPassword', 'newPassword'] });
    if (!parsed.ok) return parsed.response;
    const { currentPassword, newPassword } = parsed.value;

    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || currentPassword.length > 200 || newPassword.length > 200) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Validate new password strength
    if (newPassword.length < 12) {
      return NextResponse.json(
        { error: 'New password must be between 12 and 200 characters long' },
        { status: 400 }
      );
    }
    if (newPassword === currentPassword) return NextResponse.json({ error: 'Choose a different password.' }, { status: 400 });

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
    const saltRounds = 12;
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

    const response = NextResponse.json({
      success: true,
      message: 'Password changed successfully! Please log in with your new password.',
    });
    clearAdminSession(response);
    return response;
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'An error occurred while changing password' },
      { status: 500 }
    );
  }
}
