import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { sql } from '@vercel/postgres';

/**
 * GET /api/roadmap-planners/[id]
 * Fetch a specific roadmap planner with all phases and tasks
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getSession();
    const userId = session?.user.sub;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // First check if the roadmap belongs to the user
    const { rows: roadmapRows } = await sql`
      SELECT * FROM roadmap_planners 
      WHERE id = ${id} AND user_id = ${userId}
    `;
    
    if (roadmapRows.length === 0) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }
    
    const roadmap = roadmapRows[0];
    
    // Get all phases for the roadmap
    const { rows: phaseRows } = await sql`
      SELECT * FROM roadmap_phases 
      WHERE roadmap_id = ${id}
      ORDER BY position
    `;
    
    // For each phase, get its tasks
    const phases = await Promise.all(phaseRows.map(async (phase) => {
      const { rows: taskRows } = await sql`
        SELECT * FROM roadmap_tasks 
        WHERE phase_id = ${phase.id}
        ORDER BY position
      `;
      
      const tasks = taskRows.map(task => ({
        id: task.id,
        title: task.title,
        completed: task.completed,
        notes: task.notes || '',
        dueDate: task.due_date ? task.due_date.toISOString().split('T')[0] : null
      }));
      
      return {
        id: phase.id,
        title: phase.title,
        description: phase.description || '',
        reflection: phase.reflection || '',
        tasks
      };
    }));
    
    const roadmapPlanner = {
      id: roadmap.id,
      goal: {
        title: roadmap.goal_title,
        identity: roadmap.goal_identity,
        deadline: roadmap.goal_deadline ? roadmap.goal_deadline.toISOString().split('T')[0] : ''
      },
      phases,
      createdAt: roadmap.created_at.toISOString(),
      lastModified: roadmap.last_modified.toISOString()
    };
    
    return NextResponse.json({ roadmapPlanner });
  } catch (error) {
    console.error(`Error fetching roadmap planner ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT /api/roadmap-planners/[id]
 * Update a roadmap planner's goal
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getSession();
    const userId = session?.user.sub;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if the roadmap exists and belongs to the user
    const { rows: existingRows } = await sql`
      SELECT * FROM roadmap_planners 
      WHERE id = ${id} AND user_id = ${userId}
    `;
    
    if (existingRows.length === 0) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }
    
    // Get the request body
    const { goal } = await req.json();
    
    if (!goal || !goal.title) {
      return NextResponse.json({ error: 'Goal title is required' }, { status: 400 });
    }
    
    // Update the roadmap goal
    await sql`
      UPDATE roadmap_planners 
      SET 
        goal_title = ${goal.title}, 
        goal_identity = ${goal.identity || ''}, 
        goal_deadline = ${goal.deadline ? new Date(goal.deadline) : null}
      WHERE id = ${id} AND user_id = ${userId}
    `;
    
    // Get the updated roadmap planner (triggers the last_modified update)
    const { rows: updatedRows } = await sql`
      SELECT * FROM roadmap_planners 
      WHERE id = ${id}
    `;
    
    if (updatedRows.length === 0) {
      return NextResponse.json({ error: 'Failed to update roadmap' }, { status: 500 });
    }
    
    const updatedRoadmap = updatedRows[0];
    
    // Get phases and tasks to return the complete roadmap planner
    const { rows: phaseRows } = await sql`
      SELECT * FROM roadmap_phases 
      WHERE roadmap_id = ${id}
      ORDER BY position
    `;
    
    const phases = await Promise.all(phaseRows.map(async (phase) => {
      const { rows: taskRows } = await sql`
        SELECT * FROM roadmap_tasks 
        WHERE phase_id = ${phase.id}
        ORDER BY position
      `;
      
      const tasks = taskRows.map(task => ({
        id: task.id,
        title: task.title,
        completed: task.completed,
        notes: task.notes || '',
        dueDate: task.due_date ? task.due_date.toISOString().split('T')[0] : null
      }));
      
      return {
        id: phase.id,
        title: phase.title,
        description: phase.description || '',
        reflection: phase.reflection || '',
        tasks
      };
    }));
    
    const roadmapPlanner = {
      id: updatedRoadmap.id,
      goal: {
        title: updatedRoadmap.goal_title,
        identity: updatedRoadmap.goal_identity,
        deadline: updatedRoadmap.goal_deadline ? updatedRoadmap.goal_deadline.toISOString().split('T')[0] : ''
      },
      phases,
      createdAt: updatedRoadmap.created_at.toISOString(),
      lastModified: updatedRoadmap.last_modified.toISOString()
    };
    
    return NextResponse.json({ roadmapPlanner });
  } catch (error) {
    console.error(`Error updating roadmap planner ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/roadmap-planners/[id]
 * Delete a roadmap planner
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getSession();
    const userId = session?.user.sub;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if the roadmap exists and belongs to the user
    const { rows: existingRows } = await sql`
      SELECT * FROM roadmap_planners 
      WHERE id = ${id} AND user_id = ${userId}
    `;
    
    if (existingRows.length === 0) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }
    
    // Delete the roadmap (cascade will delete phases and tasks)
    await sql`
      DELETE FROM roadmap_planners 
      WHERE id = ${id} AND user_id = ${userId}
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting roadmap planner ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 