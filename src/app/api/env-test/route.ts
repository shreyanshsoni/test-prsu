import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    auth0: {
      secretSet: !!process.env.AUTH0_SECRET,
      secretLength: process.env.AUTH0_SECRET?.length || 0,
      secretFirstChars: process.env.AUTH0_SECRET ? process.env.AUTH0_SECRET.substring(0, 5) + '...' : 'none',
      clientIdSet: !!process.env.AUTH0_CLIENT_ID,
      clientSecretSet: !!process.env.AUTH0_CLIENT_SECRET,
      clientSecretLength: process.env.AUTH0_CLIENT_SECRET?.length || 0,
    },
    database: {
      databaseUrlSet: !!process.env.DATABASE_URL,
      databaseUrlLength: process.env.DATABASE_URL?.length || 0,
      postgresUrlSet: !!process.env.POSTGRES_URL,
      postgresUrlLength: process.env.POSTGRES_URL?.length || 0,
    },
    api: {
      openRouterKeySet: !!process.env.OPENROUTER_API_KEY,
      openRouterKeyLength: process.env.OPENROUTER_API_KEY?.length || 0,
    },
    nodeEnv: process.env.NODE_ENV,
    nextConfig: {
      auth0SecretSet: !!process.env.AUTH0_SECRET,
      auth0SecretLength: process.env.AUTH0_SECRET?.length || 0,
    },
    allEnvKeys: Object.keys(process.env).filter(key => 
      !key.includes('SECRET') && 
      !key.includes('PASSWORD') && 
      !key.includes('KEY') &&
      !key.includes('TOKEN')
    ),
  }, { status: 200 });
} 