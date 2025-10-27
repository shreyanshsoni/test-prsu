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
    // First, check if user exists and get their current role
    const existingUser = await executeQuery(
      'SELECT user_role FROM user_profiles WHERE user_id = $1',
      [userId]
    );
    
    // If user doesn't exist, create them with 'student' role
    // If user exists but has no role, assign 'student' role
    if (existingUser.length === 0) {
      // New user - create with student role
      await executeQuery(
        `
        INSERT INTO user_profiles (user_id, profile_data, display_name, user_role)
        VALUES ($1, $2::jsonb, $3, 'student')
        `,
        [userId, JSON.stringify({}), displayName]
      );
    } else if (!existingUser[0].user_role) {
      // Existing user with no role - assign student role
      await executeQuery(
        `
        UPDATE user_profiles 
        SET user_role = 'student', updated_at = NOW()
        WHERE user_id = $1
        `,
        [userId]
      );
    } else {
      // User exists with role - just update display_name
      await executeQuery(
        `
        UPDATE user_profiles 
        SET display_name = $2, updated_at = NOW()
        WHERE user_id = $1
        `,
        [userId, displayName]
      );
    }

    // Get user role after ensuring profile exists
    const userRoleResult = await executeQuery(
      'SELECT user_role FROM user_profiles WHERE user_id = $1',
      [userId]
    );
    
    const userRole = userRoleResult.length > 0 ? userRoleResult[0].user_role : 'student';
    
    // Return user data with role
    return NextResponse.json({
      user: session.user,
      isAuthenticated: true,
      role: userRole
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