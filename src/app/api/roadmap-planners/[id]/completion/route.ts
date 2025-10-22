import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';
import { sql } from '@vercel/postgres';

/**
 * PUT /api/roadmap-planners/[id]/completion
 * Update roadmap completion status
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: roadmapId } = params;
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
    
    // Verify roadmap ownership
    const { rows: roadmapRows } = await sql`
      SELECT id FROM roadmap_planners 
      WHERE id = ${roadmapId} AND user_id = ${userId}
    `;
    
    if (roadmapRows.length === 0) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }
    
    // Update completion status
    const completedAt = completionStatus === 'completed' ? new Date() : null;
    
    const { rows: updatedRows } = await sql`
      UPDATE roadmap_planners 
      SET 
        completion_status = ${completionStatus},
        completed_at = ${completedAt},
        last_modified = NOW()
      WHERE id = ${roadmapId}
      RETURNING id, completion_status, completed_at, last_modified
    `;
    
    if (updatedRows.length === 0) {
      return NextResponse.json({ error: 'Failed to update roadmap completion' }, { status: 500 });
    }
    
    const updatedRoadmap = updatedRows[0];
    
    return NextResponse.json({
      success: true,
      roadmap: {
        id: updatedRoadmap.id,
        completionStatus: updatedRoadmap.completion_status,
        completedAt: updatedRoadmap.completed_at,
        lastModified: updatedRoadmap.last_modified
      }
    });
    
  } catch (error) {
    console.error(`Error updating roadmap completion ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * GET /api/roadmap-planners/[id]/completion
 * Get roadmap completion status
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: roadmapId } = params;
    const session = await getSession(req);
    const userId = session?.user.sub;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get roadmap completion status
    const { rows: roadmapRows } = await sql`
      SELECT 
        id,
        completion_status,
        completed_at,
        last_modified
      FROM roadmap_planners 
      WHERE id = ${roadmapId} AND user_id = ${userId}
    `;
    
    if (roadmapRows.length === 0) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }
    
    const roadmap = roadmapRows[0];
    
    // Get phase completion statistics
    const { rows: phaseStats } = await sql`
      SELECT 
        COUNT(*) as total_phases,
        COUNT(CASE WHEN completion_status = 'completed' THEN 1 END) as completed_phases,
        COUNT(CASE WHEN completion_status = 'in_progress' THEN 1 END) as in_progress_phases,
        COUNT(CASE WHEN completion_status = 'paused' THEN 1 END) as paused_phases,
        COUNT(CASE WHEN completion_status = 'cancelled' THEN 1 END) as cancelled_phases
      FROM roadmap_phases 
      WHERE roadmap_id = ${roadmapId}
    `;
    
    // Get task completion statistics
    const { rows: taskStats } = await sql`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN completed = true THEN 1 END) as completed_tasks
      FROM roadmap_tasks rt
      JOIN roadmap_phases rp ON rt.phase_id = rp.id
      WHERE rp.roadmap_id = ${roadmapId}
    `;
    
    const phaseStatsData = phaseStats[0];
    const taskStatsData = taskStats[0];
    
    return NextResponse.json({
      success: true,
      roadmap: {
        id: roadmap.id,
        completionStatus: roadmap.completion_status,
        completedAt: roadmap.completed_at,
        lastModified: roadmap.last_modified,
        phaseStats: {
          total: parseInt(phaseStatsData.total_phases),
          completed: parseInt(phaseStatsData.completed_phases),
          inProgress: parseInt(phaseStatsData.in_progress_phases),
          paused: parseInt(phaseStatsData.paused_phases),
          cancelled: parseInt(phaseStatsData.cancelled_phases)
        },
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
    console.error(`Error getting roadmap completion ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
