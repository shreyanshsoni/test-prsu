import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import { sql } from '@vercel/postgres';
import { v4 as uuidv4 } from 'uuid';

// Helper function to ensure tables exist
async function ensureTablesExist() {
  try {
    console.log('Checking database tables...');
    
    // Check if the tables exist
    const { rows: tables } = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('programs', 'academic_roadmaps', 'roadmap_programs')
    `;
    
    const tableNames = tables.map(t => t.tablename);
    console.log('Existing tables:', tableNames);
    
    // Create tables in the correct order without circular dependencies
    if (!tableNames.includes('programs')) {
      console.log('Creating programs table...');
      await sql`
        CREATE TABLE IF NOT EXISTS programs (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL DEFAULT 'Untitled Program',
          organization TEXT NOT NULL DEFAULT 'Unknown Organization',
          description TEXT DEFAULT '',
          deadline TEXT,
          location TEXT DEFAULT '',
          type TEXT DEFAULT '',
          image_url TEXT DEFAULT '',
          eligibility TEXT DEFAULT '',
          stipend TEXT DEFAULT '',
          field TEXT DEFAULT '',
          degree_level TEXT DEFAULT '',
          requirements TEXT DEFAULT '',
          start_date TEXT
        )
      `;
    }
    
    if (!tableNames.includes('academic_roadmaps')) {
      console.log('Creating academic_roadmaps table...');
      await sql`
        CREATE TABLE IF NOT EXISTS academic_roadmaps (
          roadmap_id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          roadmap_name TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;
    }
    
    if (!tableNames.includes('roadmap_programs')) {
      console.log('Creating roadmap_programs table...');
      await sql`
        CREATE TABLE IF NOT EXISTS roadmap_programs (
          id TEXT PRIMARY KEY,
          roadmap_id TEXT NOT NULL,
          program_id TEXT NOT NULL,
          UNIQUE (roadmap_id, program_id)
        )
      `;
    }
    
    // Create indexes for better performance
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_roadmap_programs_roadmap_id ON roadmap_programs(roadmap_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_roadmap_programs_program_id ON roadmap_programs(program_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_academic_roadmaps_user_id ON academic_roadmaps(user_id)`;
    } catch (err) {
      console.warn('Error creating indexes, might already exist:', err);
    }
  } catch (error) {
    console.error('Error ensuring tables exist:', error);
  }
}

// GET handler - fetch all roadmaps for the current user
export async function GET(req: NextRequest) {
  try {
    // Ensure database tables exist
    await ensureTablesExist();
    
    const session = await getSession();
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const userId = session.user.sub;
    console.log('Fetching roadmaps for user:', userId);

    try {
      // Fetch roadmaps from database
      const { rows: roadmaps } = await sql`
        SELECT r.roadmap_id as id, r.roadmap_name as name, r.user_id, r.created_at
        FROM academic_roadmaps r
        WHERE r.user_id = ${userId}
        ORDER BY r.created_at DESC
      `;
      
      console.log('Found roadmaps:', roadmaps.length);

      // Fetch programs for each roadmap
      const roadmapsWithPrograms = await Promise.all(
        roadmaps.map(async (roadmap) => {
          try {
            // Use a more comprehensive SELECT statement to get all program fields
            const { rows: programs } = await sql`
              SELECT 
                p.id, 
                p.title, 
                p.organization, 
                p.description, 
                p.deadline, 
                p.location, 
                p.type, 
                p.image_url AS "imageUrl", 
                p.eligibility, 
                p.stipend, 
                p.field, 
                p.degree_level AS "degreeLevel", 
                p.requirements, 
                p.start_date AS "startDate"
              FROM programs p
              JOIN roadmap_programs rp ON p.id = rp.program_id
              WHERE rp.roadmap_id = ${roadmap.id}
              ORDER BY p.title
            `;
            
            return {
              ...roadmap,
              programs: programs || [],
            };
          } catch (err) {
            console.error('Error fetching programs for roadmap:', roadmap.id, err);
            return {
              ...roadmap,
              programs: [],
            };
          }
        })
      );

      return NextResponse.json({ roadmaps: roadmapsWithPrograms });
    } catch (err) {
      console.error('SQL error in GET roadmaps:', err);
      return NextResponse.json(
        { error: "Database error: " + err.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unhandled error fetching roadmaps:', error);
    return NextResponse.json(
      { error: "Failed to fetch roadmaps: " + error.message },
      { status: 500 }
    );
  }
}

// POST handler - create a new roadmap
export async function POST(req: NextRequest) {
  try {
    // Ensure database tables exist
    await ensureTablesExist();
    
    const session = await getSession();
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const userId = session.user.sub;
    
    try {
      const { name } = await req.json();
      
      // Validate input
      if (!name || typeof name !== 'string') {
        return NextResponse.json(
          { error: "Roadmap name is required" },
          { status: 400 }
        );
      }

      console.log('Creating roadmap:', name, 'for user:', userId);

      // Create new roadmap
      const roadmapId = uuidv4();
      const createdAt = new Date().toISOString();

      await sql`
        INSERT INTO academic_roadmaps (roadmap_id, user_id, roadmap_name, created_at)
        VALUES (${roadmapId}, ${userId}, ${name}, ${createdAt})
      `;

      console.log('Roadmap created successfully with ID:', roadmapId);

      // Return the created roadmap
      return NextResponse.json({
        roadmap: {
          id: roadmapId,
          name,
          userId,
          createdAt,
          programs: []
        }
      }, { status: 201 });
    } catch (err) {
      console.error('SQL error creating roadmap:', err);
      return NextResponse.json(
        { error: "Database error: " + err.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unhandled error creating roadmap:', error);
    return NextResponse.json(
      { error: "Failed to create roadmap: " + error.message },
      { status: 500 }
    );
  }
} 