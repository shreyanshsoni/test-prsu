import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import pool, { getClientWithRetry } from '../../../lib/db';

// Initialize the database by creating the user_programs table if it doesn't exist
async function initializeDatabase() {
  let client;
  try {
    client = await getClientWithRetry();
    
    // Check if the table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_programs'
      );
    `);

    // If table doesn't exist, create it
    if (!tableCheck.rows[0].exists) {
      console.log('Creating user_programs table...');
      await client.query(`
        CREATE TABLE user_programs (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          program_id VARCHAR(255) NOT NULL,
          status VARCHAR(20) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, program_id)
        );
        
        CREATE INDEX idx_user_programs_user_id ON user_programs(user_id);
        CREATE INDEX idx_user_programs_program_id ON user_programs(program_id);
        CREATE INDEX idx_user_programs_status ON user_programs(status);
      `);
      console.log('Table created successfully!');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    if (client) client.release();
  }
}

// Initialize the database when this module is loaded
initializeDatabase().catch(console.error);

// GET user's saved programs
export async function GET(request: Request) {
  // Get user session from Auth0
  let client;
  try {
    const session = await getSession();
    
    // If no user is logged in, return 401
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.sub;
    console.log('Fetching saved programs for user:', userId);
    
    // Connect to the database with retry
    client = await getClientWithRetry();
    
      // First, get the user's saved program IDs
      const savedProgramsResult = await client.query(`
        SELECT program_id FROM user_programs
        WHERE user_id = $1 AND status = 'saved'
        ORDER BY created_at DESC;
      `, [userId]);
      
      if (savedProgramsResult.rows.length === 0) {
        console.log('No saved programs found for user');
        return NextResponse.json({ savedPrograms: [] });
      }
      
      // Get the program IDs
      const programIds = savedProgramsResult.rows.map(row => row.program_id);
      console.log('Found saved program IDs:', programIds);
      
      // Now fetch the full program details - convert string IDs to text for comparison
      const programsResult = await client.query(`
        SELECT * FROM opportunities 
        WHERE id::text = ANY($1::text[])
      `, [programIds]);
      
      console.log(`Found ${programsResult.rows.length} programs out of ${programIds.length} IDs`);
      
      // If we didn't find all programs in the opportunities table, get the missing ones from user_programs
      if (programsResult.rows.length < programIds.length) {
        console.log('Some programs were not found in opportunities table, creating basic entries');
        
        // Create a map of found program IDs for quick lookup
        const foundProgramIds = new Set(programsResult.rows.map(p => p.id));
        
        // Get the missing program IDs
        const missingProgramIds = programIds.filter(id => !foundProgramIds.has(id));
        console.log('Missing program IDs:', missingProgramIds);
        
        // For each missing program, create a basic program object
        const basicPrograms = missingProgramIds.map(id => ({
          id: id,
          title: `Program ${id}`,
          description: 'Program details not available',
          organization: 'Unknown',
          has_stipend: false,
          start_date: null,
          end_date: null,
          location_string: 'Unknown',
          // Add any other required fields with default values
        }));
        
        // Combine the results
        programsResult.rows = [...programsResult.rows, ...basicPrograms];
      }
      
      // Return the saved programs
      return NextResponse.json({
        savedPrograms: programsResult.rows
      });
  } catch (error) {
    console.error('Error fetching user programs:', error);
    const errorMessage = error instanceof Error 
      ? `Failed to fetch programs: ${error.message}` 
      : 'Failed to fetch programs';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  } finally {
    // Release the client back to the pool
    if (client) client.release();
  }
}

// POST to save a program
export async function POST(request: Request) {
  let client;
  try {
    // Get user session from Auth0
    const session = await getSession();
    
    // If no user is logged in, return 401
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.sub;
    
    // Parse the request body
    const { programId, status } = await request.json();
    
    if (!programId || !status) {
      return NextResponse.json(
        { error: 'Program ID and status are required' },
        { status: 400 }
      );
    }
    
    // Connect to the database with retry
    client = await getClientWithRetry();
    
      // Insert or update the user's program selection
      await client.query(`
        INSERT INTO user_programs (user_id, program_id, status)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, program_id) 
        DO UPDATE SET status = $3, updated_at = NOW();
      `, [userId, programId, status]);
      
      return NextResponse.json({
        success: true,
        message: `Program ${status === 'saved' ? 'saved' : 'rejected'} successfully`
      });
  } catch (error) {
    console.error('Error saving user program:', error);
    // More detailed error message
    const errorMessage = error instanceof Error 
      ? `Failed to save program: ${error.message}` 
      : 'Failed to save program';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  } finally {
    // Release the client back to the pool
    if (client) client.release();
  }
}

// DELETE to remove a saved program
export async function DELETE(request: Request) {
  let client;
  try {
    // Get user session from Auth0
    const session = await getSession();
    
    // If no user is logged in, return 401
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.sub;
    
    // Get program ID from the URL
    const url = new URL(request.url);
    const programId = url.searchParams.get('programId');
    
    if (!programId) {
      return NextResponse.json(
        { error: 'Program ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to the database with retry
    client = await getClientWithRetry();
    
      // Delete the user's program selection
      await client.query(`
        DELETE FROM user_programs
        WHERE user_id = $1 AND program_id = $2;
      `, [userId, programId]);
      
      return NextResponse.json({
        success: true,
        message: 'Program removed successfully'
      });
  } catch (error) {
    console.error('Error removing user program:', error);
    const errorMessage = error instanceof Error 
      ? `Failed to remove program: ${error.message}` 
      : 'Failed to remove program';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  } finally {
    // Release the client back to the pool
    if (client) client.release();
  }
} 
