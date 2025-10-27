import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';
import { executeQuery } from '../../../lib/db';

// POST endpoint to create a new counselor note
export async function POST(request: NextRequest) {
  try {
    console.log('Starting counselor note creation...');
    const session = await getSession(request);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const counselorUserId = session.user.sub;
    
    // Verify counselor role
    const roleResult = await executeQuery(
      'SELECT user_role FROM user_profiles WHERE user_id = $1',
      [counselorUserId]
    );
    
    if (roleResult.length === 0 || roleResult[0].user_role !== 'counselor') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
    // Parse request body
    const body = await request.json();
    const { studentUserId, noteText } = body;
    
    if (!studentUserId || !noteText || noteText.trim() === '') {
      return NextResponse.json({ 
        error: 'Missing required fields: studentUserId and noteText' 
      }, { status: 400 });
    }
    
    // Verify the student exists and is assigned to this counselor
    const assignmentCheck = await executeQuery(`
      SELECT 1 FROM counselor_student_assignments 
      WHERE counselor_user_id = $1 AND student_user_id = $2 AND is_active = true
    `, [counselorUserId, studentUserId]);
    
    if (assignmentCheck.length === 0) {
      return NextResponse.json({ 
        error: 'Student not assigned to this counselor' 
      }, { status: 403 });
    }
    
    // Insert the new note
    const insertResult = await executeQuery(`
      INSERT INTO counselor_notes (counselor_user_id, student_user_id, note_text)
      VALUES ($1, $2, $3)
      RETURNING id, created_at, updated_at
    `, [counselorUserId, studentUserId, noteText.trim()]);
    
    // Get counselor's name for the response
    const counselorInfo = await executeQuery(`
      SELECT first_name, last_name FROM user_profiles WHERE user_id = $1
    `, [counselorUserId]);
    
    const counselor = counselorInfo[0];
    const counselorName = counselor ? `Ms. ${counselor.first_name} ${counselor.last_name}` : 'Unknown Counselor';
    
    const newNote = insertResult[0];
    
    return NextResponse.json({
      success: true,
      note: {
        id: newNote.id,
        text: noteText.trim(),
        author: counselorName,
        date: newNote.created_at,
        updatedAt: newNote.updated_at
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating counselor note:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create note',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch notes for a specific student
export async function GET(request: NextRequest) {
  try {
    console.log('Starting counselor notes fetch...');
    const session = await getSession(request);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const counselorUserId = session.user.sub;
    
    // Verify counselor role
    const roleResult = await executeQuery(
      'SELECT user_role FROM user_profiles WHERE user_id = $1',
      [counselorUserId]
    );
    
    if (roleResult.length === 0 || roleResult[0].user_role !== 'counselor') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
    // Get student ID from query parameters
    const { searchParams } = new URL(request.url);
    const studentUserId = searchParams.get('studentId');
    
    if (!studentUserId) {
      return NextResponse.json({ 
        error: 'Missing required parameter: studentId' 
      }, { status: 400 });
    }
    
    // Verify the student is assigned to this counselor
    const assignmentCheck = await executeQuery(`
      SELECT 1 FROM counselor_student_assignments 
      WHERE counselor_user_id = $1 AND student_user_id = $2 AND is_active = true
    `, [counselorUserId, studentUserId]);
    
    if (assignmentCheck.length === 0) {
      return NextResponse.json({ 
        error: 'Student not assigned to this counselor' 
      }, { status: 403 });
    }
    
    // Fetch notes for the student
    const notesResult = await executeQuery(`
      SELECT 
        cn.id,
        cn.note_text,
        cn.created_at,
        cn.updated_at,
        cn.counselor_user_id,
        up.first_name,
        up.last_name
      FROM counselor_notes cn
      JOIN user_profiles up ON cn.counselor_user_id = up.user_id
      WHERE cn.student_user_id = $1
      ORDER BY cn.created_at DESC
      LIMIT 20
    `, [studentUserId]);
    
    const notes = notesResult.map(note => ({
      id: note.id,
      text: note.note_text,
      author: `Ms. ${note.first_name} ${note.last_name}`,
      date: note.created_at,
      updatedAt: note.updated_at,
      counselorUserId: note.counselor_user_id, // Add counselor ID for ownership check
      isOwnNote: note.counselor_user_id === counselorUserId // Add ownership flag
    }));
    
    // Sort notes: own notes first, then others (both by date DESC)
    const sortedNotes = notes.sort((a, b) => {
      // First sort by ownership (own notes first)
      if (a.isOwnNote && !b.isOwnNote) return -1;
      if (!a.isOwnNote && b.isOwnNote) return 1;
      
      // Then sort by date (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    return NextResponse.json({ notes: sortedNotes }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching counselor notes:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch notes',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// PUT endpoint to update a counselor note
export async function PUT(request: NextRequest) {
  try {
    console.log('Starting counselor note update...');
    const session = await getSession(request);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const counselorUserId = session.user.sub;
    
    // Verify counselor role
    const roleResult = await executeQuery(
      'SELECT user_role FROM user_profiles WHERE user_id = $1',
      [counselorUserId]
    );
    
    if (roleResult.length === 0 || roleResult[0].user_role !== 'counselor') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
    // Parse request body
    const body = await request.json();
    const { noteId, noteText } = body;
    
    if (!noteId || !noteText || noteText.trim() === '') {
      return NextResponse.json({ 
        error: 'Missing required fields: noteId and noteText' 
      }, { status: 400 });
    }
    
    // Verify the note exists and belongs to this counselor
    const noteCheck = await executeQuery(`
      SELECT cn.id, cn.student_user_id, cn.counselor_user_id
      FROM counselor_notes cn
      WHERE cn.id = $1 AND cn.counselor_user_id = $2
    `, [noteId, counselorUserId]);
    
    if (noteCheck.length === 0) {
      return NextResponse.json({ 
        error: 'Note not found or not owned by this counselor' 
      }, { status: 404 });
    }
    
    // Update the note
    const updateResult = await executeQuery(`
      UPDATE counselor_notes 
      SET note_text = $1, updated_at = NOW()
      WHERE id = $2 AND counselor_user_id = $3
      RETURNING id, created_at, updated_at
    `, [noteText.trim(), noteId, counselorUserId]);
    
    // Get counselor's name for the response
    const counselorInfo = await executeQuery(`
      SELECT first_name, last_name FROM user_profiles WHERE user_id = $1
    `, [counselorUserId]);
    
    const counselor = counselorInfo[0];
    const counselorName = counselor ? `Ms. ${counselor.first_name} ${counselor.last_name}` : 'Unknown Counselor';
    
    const updatedNote = updateResult[0];
    
    return NextResponse.json({
      success: true,
      note: {
        id: updatedNote.id,
        text: noteText.trim(),
        author: counselorName,
        date: updatedNote.created_at,
        updatedAt: updatedNote.updated_at,
        counselorUserId: counselorUserId,
        isOwnNote: true
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error updating counselor note:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update note',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint to delete a counselor note
export async function DELETE(request: NextRequest) {
  try {
    console.log('Starting counselor note deletion...');
    const session = await getSession(request);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const counselorUserId = session.user.sub;
    
    // Verify counselor role
    const roleResult = await executeQuery(
      'SELECT user_role FROM user_profiles WHERE user_id = $1',
      [counselorUserId]
    );
    
    if (roleResult.length === 0 || roleResult[0].user_role !== 'counselor') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
    // Get note ID from query parameters
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('noteId');
    
    if (!noteId) {
      return NextResponse.json({ 
        error: 'Missing required parameter: noteId' 
      }, { status: 400 });
    }
    
    // Verify the note exists and belongs to this counselor
    const noteCheck = await executeQuery(`
      SELECT cn.id, cn.student_user_id, cn.counselor_user_id
      FROM counselor_notes cn
      WHERE cn.id = $1 AND cn.counselor_user_id = $2
    `, [noteId, counselorUserId]);
    
    if (noteCheck.length === 0) {
      return NextResponse.json({ 
        error: 'Note not found or not owned by this counselor' 
      }, { status: 404 });
    }
    
    // Delete the note
    await executeQuery(`
      DELETE FROM counselor_notes 
      WHERE id = $1 AND counselor_user_id = $2
    `, [noteId, counselorUserId]);
    
    return NextResponse.json({
      success: true,
      message: 'Note deleted successfully'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error deleting counselor note:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete note',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
