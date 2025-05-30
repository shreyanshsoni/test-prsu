import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { sql } from '@vercel/postgres';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/roadmap-planners/phases/[phaseId]/tasks
 * Add a new task to a phase
 */
export async function POST(
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
    
    // Get task data from request
    const { title, notes, dueDate, completed } = await req.json();
    
    if (!title) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }
    
    // Get current number of tasks to determine position
    const { rows: countRows } = await sql`
      SELECT COUNT(*) as count FROM roadmap_tasks
      WHERE phase_id = ${phaseId}
    `;
    
    const position = parseInt(countRows[0].count) || 0;
    const taskId = `task-${uuidv4()}`;
    
    // Insert the new task
    await sql`
      INSERT INTO roadmap_tasks (
        id, phase_id, title, completed, notes, due_date, position, created_at
      ) VALUES (
        ${taskId}, ${phaseId}, ${title}, ${completed || false}, ${notes || ''}, 
        ${dueDate ? new Date(dueDate) : null}, ${position}, ${new Date()}
      )
    `;
    
    // Update roadmap's last_modified timestamp
    await sql`
      UPDATE roadmap_planners 
      SET last_modified = ${new Date()}
      WHERE id = ${phase.roadmap_id}
    `;
    
    // Return the created task
    const task = {
      id: taskId,
      title,
      completed: completed || false,
      notes: notes || '',
      dueDate: dueDate || null
    };
    
    return NextResponse.json({ task });
  } catch (error) {
    console.error(`Error adding task to phase ${params.phaseId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 