import { getSession } from '@auth0/nextjs-auth0/edge';
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../../lib/db';

export async function GET(req: NextRequest) {
  try {
    // Get session data from Auth0 (v3.7.0 requires passing the request)
    const session = await getSession(req);
    
    // If no session is found, return 401 Unauthorized
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = session.user;
    const userId = user.sub;

    // Derive display name using the same logic as the main student view UI
    const displayName = user.sub?.includes('auth0') 
      ? (user.nickname || user.name || user.email || 'User')
      : (user.name?.split(' ')[0] || 'User');

    // Ensure a user_profiles row exists and keep display_name in sync
    // Note: profile_data remains untouched here
    await executeQuery(
      `
      INSERT INTO user_profiles (user_id, profile_data, display_name)
      VALUES ($1, $2::jsonb, $3)
      ON CONFLICT (user_id)
      DO UPDATE SET display_name = EXCLUDED.display_name, updated_at = NOW()
      `,
      [userId, JSON.stringify({}), displayName]
    );

    // Return user data
    return NextResponse.json({
      user: session.user,
      isAuthenticated: true
    });
  } catch (error: any) {
    console.error('Error in /api/auth/me route:', error);
    
    // Return proper error response
    return NextResponse.json(
      { 
        error: 'Failed to fetch user profile', 
        details: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 