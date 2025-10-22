import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';
import { sql } from '@vercel/postgres';

/**
 * PUT /api/roadmap-planners/phases/[phaseId]/completion
 * Update phase completion status
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { phaseId: string } }
) {
  try {
    const { phaseId } = params;
    const session = await getSession(req);
    const userId = session?.user.sub;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { completionStatus } = await req.json();
    
    // Validate completion status
    const validStatuses = ['in_progress', 'completed', 'paused', 'cancelled'];
    if (!validStatuses.includes(completionStatus)) {
      return NextResponse.json(
        { error: 'Invalid completion status. Must be one of: in_progress, completed, paused, cancelled' },
        { status: 400 }
      );
    }
    
    // Verify phase ownership through roadmap
    const { rows: phaseRows } = await sql`
      SELECT p.id, p.roadmap_id, r.user_id
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
    
    // Update completion status
    const completedAt = completionStatus === 'completed' ? new Date() : null;
    
    const { rows: updatedRows } = await sql`
      UPDATE roadmap_phases 
      SET 
        completion_status = ${completionStatus},
        completed_at = ${completedAt}
      WHERE id = ${phaseId}
      RETURNING id, completion_status, completed_at, roadmap_id
    `;
    
    if (updatedRows.length === 0) {
      return NextResponse.json({ error: 'Failed to update phase completion' }, { status: 500 });
    }
    
    const updatedPhase = updatedRows[0];
    
    // Update roadmap's last_modified timestamp
    await sql`
      UPDATE roadmap_planners 
      SET last_modified = NOW()
      WHERE id = ${updatedPhase.roadmap_id}
    `;
    
    return NextResponse.json({
      success: true,
      phase: {
        id: updatedPhase.id,
        completionStatus: updatedPhase.completion_status,
        completedAt: updatedPhase.completed_at,
        roadmapId: updatedPhase.roadmap_id
      }
    });
    
  } catch (error) {
    console.error(`Error updating phase completion ${params.phaseId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * GET /api/roadmap-planners/phases/[phaseId]/completion
 * Get phase completion status
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { phaseId: string } }
) {
  try {
    const { phaseId } = params;
    const session = await getSession(req);
    const userId = session?.user.sub;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get phase completion status
    const { rows: phaseRows } = await sql`
      SELECT 
        p.id,
        p.title,
        p.completion_status,
        p.completed_at,
        p.roadmap_id,
        r.user_id
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
    
    // Get task completion statistics for this phase
    const { rows: taskStats } = await sql`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN completed = true THEN 1 END) as completed_tasks
      FROM roadmap_tasks 
      WHERE phase_id = ${phaseId}
    `;
    
    const taskStatsData = taskStats[0];
    
    return NextResponse.json({
      success: true,
      phase: {
        id: phase.id,
        title: phase.title,
        completionStatus: phase.completion_status,
        completedAt: phase.completed_at,
        roadmapId: phase.roadmap_id,
        taskStats: {
          total: parseInt(taskStatsData.total_tasks),
          completed: parseInt(taskStatsData.completed_tasks),
          completionPercentage: taskStatsData.total_tasks > 0 
            ? Math.round((parseInt(taskStatsData.completed_tasks) / parseInt(taskStatsData.total_tasks)) * 100)
            : 0
        }
      }
    });
    
  } catch (error) {
    console.error(`Error getting phase completion ${params.phaseId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
