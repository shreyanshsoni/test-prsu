#!/usr/bin/env node

/**
 * Database Migration Script
 * Adds user role management to the existing database
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database migration...');
    
    // Check if user_role column already exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_profiles' 
      AND column_name = 'user_role'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ user_role column already exists, skipping...');
    } else {
      // Add user_role column
      console.log('📝 Adding user_role column...');
      await client.query(`
        ALTER TABLE user_profiles 
        ADD COLUMN user_role VARCHAR(20) CHECK (user_role IN ('student', 'counselor', 'admin'))
      `);
      console.log('✅ user_role column added');
    }
    
    // Add index for role-based queries
    console.log('📝 Adding role index...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(user_role)
    `);
    console.log('✅ Role index added');
    
    // Update existing users to have 'student' role by default
    console.log('📝 Updating existing users to student role...');
    const updateResult = await client.query(`
      UPDATE user_profiles 
      SET user_role = 'student' 
      WHERE user_role IS NULL
    `);
    console.log(`✅ Updated ${updateResult.rowCount} users to student role`);
    
    // Create counselor-student assignments table
    console.log('📝 Creating counselor_student_assignments table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS counselor_student_assignments (
        id SERIAL PRIMARY KEY,
        counselor_user_id TEXT NOT NULL,
        student_user_id TEXT NOT NULL,
        assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        
        CONSTRAINT unique_counselor_student UNIQUE (counselor_user_id, student_user_id)
      )
    `);
    console.log('✅ counselor_student_assignments table created');
    
    // Add indexes for counselor assignments
    console.log('📝 Adding counselor assignment indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_counselor_assignments_counselor ON counselor_student_assignments(counselor_user_id);
      CREATE INDEX IF NOT EXISTS idx_counselor_assignments_student ON counselor_student_assignments(student_user_id);
      CREATE INDEX IF NOT EXISTS idx_counselor_assignments_active ON counselor_student_assignments(is_active);
    `);
    console.log('✅ Counselor assignment indexes added');
    
    // Create counselor assessments table
    console.log('📝 Creating counselor_assessments table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS counselor_assessments (
        id SERIAL PRIMARY KEY,
        student_user_id TEXT NOT NULL,
        counselor_user_id TEXT NOT NULL,
        assessment_session_id TEXT NOT NULL,
        
        -- Assessment Results (System-Generated Only)
        assessment_data JSONB NOT NULL,
        calculated_scores JSONB NOT NULL,
        
        -- PRSU Matrix Scores (System-Calculated)
        matrix_scores JSONB NOT NULL,
        readiness_zones JSONB NOT NULL,
        overall_stage VARCHAR(20) NOT NULL CHECK (overall_stage IN ('Early', 'Mid', 'Late', 'Insufficient Data')),
        
        -- Scoring Details
        total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 1200),
        area_scores JSONB NOT NULL,
        
        -- Metadata
        assessment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        -- Constraints
        CONSTRAINT unique_assessment_session UNIQUE (student_user_id, assessment_session_id),
        CONSTRAINT valid_matrix_scores CHECK (
          jsonb_typeof(matrix_scores) = 'object' AND
          matrix_scores ? 'clarity' AND matrix_scores ? 'engagement' AND
          matrix_scores ? 'preparation' AND matrix_scores ? 'support'
        )
      )
    `);
    console.log('✅ counselor_assessments table created');
    
    // Add indexes for counselor assessments
    console.log('📝 Adding counselor assessment indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_counselor_assessments_student ON counselor_assessments(student_user_id);
      CREATE INDEX IF NOT EXISTS idx_counselor_assessments_counselor ON counselor_assessments(counselor_user_id);
      CREATE INDEX IF NOT EXISTS idx_counselor_assessments_date ON counselor_assessments(assessment_date);
      CREATE INDEX IF NOT EXISTS idx_counselor_assessments_stage ON counselor_assessments(overall_stage);
    `);
    console.log('✅ Counselor assessment indexes added');
    
    // Add comments for documentation
    console.log('📝 Adding table comments...');
    await client.query(`
      COMMENT ON COLUMN user_profiles.user_role IS 'User role: student, counselor, or admin';
      COMMENT ON TABLE counselor_student_assignments IS 'Tracks which students are assigned to which counselors';
      COMMENT ON TABLE counselor_assessments IS 'Stores system-generated assessment data for counselor review';
    `);
    console.log('✅ Table comments added');
    
    console.log('🎉 Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('✅ Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };
