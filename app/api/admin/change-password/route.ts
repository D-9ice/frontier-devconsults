import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const FALLBACK_PASSWORD = process.env.ADMIN_PASSWORD || 'FrontierAdmin2024!';

export async function POST(request: NextRequest) {
  try {
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

    // Verify current password (check Supabase first, then fallback)
    let isCurrentPasswordValid = false;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('admin_credentials')
          .select('password_hash')
          .eq('username', 'admin')
          .single();

        if (!error && data && data.password_hash !== 'placeholder') {
          isCurrentPasswordValid = await bcrypt.compare(currentPassword, data.password_hash);
        } else {
          // Fallback to environment variable
          isCurrentPasswordValid = currentPassword === FALLBACK_PASSWORD;
        }
      } catch (err) {
        console.error('Error checking current password:', err);
        isCurrentPasswordValid = currentPassword === FALLBACK_PASSWORD;
      }
    } else {
      isCurrentPasswordValid = currentPassword === FALLBACK_PASSWORD;
    }

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Save to Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('admin_credentials')
          .upsert({
            username: 'admin',
            password_hash: hashedPassword,
            last_changed: new Date().toISOString(),
          }, {
            onConflict: 'username'
          });

        if (error) {
          console.error('Error saving password to Supabase:', error);
          return NextResponse.json(
            { error: 'Failed to save new password. Please try again.' },
            { status: 500 }
          );
        }

        console.log('✅ Password changed successfully in Supabase');

        return NextResponse.json({
          success: true,
          message: 'Password changed successfully! Please log in with your new password.',
        });
      } catch (err) {
        console.error('Supabase password update error:', err);
        return NextResponse.json(
          { error: 'Database error. Please try again.' },
          { status: 500 }
        );
      }
    } else {
      // Supabase not configured
      console.log('⚠️ Supabase not configured. Password not saved.');
      console.log('New password (hashed):', hashedPassword);
      console.log('To enable password changes:');
      console.log('1. Configure Supabase credentials');
      console.log('2. Create admin_credentials table');
      console.log('3. Redeploy the application');

      return NextResponse.json({
        success: false,
        message: 'Supabase is not configured. Password changes require database connection.',
      }, { status: 503 });
    }
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'An error occurred while changing password' },
      { status: 500 }
    );
  }
}
