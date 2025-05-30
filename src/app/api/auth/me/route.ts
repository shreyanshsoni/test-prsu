import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';

// Explicitly disable edge runtime for Auth0 compatibility
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // Get session data from Auth0
    const session = await getSession();
    
    // If no session is found, return 401 Unauthorized
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

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