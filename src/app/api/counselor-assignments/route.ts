import { NextRequest, NextResponse } from 'next/server';
import { getAuth0 } from '../../../lib/auth0';
import { executeQuery } from '../../../lib/db';

// GET endpoint to fetch students assigned to a counselor
export async function GET(request: NextRequest) {
  try {
    const auth0 = getAuth0(request);
    const session = await auth0.getSession(request);
    
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
    
    // Get assigned students
    const students = await executeQuery(`
      SELECT 
        csa.student_user_id,
        up.profile_data,
        up.created_at as student_created_at
      FROM counselor_student_assignments csa
      JOIN user_profiles up ON csa.student_user_id = up.user_id
      WHERE csa.counselor_user_id = $1 
        AND csa.is_active = true
        AND up.user_role = 'student'
      ORDER BY csa.assigned_at DESC
    `, [counselorUserId]);
    
    return NextResponse.json({ students }, { status: 200 });
  } catch (error) {
    console.error('Error fetching assigned students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assigned students' },
      { status: 500 }
    );
  }
}

// POST endpoint to assign a student to a counselor
export async function POST(request: NextRequest) {
  try {
    const auth0 = getAuth0(request);
    const session = await auth0.getSession(request);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const counselorUserId = session.user.sub;
    const { studentUserId } = await request.json();
    
    if (!studentUserId) {
      return NextResponse.json({ error: 'Student user ID is required' }, { status: 400 });
    }
    
    // Verify counselor role
    const counselorRole = await executeQuery(
      'SELECT user_role FROM user_profiles WHERE user_id = $1',
      [counselorUserId]
    );
    
    if (counselorRole.length === 0 || counselorRole[0].user_role !== 'counselor') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
    // Verify student exists and has student role
    const studentRole = await executeQuery(
      'SELECT user_role FROM user_profiles WHERE user_id = $1',
      [studentUserId]
    );
    
    if (studentRole.length === 0 || studentRole[0].user_role !== 'student') {
      return NextResponse.json({ error: 'Student not found or invalid role' }, { status: 400 });
    }
    
    // Check if assignment already exists
    const existingAssignment = await executeQuery(
      'SELECT id FROM counselor_student_assignments WHERE counselor_user_id = $1 AND student_user_id = $2',
      [counselorUserId, studentUserId]
    );
    
    if (existingAssignment.length > 0) {
      // Reactivate existing assignment
      await executeQuery(
        'UPDATE counselor_student_assignments SET is_active = true, assigned_at = NOW() WHERE counselor_user_id = $1 AND student_user_id = $2',
        [counselorUserId, studentUserId]
      );
    } else {
      // Create new assignment
      await executeQuery(
        'INSERT INTO counselor_student_assignments (counselor_user_id, student_user_id) VALUES ($1, $2)',
        [counselorUserId, studentUserId]
      );
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error assigning student:', error);
    return NextResponse.json(
      { error: 'Failed to assign student' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove a student assignment
export async function DELETE(request: NextRequest) {
  try {
    const auth0 = getAuth0(request);
    const session = await auth0.getSession(request);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const counselorUserId = session.user.sub;
    const { studentUserId } = await request.json();
    
    if (!studentUserId) {
      return NextResponse.json({ error: 'Student user ID is required' }, { status: 400 });
    }
    
    // Verify counselor role
    const counselorRole = await executeQuery(
      'SELECT user_role FROM user_profiles WHERE user_id = $1',
      [counselorUserId]
    );
    
    if (counselorRole.length === 0 || counselorRole[0].user_role !== 'counselor') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
    // Deactivate assignment
    await executeQuery(
      'UPDATE counselor_student_assignments SET is_active = false WHERE counselor_user_id = $1 AND student_user_id = $2',
      [counselorUserId, studentUserId]
    );
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error removing student assignment:', error);
    return NextResponse.json(
      { error: 'Failed to remove student assignment' },
      { status: 500 }
    );
  }
}

