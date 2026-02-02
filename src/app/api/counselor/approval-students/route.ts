import { NextRequest, NextResponse } from 'next/server';
import { getAuth0 } from '../../../../lib/auth0';
import { executeQuery } from '../../../../lib/db';

/**
 * GET /api/counselor/approval-students
 * Returns all students (pending/approved/rejected) for the counselor's institute.
 */
export async function GET(req: NextRequest) {
  try {
    const auth0 = getAuth0(req);
    const session = await auth0.getSession(req);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const counselorUserId = session.user.sub;

    // Verify counselor role and institute
    const counselorProfile = await executeQuery(
      'SELECT user_role, institute_id FROM user_profiles WHERE user_id = $1',
      [counselorUserId]
    );

    if (
      counselorProfile.length === 0 ||
      counselorProfile[0].user_role !== 'counselor'
    ) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const counselorInstituteId = counselorProfile[0].institute_id;

    if (!counselorInstituteId) {
      // No institute assigned — return empty list rather than error
      return NextResponse.json(
        { students: [], instituteId: null },
        { status: 200 }
      );
    }

    // Fetch all students for this institute across statuses
    const studentRows = await executeQuery(
      `
        SELECT 
          up.user_id,
          up.first_name,
          up.last_name,
          up.display_name,
          up.institute_id,
          up.verification_status,
          up.created_at,
          up.verified_at,
          il.institute_name
        FROM user_profiles up
        LEFT JOIN institute_list il ON up.institute_id = il.institute_id
        WHERE up.institute_id = $1
          AND up.user_role = 'student'
          AND up.verification_status IN ('pending','approved','rejected')
        ORDER BY up.created_at DESC
      `,
      [counselorInstituteId]
    );

    const students = studentRows.map((student: any) => ({
      userId: student.user_id,
      firstName: student.first_name || '',
      lastName: student.last_name || '',
      displayName:
        student.display_name ||
        `${student.first_name || ''} ${student.last_name || ''}`.trim() ||
        'Student',
      instituteId: student.institute_id,
      instituteName: student.institute_name || 'Unknown Institute',
      verificationStatus: student.verification_status || 'pending',
      createdAt: student.created_at,
      verifiedAt: student.verified_at,
    }));

    return NextResponse.json(
      {
        students,
        instituteId: counselorInstituteId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching counselor approval students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}







