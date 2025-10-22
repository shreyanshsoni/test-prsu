import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';
import { sql } from '@vercel/postgres';
import { v4 as uuidv4 } from 'uuid';

// Helper function to ensure checklist tables exist
async function ensureChecklistTablesExist() {
  try {
    console.log('Checking checklist database tables...');
    
    // Check if the tables exist
    const { rows: tables } = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('user_checklist_programs', 'user_checklist_items')
    `;
    
    const tableNames = tables.map(t => t.tablename);
    console.log('Existing checklist tables:', tableNames);
    
    // Create user_checklist_programs table if it doesn't exist
    if (!tableNames.includes('user_checklist_programs')) {
      console.log('Creating user_checklist_programs table...');
      await sql`
        CREATE TABLE IF NOT EXISTS user_checklist_programs (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          title TEXT NOT NULL,
          organization TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      await sql`
        CREATE INDEX IF NOT EXISTS idx_user_checklist_programs_user_id ON user_checklist_programs(user_id)
      `;
    }
    
    // Create user_checklist_items table if it doesn't exist
    if (!tableNames.includes('user_checklist_items')) {
      console.log('Creating user_checklist_items table...');
      await sql`
        CREATE TABLE IF NOT EXISTS user_checklist_items (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          program_id VARCHAR(255) REFERENCES user_checklist_programs(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          status VARCHAR(32) NOT NULL,
          deadline DATE,
          type VARCHAR(32) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      await sql`
        CREATE INDEX IF NOT EXISTS idx_user_checklist_items_user_id ON user_checklist_items(user_id)
      `;
    }
    
    console.log('Checklist tables ensured successfully!');
  } catch (error) {
    console.error('Error ensuring checklist tables exist:', error);
  }
}

// GET: Fetch all checklist programs and their items for the current user
export async function GET(req: NextRequest) {
  // Ensure tables exist first
  await ensureChecklistTablesExist();
  
  const session = await getSession(req);
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
  // Ensure tables exist first
  await ensureChecklistTablesExist();
  
  const session = await getSession(req);
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
  // Ensure tables exist first
  await ensureChecklistTablesExist();
  
  const session = await getSession(req);
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
