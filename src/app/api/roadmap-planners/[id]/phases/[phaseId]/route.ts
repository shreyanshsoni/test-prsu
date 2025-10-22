import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';
import { sql } from '@vercel/postgres';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string, phaseId: string } }
) {
  try {
    // Check authentication
    const session = await getSession(req);
    const userId = session?.user.sub;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: roadmapId, phaseId } = params;
    
    // Get updates from request body
    const updates = await request.json();
    const { title, description } = updates;
    
    // Validate input
    if (!title && !description) {
      return NextResponse.json(
        { error: 'At least one field must be provided for update' },
        { status: 400 }
      );
    }

    // Verify roadmap ownership
    const { rows: roadmapRows } = await sql`
      SELECT id FROM roadmap_planners 
      WHERE id = ${roadmapId} AND user_id = ${userId}
    `;

    if (roadmapRows.length === 0) {
      return NextResponse.json(
        { error: 'Roadmap not found or not owned by user' },
        { status: 404 }
      );
    }

    // Verify phase exists in this roadmap
    const { rows: phaseRows } = await sql`
      SELECT id FROM roadmap_phases 
      WHERE id = ${phaseId} AND roadmap_id = ${roadmapId}
    `;

    if (phaseRows.length === 0) {
      return NextResponse.json(
        { error: 'Phase not found in this roadmap' },
        { status: 404 }
      );
    }

    // Update the phase
    if (title !== undefined && description !== undefined) {
      await sql`
        UPDATE roadmap_phases
        SET title = ${title}, description = ${description}
        WHERE id = ${phaseId}
      `;
    } else if (title !== undefined) {
      await sql`
        UPDATE roadmap_phases
        SET title = ${title}
        WHERE id = ${phaseId}
      `;
    } else if (description !== undefined) {
      await sql`
        UPDATE roadmap_phases
        SET description = ${description}
        WHERE id = ${phaseId}
      `;
    }

    // Update last_modified timestamp on the roadmap
    await sql`
      UPDATE roadmap_planners
      SET last_modified = NOW()
      WHERE id = ${roadmapId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing phase update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 