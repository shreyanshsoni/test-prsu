import { NextResponse } from 'next/server';
import pool from '../../lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Try to connect to the database
    const client = await pool.connect();
    console.log('Successfully connected to database');
    
    try {
      // Try a simple query that should work regardless of schema
      const result = await client.query('SELECT NOW() as current_time');
      console.log('Database query successful');
      
      // List available tables
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      const tables = tablesResult.rows.map(row => row.table_name);
      
      // Check if opportunities table exists and count rows
      let opportunitiesCount = 0;
      if (tables.includes('opportunities')) {
        const countResult = await client.query('SELECT COUNT(*) FROM opportunities');
        opportunitiesCount = parseInt(countResult.rows[0].count);
      }
      
      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        currentTime: result.rows[0].current_time,
        tables,
        opportunitiesTable: {
          exists: tables.includes('opportunities'),
          recordCount: opportunitiesCount
        }
      });
    } catch (queryError) {
      console.error('Database query error:', queryError);
      return NextResponse.json({
        success: false,
        message: 'Database connection successful but query failed',
        error: queryError.message
      }, { status: 500 });
    } finally {
      // Always release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      connectionString: process.env.DATABASE_URL ? 'Present but not shown for security' : 'Missing'
    }, { status: 500 });
  }
} 