import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { sql } from '@vercel/postgres';
import { v4 as uuidv4 } from 'uuid';

// GET: Fetch all checklist programs and their items for the current user
export async function GET(req: NextRequest) {
  const session = await getSession();
  const userId = session?.user.sub;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch all programs for the user
  const { rows: programs } = await sql`
    SELECT * FROM user_checklist_programs WHERE user_id = ${userId} ORDER BY created_at DESC
  `;

  // Fetch all items for the user
  const { rows: items } = await sql`
    SELECT * FROM user_checklist_items WHERE user_id = ${userId}
  `;

  // Group items by program
  const programsWithItems = programs.map(program => ({
    ...program,
    items: items.filter(item => item.program_id === program.id)
  }));

  return NextResponse.json({ programs: programsWithItems });
}

// POST: Add a new checklist program and its items for the user
export async function POST(req: NextRequest) {
  const session = await getSession();
  const userId = session?.user.sub;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, organization, items } = await req.json();
  if (!title || !organization || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const programId = uuidv4();
  await sql`
    INSERT INTO user_checklist_programs (id, user_id, title, organization)
    VALUES (${programId}, ${userId}, ${title}, ${organization})
  `;

  for (const item of items) {
    const itemId = uuidv4();
    await sql`
      INSERT INTO user_checklist_items (id, user_id, program_id, title, status, deadline, type)
      VALUES (
        ${itemId},
        ${userId},
        ${programId},
        ${item.title},
        ${item.status},
        ${item.deadline || null},
        ${item.type}
      )
    `;
  }

  return NextResponse.json({ success: true, programId });
}

// DELETE: Delete a checklist program and all its items for the user
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  const userId = session?.user.sub;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { programId } = await req.json();
  if (!programId) {
    return NextResponse.json({ error: 'Missing programId' }, { status: 400 });
  }

  // Delete the program and cascade to items
  await sql`
    DELETE FROM user_checklist_programs WHERE id = ${programId} AND user_id = ${userId}
  `;

  return NextResponse.json({ success: true });
} 