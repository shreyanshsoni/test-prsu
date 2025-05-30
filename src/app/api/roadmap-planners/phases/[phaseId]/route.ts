import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { sql } from '@vercel/postgres';

/**
 * DELETE /api/roadmap-planners/phases/[phaseId]
 * Delete a phase from a roadmap
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { phaseId: string } }
) {
  try {
    const { phaseId } = params;
    const session = await getSession();
    const userId = session?.user.sub;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // First, verify that the phase exists and belongs to a roadmap owned by this user
    const { rows: phaseRows } = await sql`
      SELECT p.*, r.user_id, r.id as roadmap_id 
      FROM roadmap_phases p
      JOIN roadmap_planners r ON p.roadmap_id = r.id
      WHERE p.id = ${phaseId}
    `;
    
    if (phaseRows.length === 0) {
      return NextResponse.json({ error: 'Phase not found' }, { status: 404 });
    }
    
    const phase = phaseRows[0];
    
    if (phase.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // First delete all tasks associated with this phase
    await sql`
      DELETE FROM roadmap_tasks
      WHERE phase_id = ${phaseId}
    `;
    
    // Then delete the phase itself
    await sql`
      DELETE FROM roadmap_phases
      WHERE id = ${phaseId}
    `;
    
    // Update roadmap's last_modified timestamp
    await sql`
      UPDATE roadmap_planners 
      SET last_modified = ${new Date()}
      WHERE id = ${phase.roadmap_id}
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting phase ${params.phaseId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 