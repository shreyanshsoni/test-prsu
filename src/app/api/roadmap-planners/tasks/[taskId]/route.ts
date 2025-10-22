import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';
import { sql } from '@vercel/postgres';

/**
 * PUT /api/roadmap-planners/tasks/[taskId]
 * Update a task (completion status, notes, or due date)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const session = await getSession(req);
    const userId = session?.user.sub;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // First, verify that the task exists and belongs to a roadmap owned by this user
    const { rows: taskRows } = await sql`
      SELECT t.*, p.roadmap_id, r.user_id
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
    
    // Get update data from request
    const updateData = await req.json();
    const { completed, notes, dueDate, title } = updateData;
    
    // Build the update SQL dynamically based on which fields are provided
    let updateFields = [];
    let updateValues: any[] = [];
    
    if (completed !== undefined) {
      updateFields.push('completed = $1');
      updateValues.push(completed);
    }
    
    if (notes !== undefined) {
      updateFields.push(`notes = $${updateValues.length + 1}`);
      updateValues.push(notes);
    }
    
    if (dueDate !== undefined) {
      updateFields.push(`due_date = $${updateValues.length + 1}`);
      updateValues.push(dueDate ? new Date(dueDate) : null);
    }
    
    if (title !== undefined) {
      updateFields.push(`title = $${updateValues.length + 1}`);
      updateValues.push(title);
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No update fields provided' }, { status: 400 });
    }
    
    // Update the task
    const updateQuery = `
      UPDATE roadmap_tasks 
      SET ${updateFields.join(', ')}
      WHERE id = $${updateValues.length + 1}
      RETURNING *
    `;
    
    updateValues.push(taskId);
    
    const { rows: updatedRows } = await sql.query(updateQuery, updateValues);
    
    if (updatedRows.length === 0) {
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
    
    // Update the roadmap's last_modified timestamp
    await sql`
      UPDATE roadmap_planners 
      SET last_modified = ${new Date()}
      WHERE id = ${task.roadmap_id}
    `;
    
    // Return the updated task
    const updatedTask = {
      id: updatedRows[0].id,
      title: updatedRows[0].title,
      completed: updatedRows[0].completed,
      notes: updatedRows[0].notes || '',
      dueDate: updatedRows[0].due_date ? updatedRows[0].due_date.toISOString().split('T')[0] : null
    };
    
    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error(`Error updating task ${params.taskId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/roadmap-planners/tasks/[taskId]
 * Delete a task
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const session = await getSession(req);
    const userId = session?.user.sub;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // First, verify that the task exists and belongs to a roadmap owned by this user
    const { rows: taskRows } = await sql`
      SELECT t.*, p.roadmap_id, r.user_id
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
    
    // Delete the task
    await sql`
      DELETE FROM roadmap_tasks
      WHERE id = ${taskId}
    `;
    
    // Update roadmap's last_modified timestamp
    await sql`
      UPDATE roadmap_planners 
      SET last_modified = ${new Date()}
      WHERE id = ${task.roadmap_id}
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting task ${params.taskId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 