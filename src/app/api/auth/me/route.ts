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
    let userRole = 'student'; // Default role
    
    try {
      const existingUser = await executeQuery(
        'SELECT user_role FROM user_profiles WHERE user_id = $1',
        [userId]
      );
      
      // If user doesn't exist, create them with 'student' role
      // If user exists but has no role, assign 'student' role
      if (existingUser.length === 0) {
        // New user - create with student role
        // Note: verification_status will default to 'pending' per schema, but that's OK
        // We check for institute_id in the approval flow, not verification_status
        try {
          await executeQuery(
            `
            INSERT INTO user_profiles (user_id, profile_data, display_name, user_role)
            VALUES ($1, $2::jsonb, $3, 'student')
            `,
            [userId, JSON.stringify({}), displayName]
          );
        } catch (insertError: any) {
          // If insert fails (e.g., race condition), try to fetch the user again
          console.warn('Insert failed, checking if user was created:', insertError.message);
          const retryUser = await executeQuery(
            'SELECT user_role FROM user_profiles WHERE user_id = $1',
            [userId]
          );
          if (retryUser.length > 0) {
            userRole = retryUser[0].user_role || 'student';
          }
          // If still no user, we'll use default 'student' role
        }
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
        userRole = 'student';
      } else {
        // User exists with role - just update display_name and use existing role
        userRole = existingUser[0].user_role;
        try {
          await executeQuery(
            `
            UPDATE user_profiles 
            SET display_name = $2, updated_at = NOW()
            WHERE user_id = $1
            `,
            [userId, displayName]
          );
        } catch (updateError) {
          // Non-critical error - display_name update failed, but we can continue
          console.warn('Failed to update display_name:', updateError);
        }
      }
    } catch (dbError: any) {
      // Database error - log it but don't fail the entire request
      // Return the Auth0 user data with default 'student' role so the app can continue
      console.error('Database error in /api/auth/me (non-fatal):', dbError);
      // Continue with default 'student' role
    }
    
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