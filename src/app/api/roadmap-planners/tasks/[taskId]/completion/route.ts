import { NextRequest, NextResponse } from 'next/server';
import { getAuth0 } from '../../../../../../lib/auth0';
import { sql } from '@vercel/postgres';

/**
 * PUT /api/roadmap-planners/tasks/[taskId]/completion
 * Update task completion status
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const auth0 = getAuth0(req);
    const session = await auth0.getSession(req);
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
    
    // Verify task ownership through roadmap
    const { rows: taskRows } = await sql`
      SELECT t.id, t.phase_id, p.roadmap_id, r.user_id
      FROM roadmap_tasks t
      JOIN roadmap_phases p ON t.phase_id = p.id
      JOIN roadmap_planners r ON p.roadmap_id = r.id
      WHERE t.id = ${taskId}
    `;
    
    if (taskRows.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    const task = taskRows[0];
    
    if (task.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Update completion status
    const completedAt = completionStatus === 'completed' ? new Date() : null;
    const completed = completionStatus === 'completed';
    
    const { rows: updatedRows } = await sql`
      UPDATE roadmap_tasks 
      SET 
        completion_status = ${completionStatus},
        completed_at = ${completedAt},
        completed = ${completed},
        recent_activity = NOW()
      WHERE id = ${taskId}
      RETURNING id, completion_status, completed_at, completed, recent_activity
    `;
    
    if (updatedRows.length === 0) {
      return NextResponse.json({ error: 'Failed to update task completion' }, { status: 500 });
    }
    
    const updatedTask = updatedRows[0];
    
    // Update roadmap's last_modified timestamp
    await sql`
      UPDATE roadmap_planners 
      SET last_modified = NOW(), recent_activity = NOW()
      WHERE id = ${task.roadmap_id}
    `;
    
    return NextResponse.json({
      success: true,
      task: {
        id: updatedTask.id,
        completionStatus: updatedTask.completion_status,
        completedAt: updatedTask.completed_at,
        completed: updatedTask.completed,
        recentActivity: updatedTask.recent_activity,
        phaseId: task.phase_id,
        roadmapId: task.roadmap_id
      }
    });
    
  } catch (error) {
    console.error(`Error updating task completion ${params.taskId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * GET /api/roadmap-planners/tasks/[taskId]/completion
 * Get task completion status
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const auth0 = getAuth0(req);
    const session = await auth0.getSession(req);
    const userId = session?.user.sub;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get task completion status
    const { rows: taskRows } = await sql`
      SELECT 
        t.id,
        t.title,
        t.completion_status,
        t.completed_at,
        t.completed,
        t.recent_activity,
        t.phase_id,
        p.title as phase_title,
        r.goal_title as roadmap_title,
        r.user_id
      FROM roadmap_tasks t
      JOIN roadmap_phases p ON t.phase_id = p.id
      JOIN roadmap_planners r ON p.roadmap_id = r.id
      WHERE t.id = ${taskId}
    `;
    
    if (taskRows.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    const task = taskRows[0];
    
    if (task.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json({
      success: true,
      task: {
        id: task.id,
        title: task.title,
        completionStatus: task.completion_status,
        completedAt: task.completed_at,
        completed: task.completed,
        recentActivity: task.recent_activity,
        phaseId: task.phase_id,
        phaseTitle: task.phase_title,
        roadmapTitle: task.roadmap_title
      }
    });
    
  } catch (error) {
    console.error(`Error getting task completion ${params.taskId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
