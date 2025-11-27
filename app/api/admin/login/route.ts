import { NextRequest, NextResponse } from 'next/server';

// IMPORTANT: Change this password in production!
// Better yet, use environment variables and proper hashing
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'FrontierAdmin2024!';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    console.log('Login attempt - Password provided:', password ? 'Yes' : 'No');
    console.log('Expected password:', ADMIN_PASSWORD);

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Simple password check (in production, use bcrypt or similar)
    if (password === ADMIN_PASSWORD) {
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
