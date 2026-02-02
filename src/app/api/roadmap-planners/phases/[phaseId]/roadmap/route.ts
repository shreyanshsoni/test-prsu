import { NextRequest, NextResponse } from 'next/server';
import { getAuth0 } from '../../../../../../lib/auth0';
import { sql } from '@vercel/postgres';

/**
 * GET /api/roadmap-planners/phases/[phaseId]/roadmap
 * Get the roadmap ID for a phase
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { phaseId: string } }
) {
  try {
    const { phaseId } = params;
    const auth0 = getAuth0(req);
    const session = await auth0.getSession(req);
    const userId = session?.user.sub;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the roadmap ID for this phase
    const { rows } = await sql`
      SELECT r.id as roadmap_id
      FROM roadmap_planners r
      JOIN roadmap_phases p ON p.roadmap_id = r.id
      WHERE p.id = ${phaseId}
      AND r.user_id = ${userId}
    `;
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Phase not found' }, { status: 404 });
    }
    
    return NextResponse.json({ roadmapId: rows[0].roadmap_id });
  } catch (error) {
    console.error(`Error getting roadmap ID for phase ${params.phaseId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 