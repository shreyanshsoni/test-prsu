import { NextRequest, NextResponse } from 'next/server';
import { getAuth0 } from '../../../../lib/auth0';
import { executeQuery } from '../../../../lib/db';

/**
 * POST /api/counselor/approve-student
 * Approve or reject a student's request
 */
export async function POST(req: NextRequest) {
  try {
    const auth0 = getAuth0(req);
    const session = await auth0.getSession(req);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const counselorUserId = session.user.sub;
    const { studentUserId, action } = await req.json();

    if (!studentUserId || !action) {
      return NextResponse.json(
        { error: 'Student user ID and action are required' },
        { status: 400 }
      );
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Action must be either "approve" or "reject"' },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { error: 'Counselor is not assigned to any institute' },
        { status: 403 }
      );
    }

    // Verify the student belongs to the counselor's institute
    const studentCheck = await executeQuery(
      `SELECT user_id, institute_id, verification_status 
       FROM user_profiles 
       WHERE user_id = $1 AND user_role = 'student'`,
      [studentUserId]
    );

    if (studentCheck.length === 0) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    if (studentCheck[0].institute_id !== counselorInstituteId) {
      return NextResponse.json(
        { error: 'Student does not belong to your institute' },
        { status: 403 }
      );
    }

    // Update student's verification status
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const isVerified = action === 'approve';

    await executeQuery(
      `UPDATE user_profiles 
       SET verification_status = $1,
           is_verified = $2,
           verified_by = $3,
           verified_at = NOW(),
           updated_at = NOW()
       WHERE user_id = $4`,
      [newStatus, isVerified, counselorUserId, studentUserId]
    );

    return NextResponse.json({
      success: true,
      message: `Student ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      studentUserId,
      status: newStatus
    }, { status: 200 });
  } catch (error) {
    console.error('Error approving/rejecting student:', error);
    return NextResponse.json(
      { error: 'Failed to process student request' },
      { status: 500 }
    );
  }
}

