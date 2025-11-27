import { NextRequest, NextResponse } from 'next/server';

const CURRENT_PASSWORD = process.env.ADMIN_PASSWORD || 'FrontierAdmin2024!';

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

    // Verify current password
    if (currentPassword !== CURRENT_PASSWORD) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // In a production environment, you would:
    // 1. Hash the new password with bcrypt
    // 2. Store it in a database
    // 3. Update the environment variable programmatically (not recommended)
    // 4. Use a proper authentication system like NextAuth.js

    console.log('⚠️ PASSWORD CHANGE REQUESTED');
    console.log('New password:', newPassword);
    console.log('To apply this change:');
    console.log('1. Update ADMIN_PASSWORD in Vercel environment variables');
    console.log('2. Or update .env.local file for local development');
    console.log('3. Redeploy the application');

    return NextResponse.json({
      success: true,
      message: 'Password change request received. Please update the ADMIN_PASSWORD environment variable in your deployment settings.',
      newPassword: newPassword,
    });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'An error occurred while changing password' },
      { status: 500 }
    );
  }
}
