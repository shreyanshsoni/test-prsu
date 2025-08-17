import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Check if all required Auth0 environment variables are present
    const auth0Vars = {
      AUTH0_SECRET: !!process.env.AUTH0_SECRET,
      AUTH0_CLIENT_ID: !!process.env.AUTH0_CLIENT_ID,
      AUTH0_CLIENT_SECRET: !!process.env.AUTH0_CLIENT_SECRET,
      AUTH0_ISSUER_BASE_URL: !!process.env.AUTH0_ISSUER_BASE_URL,
      AUTH0_BASE_URL: !!process.env.AUTH0_BASE_URL,
      AUTH0_CALLBACK_URL: !!process.env.AUTH0_CALLBACK_URL,
      AUTH0_LOGOUT_URL: !!process.env.AUTH0_LOGOUT_URL,
      NEXT_PUBLIC_AUTH0_CLIENT_ID: !!process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
      NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL: !!process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL,
      NEXT_PUBLIC_BASE_URL: !!process.env.NEXT_PUBLIC_BASE_URL,
    };

    const missingVars = Object.entries(auth0Vars)
      .filter(([key, present]) => !present)
      .map(([key]) => key);

    return NextResponse.json({
      status: 'Auth0 Configuration Debug',
      environment: process.env.NODE_ENV,
      auth0Variables: auth0Vars,
      missingVariables: missingVars,
      hasAllRequired: missingVars.length === 0,
      baseUrl: process.env.AUTH0_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL,
      callbackUrl: process.env.AUTH0_CALLBACK_URL,
      logoutUrl: process.env.AUTH0_LOGOUT_URL,
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Debug route failed', 
        message: error.message 
      },
      { status: 500 }
    );
  }
}
