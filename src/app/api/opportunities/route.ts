import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function GET(request: Request) {
  try {
    // Get pagination parameters from URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Connect to the database
    let client;
    try {
      client = await pool.connect();
    } catch (connectionError) {
      console.error('Database connection error:', connectionError);
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          message: 'Could not connect to the database. Please try again later.'
        },
        { status: 503 }
      );
    }
    
    try {
      // Get total count for pagination info
      const countResult = await client.query(`
        SELECT COUNT(*) FROM opportunities;
      `);
      
      const totalCount = parseInt(countResult.rows[0].count);
      
      // Query to fetch opportunities with pagination
      const result = await client.query(`
        SELECT 
          id, 
          title, 
          institute, 
          description, 
          link,
          start_date, 
          end_date, 
          location_string, 
          program_types, 
          interests,
          has_stipend,
          is_remote,
          created_at
        FROM opportunities
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2;
      `, [limit, offset]);
      
      // Return the opportunities as JSON with pagination metadata
      return NextResponse.json({
        data: result.rows,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error: any) {
      console.error('Database query error:', error);
      
      // Check if error is related to missing table
      if (error.message && error.message.includes('relation "opportunities" does not exist')) {
        return NextResponse.json(
          { error: 'Database schema issue: opportunities table does not exist' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: 'Database query failed: ' + error.message },
        { status: 500 }
      );
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunities: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
} 
