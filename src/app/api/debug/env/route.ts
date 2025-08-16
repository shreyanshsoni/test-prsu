import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Only allow in development or with a secret key
  const authHeader = req.headers.get('authorization');
  const isAuthorized = process.env.NODE_ENV === 'development' || 
                      authHeader === `Bearer ${process.env.DEBUG_SECRET}`;

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check Auth0 environment variables
  const auth0Vars = {
    AUTH0_SECRET: process.env.AUTH0_SECRET ? 'SET' : 'MISSING',
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID ? 'SET' : 'MISSING',
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET ? 'SET' : 'MISSING',
    AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL ? 'SET' : 'MISSING',
    AUTH0_BASE_URL: process.env.AUTH0_BASE_URL ? 'SET' : 'MISSING',
    AUTH0_LOGOUT_URL: process.env.AUTH0_LOGOUT_URL ? 'SET' : 'MISSING',
  };

  // Check other environment variables
  const otherVars = {
    NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
    POSTGRES_URL: process.env.POSTGRES_URL ? 'SET' : 'MISSING',
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? 'SET' : 'MISSING',
  };

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    auth0: auth0Vars,
    other: otherVars,
    message: 'Environment variables status check'
  });
}
