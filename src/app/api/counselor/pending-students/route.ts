import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';
import { executeQuery } from '../../../../lib/db';

/**
 * GET /api/counselor/pending-students
 * Get all pending students from the counselor's institute
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const counselorUserId = session.user.sub;

    // Verify counselor role and get their institute_id
    const counselorProfile = await executeQuery(
      'SELECT user_role, institute_id FROM user_profiles WHERE user_id = $1',
      [counselorUserId]
    );

    if (counselorProfile.length === 0 || counselorProfile[0].user_role !== 'counselor') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const counselorInstituteId = counselorProfile[0].institute_id;

    if (!counselorInstituteId) {
      // If counselor has no institute assigned, return empty array
      return NextResponse.json({ students: [] }, { status: 200 });
    }

    // Get all pending students from this institute
    const pendingStudents = await executeQuery(
      `SELECT 
        up.user_id,
        up.first_name,
        up.last_name,
        up.display_name,
        up.institute_id,
        up.verification_status,
        up.created_at,
        il.institute_name
      FROM user_profiles up
      LEFT JOIN institute_list il ON up.institute_id = il.institute_id
      WHERE up.institute_id = $1
        AND up.verification_status = 'pending'
        AND up.user_role = 'student'
      ORDER BY up.created_at ASC`,
      [counselorInstituteId]
    );

    // Format the response
    const formattedStudents = pendingStudents.map((student: any) => ({
      userId: student.user_id,
      firstName: student.first_name || '',
      lastName: student.last_name || '',
      displayName: student.display_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student',
      instituteId: student.institute_id,
      instituteName: student.institute_name || 'Unknown Institute',
      verificationStatus: student.verification_status,
      createdAt: student.created_at,
    }));

    return NextResponse.json({ 
      students: formattedStudents,
      instituteId: counselorInstituteId 
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching pending students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending students' },
      { status: 500 }
    );
  }
}

