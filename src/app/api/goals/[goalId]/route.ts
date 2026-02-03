import { NextRequest, NextResponse } from "next/server";
import { getAuth0 } from '../../../../lib/auth0';
import { sql } from '@vercel/postgres';

// GET handler - retrieve a specific goal
export async function GET(req: NextRequest, { params }: { params: { goalId: string } }) {
  try {
    const auth0 = getAuth0(req);
    const session = await auth0.getSession(req);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const userId = session.user.sub;
    const { goalId } = params;
    
    try {
      const { rows } = await sql`
        SELECT * FROM user_goals
        WHERE id = ${goalId} AND user_id = ${userId}
      `;
      
      if (rows.length === 0) {
        return NextResponse.json(
          { error: "Goal not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ goal: rows[0] });
    } catch (err) {
      console.error('SQL error retrieving goal:', err);
      return NextResponse.json(
        { error: "Database error: " + (err instanceof Error ? err.message : String(err)) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unhandled error retrieving goal:', error);
    return NextResponse.json(
      { error: "Failed to retrieve goal: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

// PATCH handler - update a specific goal
export async function PATCH(req: NextRequest, { params }: { params: { goalId: string } }) {
  try {
    const auth0 = getAuth0(req);
    const session = await auth0.getSession(req);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const userId = session.user.sub;
    const { goalId } = params;
    
    try {
      // First check if the goal exists and belongs to the user
      const { rows } = await sql`
        SELECT * FROM user_goals
        WHERE id = ${goalId} AND user_id = ${userId}
      `;
      
      if (rows.length === 0) {
        return NextResponse.json(
          { error: "Goal not found or you don't have permission to update it" },
          { status: 404 }
        );
      }
      
      const body = await req.json();
      const updatedAt = new Date().toISOString();
      
      // Build dynamic update query based on provided fields
      const updates: string[] = [];
      const values: any[] = [];
      
      if (body.title !== undefined) {
        updates.push('title = $1');
        values.push(body.title);
      }
      
      if (body.description !== undefined) {
        updates.push(`description = $${values.length + 1}`);
        values.push(body.description);
      }
      
      if (body.dueDate !== undefined) {
        updates.push(`due_date = $${values.length + 1}`);
        values.push(body.dueDate);
      }
      
      if (body.category !== undefined) {
        updates.push(`category = $${values.length + 1}`);
        values.push(body.category);
      }
      
      if (body.completed !== undefined) {
        updates.push(`completed = $${values.length + 1}`);
        values.push(body.completed);
      }
      
      if (body.priority !== undefined) {
        updates.push(`priority = $${values.length + 1}`);
        values.push(body.priority);
      }
      
      // Add updated_at timestamp
      updates.push(`updated_at = $${values.length + 1}`);
      values.push(updatedAt);
      
      if (updates.length === 1 && updates[0].startsWith('updated_at')) {
        return NextResponse.json(
          { error: "No fields to update" },
          { status: 400 }
        );
      }
      
      // Perform the update
      const updateQuery = `
        UPDATE user_goals
        SET ${updates.join(', ')}
        WHERE id = $${values.length + 1} AND user_id = $${values.length + 2}
        RETURNING *
      `;
      
      values.push(goalId);
      values.push(userId);
      
      const result = await sql.query(updateQuery, values);
      
      return NextResponse.json({ goal: result.rows[0] });
    } catch (err) {
      console.error('SQL error updating goal:', err);
      return NextResponse.json(
        { error: "Database error: " + (err instanceof Error ? err.message : String(err)) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unhandled error updating goal:', error);
    return NextResponse.json(
      { error: "Failed to update goal: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

// DELETE handler - delete a specific goal
export async function DELETE(req: NextRequest, { params }: { params: { goalId: string } }) {
  try {
    const auth0 = getAuth0(req);
    const session = await auth0.getSession(req);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const userId = session.user.sub;
    const { goalId } = params;
    
    try {
      // Check if the goal exists and belongs to the user before deleting
      const { rows } = await sql`
        SELECT id FROM user_goals
        WHERE id = ${goalId} AND user_id = ${userId}
      `;
      
      if (rows.length === 0) {
        return NextResponse.json(
          { error: "Goal not found or you don't have permission to delete it" },
          { status: 404 }
        );
      }
      
      // Delete the goal
      await sql`
        DELETE FROM user_goals
        WHERE id = ${goalId} AND user_id = ${userId}
      `;
      
      return NextResponse.json(
        { success: true, message: "Goal deleted successfully" },
        { status: 200 }
      );
    } catch (err) {
      console.error('SQL error deleting goal:', err);
      return NextResponse.json(
        { error: "Database error: " + (err instanceof Error ? err.message : String(err)) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unhandled error deleting goal:', error);
    return NextResponse.json(
      { error: "Failed to delete goal: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 