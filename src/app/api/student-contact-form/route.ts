import { NextRequest, NextResponse } from 'next/server';
import { getAuth0 } from '../../../lib/auth0';
import { executeQuery, getClientWithRetry } from '../../../lib/db';

// Initialize table on first request
let tableInitialized = false;

async function ensureTableExists() {
  if (!tableInitialized) {
    try {
      const client = await getClientWithRetry();
      try {
        // Create student_contact_form table
        await client.query(`
          CREATE TABLE IF NOT EXISTS student_contact_forms (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            school_name VARCHAR(255) NOT NULL,
            institute_id INTEGER REFERENCES institute_list(institute_id),
            country_code VARCHAR(10),
            phone VARCHAR(50),
            message TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);
        
        // Add institute_id column if it doesn't exist (for existing tables)
        await client.query(`
          ALTER TABLE student_contact_forms
          ADD COLUMN IF NOT EXISTS institute_id INTEGER REFERENCES institute_list(institute_id);
        `);

        // Create indexes
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_student_contact_forms_email ON student_contact_forms(email);
          CREATE INDEX IF NOT EXISTS idx_student_contact_forms_school_name ON student_contact_forms(school_name);
          CREATE INDEX IF NOT EXISTS idx_student_contact_forms_institute_id ON student_contact_forms(institute_id);
          CREATE INDEX IF NOT EXISTS idx_student_contact_forms_created_at ON student_contact_forms(created_at);
        `);

        // Create update trigger function if it doesn't exist
        await client.query(`
          CREATE OR REPLACE FUNCTION update_updated_at_column()
          RETURNS TRIGGER AS $$
          BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
        `);

        // Create trigger for updated_at
        await client.query(`
          DROP TRIGGER IF EXISTS update_student_contact_forms_updated_at ON student_contact_forms;
          CREATE TRIGGER update_student_contact_forms_updated_at
          BEFORE UPDATE ON student_contact_forms
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
        `);

        console.log('Student contact forms table initialized successfully');
        tableInitialized = true;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error initializing student_contact_forms table:', error);
      // Don't throw, allow the request to continue
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure table exists
    await ensureTableExists();

    // Get the authenticated user session
    const auth0 = getAuth0(request);
    const session = await auth0.getSession(request);
    let instituteId: number | null = null;

    // If user is authenticated, get their institute_id
    if (session && session.user) {
      const userId = session.user.sub;
      const userProfile = await executeQuery(
        'SELECT institute_id FROM user_profiles WHERE user_id = $1',
        [userId]
      );
      
      if (userProfile.length > 0 && userProfile[0].institute_id) {
        instituteId = userProfile[0].institute_id;
      }
    }

    // Parse request body
    const body = await request.json();
    const { name, email, schoolName, countryCode, phone, message } = body;

    // Validate required fields
    if (!name || !email || !schoolName) {
      return NextResponse.json(
        { error: 'Name, email, and school name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Insert into database
    const query = `
      INSERT INTO student_contact_forms (name, email, school_name, institute_id, country_code, phone, message)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, email, school_name, institute_id, country_code, phone, message, created_at;
    `;

    const result = await executeQuery(query, [
      name.trim(),
      email.trim().toLowerCase(),
      schoolName.trim(),
      instituteId,
      countryCode || null,
      phone || null,
      message || null
    ]);

    if (result.length === 0) {
      throw new Error('Failed to insert contact form submission');
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Form submitted successfully',
        data: result[0]
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting contact form:', error);
    
    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes('DATABASE_URL')) {
      return NextResponse.json(
        {
          error: 'Database configuration error',
          details: 'Please check your database connection settings'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to submit form',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
