import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';
import { sql } from '@vercel/postgres';

/**
 * PUT /api/roadmap-planners/[id]/phases/[phaseId]/reflection
 * Update a phase's reflection
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; phaseId: string } }
) {
  try {
    const { id: roadmapId, phaseId } = params;
    const session = await getSession(req);
    const userId = session?.user.sub;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get reflection from request
    const { reflection } = await req.json();
    
    // Check if the phase exists and belongs to the user
    const { rows: phaseRows } = await sql`
      SELECT rp.* 
      FROM roadmap_phases rp
      JOIN roadmap_planners r ON r.id = rp.roadmap_id
      WHERE rp.id = ${phaseId} 
      AND rp.roadmap_id = ${roadmapId}
      AND r.user_id = ${userId}
    `;
    
    if (phaseRows.length === 0) {
      return NextResponse.json({ error: 'Phase not found' }, { status: 404 });
    }
    
    // Update the reflection
    await sql`
      UPDATE roadmap_phases 
      SET reflection = ${reflection}
      WHERE id = ${phaseId}
      AND roadmap_id = ${roadmapId}
    `;
    
    // Update roadmap's last_modified timestamp
    await sql`
      UPDATE roadmap_planners 
      SET last_modified = ${new Date()}
      WHERE id = ${roadmapId}
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error updating phase reflection ${params.phaseId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 