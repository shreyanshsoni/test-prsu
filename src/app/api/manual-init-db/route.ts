import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Set runtime to Node.js for PostgreSQL support
export const runtime = 'nodejs';

// This route initializes the database tables directly using SQL
export async function GET(request: NextRequest) {
  try {
    console.log('Starting manual database initialization');
    
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

    // Create institute_list table
    await sql.query(`
      CREATE TABLE IF NOT EXISTS institute_list (
        institute_id SERIAL PRIMARY KEY,
        institute_name VARCHAR(255) NOT NULL UNIQUE,
        total_students INTEGER NOT NULL DEFAULT 0,
        institute_secret_key TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created institute_list table');
    
    // Create index on institute_secret_key
    await sql.query(`
      CREATE INDEX IF NOT EXISTS idx_institute_list_secret_key ON institute_list(institute_secret_key)
    `);
    console.log('Created index on institute_list');
    
    // Create trigger for institute_list updated_at
    await sql.query(`
      DROP TRIGGER IF EXISTS update_institute_list_updated_at ON institute_list
    `);
    await sql.query(`
      CREATE TRIGGER update_institute_list_updated_at
      BEFORE UPDATE ON institute_list
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    `);
    console.log('Created trigger for institute_list automatic timestamp updates');

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

    // Add profile/institute/verification columns
    await sql.query(`
      ALTER TABLE user_profiles
      ADD COLUMN IF NOT EXISTS first_name TEXT,
      ADD COLUMN IF NOT EXISTS last_name TEXT,
      ADD COLUMN IF NOT EXISTS institute_id INTEGER REFERENCES institute_list(institute_id),
      ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS verified_by TEXT,
      ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE
    `);
    console.log('Ensured profile, institute, verification columns exist on user_profiles');
    
    await sql.query(`
      CREATE INDEX IF NOT EXISTS idx_user_profiles_institute ON user_profiles(institute_id);
      CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(verification_status);
      CREATE INDEX IF NOT EXISTS idx_user_profiles_institute_status ON user_profiles(institute_id, verification_status);
    `);
    console.log('Created institute/status indexes on user_profiles');
    
    // Create the trigger
    await sql.query(`
      DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles
    `);
    await sql.query(`
      CREATE TRIGGER update_user_profiles_updated_at
      BEFORE UPDATE ON user_profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    `);
    console.log('Created trigger for automatic timestamp updates on user_profiles');

    // Keep is_verified aligned with verification_status
    await sql.query(`
      CREATE OR REPLACE FUNCTION set_is_verified_from_status()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.is_verified = (NEW.verification_status = 'approved');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    await sql.query(`
      DROP TRIGGER IF EXISTS set_is_verified_from_status_trigger ON user_profiles
    `);
    await sql.query(`
      CREATE TRIGGER set_is_verified_from_status_trigger
      BEFORE INSERT OR UPDATE ON user_profiles
      FOR EACH ROW
      EXECUTE FUNCTION set_is_verified_from_status()
    `);
    console.log('Created trigger to align is_verified with verification_status');

    // Trigger/function to keep institute_list.total_students in sync
    await sql.query(`
      CREATE OR REPLACE FUNCTION sync_institute_student_counts()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          IF NEW.institute_id IS NOT NULL AND NEW.verification_status = 'approved' THEN
            UPDATE institute_list SET total_students = total_students + 1 WHERE institute_id = NEW.institute_id;
          END IF;
          RETURN NEW;
        ELSIF TG_OP = 'UPDATE' THEN
          IF OLD.institute_id IS NOT NULL AND OLD.verification_status = 'approved' THEN
            UPDATE institute_list SET total_students = total_students - 1 WHERE institute_id = OLD.institute_id;
          END IF;
          IF NEW.institute_id IS NOT NULL AND NEW.verification_status = 'approved' THEN
            UPDATE institute_list SET total_students = total_students + 1 WHERE institute_id = NEW.institute_id;
          END IF;
          RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
          IF OLD.institute_id IS NOT NULL AND OLD.verification_status = 'approved' THEN
            UPDATE institute_list SET total_students = total_students - 1 WHERE institute_id = OLD.institute_id;
          END IF;
          RETURN OLD;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql
    `);
    console.log('Created sync_institute_student_counts function');

    await sql.query(`
      DROP TRIGGER IF EXISTS sync_institute_student_counts_trigger ON user_profiles
    `);
    await sql.query(`
      CREATE TRIGGER sync_institute_student_counts_trigger
      AFTER INSERT OR UPDATE OR DELETE ON user_profiles
      FOR EACH ROW
      EXECUTE FUNCTION sync_institute_student_counts()
    `);
    console.log('Created sync trigger for institute student counts');

    // Counselor to institute mapping table
    await sql.query(`
      CREATE TABLE IF NOT EXISTS counselor_institutes (
        id SERIAL PRIMARY KEY,
        counselor_user_id TEXT NOT NULL,
        institute_id INTEGER NOT NULL REFERENCES institute_list(institute_id),
        is_primary BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created counselor_institutes table');

    await sql.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_counselor_institutes_unique ON counselor_institutes(counselor_user_id, institute_id);
      CREATE INDEX IF NOT EXISTS idx_counselor_institutes_institute ON counselor_institutes(institute_id);
    `);
    console.log('Created counselor_institutes indexes');
    
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
