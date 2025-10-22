import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '../../../lib/db';

// Set runtime to Node.js for PostgreSQL support
export const runtime = 'nodejs';

// This route initializes the database tables
export async function GET(request: NextRequest) {
  try {
    // Only allow in development mode or with admin token
    const isDevMode = process.env.NODE_ENV === 'development';
    const adminToken = process.env.DB_INIT_TOKEN;
    const requestToken = request.nextUrl.searchParams.get('token');
    
    if (!isDevMode && (!adminToken || adminToken !== requestToken)) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }
    
    await initializeDatabase();
    
    return NextResponse.json(
      { success: true, message: 'Database initialized successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return NextResponse.json(
      { error: 'Database initialization failed', details: String(error) },
      { status: 500 }
    );
  }
} 
