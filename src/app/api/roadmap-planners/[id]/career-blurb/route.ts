import { NextRequest, NextResponse } from 'next/server';
import { getAuth0 } from '../../../../../lib/auth0';
import { sql } from '@vercel/postgres';

/**
 * PUT /api/roadmap-planners/[id]/career-blurb
 * Update the career blurb of a roadmap planner
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth0 = getAuth0(req);
    const session = await auth0.getSession(req);
    const userId = session?.user.sub;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { careerBlurb } = await req.json();
    const roadmapId = params.id;
    
    // Check if the roadmap exists and belongs to the user
    const { rows: roadmapRows } = await sql`
      SELECT * FROM roadmap_planners 
      WHERE id = ${roadmapId} AND user_id = ${userId}
    `;
    
    if (roadmapRows.length === 0) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }
    
    // Update the career blurb
    await sql`
      UPDATE roadmap_planners 
      SET career_blurb = ${careerBlurb || ''}, last_modified = NOW()
      WHERE id = ${roadmapId} AND user_id = ${userId}
    `;
    
    return NextResponse.json({ 
      success: true,
      careerBlurb
    });
  } catch (error) {
    console.error('Error updating career blurb:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
