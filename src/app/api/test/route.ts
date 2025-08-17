import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({ 
      message: 'API is working',
      timestamp: new Date().toISOString(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        AUTH0_SECRET: process.env.AUTH0_SECRET ? 'SET' : 'MISSING',
        AUTH0_BASE_URL: process.env.AUTH0_BASE_URL,
      }
    });
  } catch (error) {
    console.error('Test API Error:', error);
    return NextResponse.json({ 
      error: 'API Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
