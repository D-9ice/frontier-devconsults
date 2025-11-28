import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Fallback password from environment variable
const FALLBACK_PASSWORD = process.env.ADMIN_PASSWORD || 'FrontierAdmin2024!';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    console.log('Login attempt - Password provided:', password ? 'Yes' : 'No');

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    let isValid = false;

    // Try Supabase first
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('admin_credentials')
          .select('password_hash')
          .eq('username', 'admin')
          .single();

        if (!error && data && data.password_hash !== 'placeholder') {
          // Compare with hashed password from Supabase
          isValid = await bcrypt.compare(password, data.password_hash);
          console.log('Checked Supabase password:', isValid ? 'Valid' : 'Invalid');
        } else {
          console.log('No valid password in Supabase, falling back to env variable');
          isValid = password === FALLBACK_PASSWORD;
        }
      } catch (err) {
        console.error('Supabase password check error:', err);
        // Fallback to environment variable
        isValid = password === FALLBACK_PASSWORD;
      }
    } else {
      // Supabase not configured, use environment variable
      console.log('Supabase not configured, using environment variable');
      isValid = password === FALLBACK_PASSWORD;
    }

    if (isValid) {
      console.log('Login successful');
      // Generate a simple token (in production, use JWT)
      const token = Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64');

      return NextResponse.json({
        success: true,
        token,
        message: 'Login successful',
      });
    } else {
      console.log('Login failed - incorrect password');
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
