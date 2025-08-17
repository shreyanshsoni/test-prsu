import { NextResponse } from 'next/server';
import { getPostgresUrl } from '../../../lib/server/env';

export async function GET() {
  try {
    const postgresUrl = getPostgresUrl();
    
    if (!postgresUrl) {
      return NextResponse.json({ 
        error: 'Database URL not configured',
        postgresUrl: 'MISSING'
      }, { status: 500 });
    }

    // Test database connection
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: postgresUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    client.release();

    return NextResponse.json({ 
      message: 'Database connection successful',
      currentTime: result.rows[0].current_time,
      postgresUrl: postgresUrl ? 'SET' : 'MISSING',
      openRouterKey: process.env.OPENROUTER_API_KEY ? 'SET' : 'MISSING'
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({ 
      error: 'Database connection failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      postgresUrl: getPostgresUrl() ? 'SET' : 'MISSING',
      openRouterKey: process.env.OPENROUTER_API_KEY ? 'SET' : 'MISSING'
    }, { status: 500 });
  }
}
