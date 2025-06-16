import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import { sql } from '@vercel/postgres';

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

// DELETE handler - remove a program from a roadmap
export async function DELETE(
  req: NextRequest,
  { params }: { params: { roadmapId: string; programId: string } }
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
    const programId = params.programId;
    
    console.log(`Removing program ${programId} from roadmap ${roadmapId} for user ${userId}`);

    try {
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

      // Remove the program from the roadmap
      await sql`
        DELETE FROM roadmap_programs
        WHERE roadmap_id = ${roadmapId} AND program_id = ${programId}
      `;

      console.log('Program successfully removed from roadmap');
      return NextResponse.json({ success: true });
    } catch (err) {
      console.error('SQL error removing program:', err);
      return NextResponse.json(
        { error: "Database error: " + err.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unhandled error removing program from roadmap:', error);
    return NextResponse.json(
      { error: "Failed to remove program from roadmap: " + error.message },
      { status: 500 }
    );
  }
} 