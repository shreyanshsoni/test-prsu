import { NextRequest, NextResponse } from 'next/server';
import { getAuth0 } from '../../../../../lib/auth0';
import { sql } from '@vercel/postgres';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/roadmap-planners/[id]/phases
 * Add a new phase to a roadmap
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: roadmapId } = params;
    const auth0 = getAuth0(req);
    const session = await auth0.getSession(req);
    const userId = session?.user.sub;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if the roadmap exists and belongs to the user
    const { rows: roadmapRows } = await sql`
      SELECT * FROM roadmap_planners 
      WHERE id = ${roadmapId} AND user_id = ${userId}
    `;
    
    if (roadmapRows.length === 0) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }
    
    // Get phase data from request
    const { title, description, reflection } = await req.json();
    
    if (!title) {
      return NextResponse.json({ error: 'Phase title is required' }, { status: 400 });
    }
    
    // Get current number of phases to determine position
    const { rows: countRows } = await sql`
      SELECT COUNT(*) as count FROM roadmap_phases
      WHERE roadmap_id = ${roadmapId}
    `;
    
    const position = parseInt(countRows[0].count) || 0;
    const phaseId = `phase-${uuidv4()}`;
    
    // Insert the new phase
    await sql`
      INSERT INTO roadmap_phases (
        id, roadmap_id, title, description, position, reflection, created_at
      ) VALUES (
        ${phaseId}, ${roadmapId}, ${title}, ${description || ''}, ${position}, ${reflection || ''}, ${new Date()}
      )
    `;
    
    // Update roadmap's last_modified timestamp
    await sql`
      UPDATE roadmap_planners 
      SET last_modified = ${new Date()}
      WHERE id = ${roadmapId}
    `;
    
    // Return the created phase
    const phase = {
      id: phaseId,
      title,
      description: description || '',
      reflection: reflection || '',
      tasks: []
    };
    
    return NextResponse.json({ phase });
  } catch (error) {
    console.error(`Error adding phase to roadmap ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 