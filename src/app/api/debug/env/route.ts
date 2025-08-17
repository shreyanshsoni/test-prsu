import { NextResponse } from 'next/server';

export async function GET() {
  // Only allow in development or with a secret token
  if (process.env.NODE_ENV === 'production' && !process.env.DEBUG_TOKEN) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    AUTH0_SECRET: process.env.AUTH0_SECRET ? 'SET' : 'MISSING',
    AUTH0_BASE_URL: process.env.AUTH0_BASE_URL,
    AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID ? 'SET' : 'MISSING',
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET ? 'SET' : 'MISSING',
    AUTH0_SCOPE: process.env.AUTH0_SCOPE,
    AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
    AUTH0_ORGANIZATION: process.env.AUTH0_ORGANIZATION,
    AUTH0_LOGOUT_URL: process.env.AUTH0_LOGOUT_URL,
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
    POSTGRES_URL: process.env.POSTGRES_URL ? 'SET' : 'MISSING',
  };

  return NextResponse.json(envVars);
}
