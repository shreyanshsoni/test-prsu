import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import { sql } from '@vercel/postgres';
import { v4 as uuidv4 } from 'uuid';

// Helper function to ensure tables exist
async function ensureTablesExist() {
  try {
    // Check if programs table exists
    const { rows: programsTable } = await sql`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = 'programs'
    `;

    if (programsTable.length === 0) {
      console.log('Creating programs table...');
      
      // Create programs table
      await sql`
        CREATE TABLE IF NOT EXISTS programs (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          organization TEXT NOT NULL,
          description TEXT,
          deadline TEXT,
          location TEXT,
          type TEXT,
          image_url TEXT,
          eligibility TEXT,
          stipend TEXT,
          field TEXT,
          degree_level TEXT,
          requirements TEXT,
          start_date TEXT
        )
      `;
    }

    // Check if academic_roadmaps table exists
    const { rows: tables } = await sql`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = 'academic_roadmaps'
    `;

    if (tables.length === 0) {
      console.log('Creating academic_roadmaps and roadmap_programs tables...');
      
      // Create academic_roadmaps table
      await sql`
        CREATE TABLE IF NOT EXISTS academic_roadmaps (
          roadmap_id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          roadmap_name TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Create roadmap_programs mapping table
      await sql`
        CREATE TABLE IF NOT EXISTS roadmap_programs (
          id TEXT PRIMARY KEY,
          roadmap_id TEXT NOT NULL REFERENCES academic_roadmaps(roadmap_id) ON DELETE CASCADE,
          program_id TEXT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
          UNIQUE (roadmap_id, program_id)
        )
      `;

      // Create indexes for better performance
      await sql`CREATE INDEX IF NOT EXISTS idx_roadmap_programs_roadmap_id ON roadmap_programs(roadmap_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_roadmap_programs_program_id ON roadmap_programs(program_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_academic_roadmaps_user_id ON academic_roadmaps(user_id)`;
    }
  } catch (error) {
    console.error('Error ensuring tables exist:', error);
  }
}

// GET handler - fetch all programs in a roadmap
export async function GET(
  req: NextRequest,
  { params }: { params: { roadmapId: string } }
) {
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
    const roadmapId = params.roadmapId;

    // Verify the roadmap belongs to the user
    const { rows: roadmaps } = await sql`
      SELECT roadmap_id 
      FROM academic_roadmaps
      WHERE roadmap_id = ${roadmapId} AND user_id = ${userId}
    `;

    if (roadmaps.length === 0) {
      return NextResponse.json(
        { error: "Roadmap not found or you don't have permission to access it" },
        { status: 404 }
      );
    }

    // Fetch programs in the roadmap
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
      WHERE rp.roadmap_id = ${roadmapId}
      ORDER BY p.title
    `;

    return NextResponse.json({ programs });
  } catch (error) {
    console.error('Error fetching roadmap programs:', error);
    return NextResponse.json(
      { error: "Failed to fetch roadmap programs" },
      { status: 500 }
    );
  }
}

// POST handler - add a program to a roadmap
export async function POST(
  req: NextRequest,
  { params }: { params: { roadmapId: string } }
) {
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
    const roadmapId = params.roadmapId;
    
    console.log('Adding program to roadmap:', roadmapId, 'for user:', userId);
    
    try {
      const body = await req.json();
      const programId = body.programId;
      const programData = body.programData;
      
      console.log('Program ID to add:', programId);

      // Validate input
      if (!programId) {
        return NextResponse.json(
          { error: "Program ID is required" },
          { status: 400 }
        );
      }

      // Verify the roadmap belongs to the user
      const { rows: roadmaps } = await sql`
        SELECT roadmap_id 
        FROM academic_roadmaps
        WHERE roadmap_id = ${roadmapId} AND user_id = ${userId}
      `;

      if (roadmaps.length === 0) {
        return NextResponse.json(
          { error: "Roadmap not found or you don't have permission to modify it" },
          { status: 404 }
        );
      }

      // Check if program exists
      const { rows: programs } = await sql`
        SELECT id 
        FROM programs
        WHERE id = ${programId}
      `;

      if (programs.length === 0 && programData) {
        // Program doesn't exist - create it with complete data
        console.log(`Program ${programId} not found in database, creating with complete data`);
        
        try {
          await sql`
            INSERT INTO programs (
              id, 
              title, 
              organization, 
              description, 
              deadline, 
              location, 
              type, 
              image_url, 
              eligibility, 
              stipend, 
              field, 
              degree_level, 
              requirements, 
              start_date
            ) VALUES (
              ${programId},
              ${programData.title || 'Untitled Program'},
              ${programData.organization || 'Unknown Organization'},
              ${programData.description || ''},
              ${programData.deadline || null},
              ${programData.location || ''},
              ${programData.type || ''},
              ${programData.imageUrl || ''},
              ${Array.isArray(programData.eligibility) ? programData.eligibility.join(', ') : (programData.eligibility || '')},
              ${programData.stipend || ''},
              ${programData.field || ''},
              ${programData.degreeLevel || ''},
              ${Array.isArray(programData.requirements) ? programData.requirements.join(', ') : (programData.requirements || '')},
              ${programData.startDate || null}
            )
          `;
          console.log('Created program with complete data');
        } catch (err) {
          console.error('Error creating program with complete data:', err);
          
          // If this fails, fall back to creating minimal program
          try {
            await sql`
              INSERT INTO programs (id, title, organization)
              VALUES (${programId}, ${programData?.title || 'Untitled Program'}, ${programData?.organization || 'Unknown Organization'})
            `;
            console.log('Created program with minimal data');
          } catch (minErr) {
            console.error('Error creating minimal program:', minErr);
            // Continue anyway to add the mapping
          }
        }
      } else if (programs.length === 0) {
        // No program data available, create minimal placeholder
        console.log(`Program ${programId} not found and no data provided, creating minimal placeholder`);
        
        try {
          await sql`
            INSERT INTO programs (id, title, organization)
            VALUES (${programId}, 'Untitled Program', 'Unknown Organization')
          `;
          console.log('Created minimal placeholder program');
        } catch (err) {
          console.error('Error creating minimal placeholder program:', err);
          // Continue anyway to add the mapping
        }
      }

      // Check if the program is already in the roadmap
      const { rows: existingMappings } = await sql`
        SELECT id 
        FROM roadmap_programs
        WHERE roadmap_id = ${roadmapId} AND program_id = ${programId}
      `;

      if (existingMappings.length > 0) {
        return NextResponse.json(
          { error: "Program is already in this roadmap" },
          { status: 400 }
        );
      }

      // Add the program to the roadmap
      const mappingId = uuidv4();
      
      try {
        await sql`
          INSERT INTO roadmap_programs (id, roadmap_id, program_id)
          VALUES (${mappingId}, ${roadmapId}, ${programId})
        `;
        
        console.log('Program added successfully to roadmap with mapping ID:', mappingId);
        
        return NextResponse.json({
          id: mappingId,
          roadmapId,
          programId
        }, { status: 201 });
      } catch (insertErr) {
        console.error('Error inserting roadmap-program mapping:', insertErr);
        return NextResponse.json(
          { error: "Database error inserting mapping: " + insertErr.message },
          { status: 500 }
        );
      }
    } catch (err) {
      console.error('Error in POST handler logic:', err);
      return NextResponse.json(
        { error: "Error processing request: " + err.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unhandled error adding program to roadmap:', error);
    return NextResponse.json(
      { error: "Failed to add program to roadmap: " + error.message },
      { status: 500 }
    );
  }
} 