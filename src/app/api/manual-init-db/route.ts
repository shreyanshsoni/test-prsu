import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Set runtime to Node.js for PostgreSQL support
export const runtime = 'nodejs';

// This route initializes the database tables directly using SQL
export async function GET(request: NextRequest) {
  try {
    console.log('Starting manual database initialization');
    
    // Create the user_profiles table
    await sql.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        profile_data JSONB NOT NULL DEFAULT '{}'::jsonb
      )
    `);
    console.log('Created user_profiles table');
    
    // Create the index
    await sql.query(`
      CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id)
    `);
    console.log('Created index on user_profiles');
    
    // Create the function for updating timestamps
    await sql.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    console.log('Created update_updated_at_column function');
    
    // Drop the trigger if it exists to avoid errors
    try {
      await sql.query(`
        DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles
      `);
      console.log('Dropped existing trigger (if any)');
    } catch (triggerError) {
      console.log('No existing trigger to drop');
    }
    
    // Create the trigger
    await sql.query(`
      CREATE TRIGGER update_user_profiles_updated_at
      BEFORE UPDATE ON user_profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    `);
    console.log('Created trigger for automatic timestamp updates');
    
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