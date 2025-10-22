import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';
import { executeQuery } from '../../../lib/db';

// POST endpoint to save counselor assessment data
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(req);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const studentUserId = session.user.sub;
    
    // Verify student role
    const roleResult = await executeQuery(
      'SELECT user_role FROM user_profiles WHERE user_id = $1',
      [studentUserId]
    );
    
    if (roleResult.length === 0 || roleResult[0].user_role !== 'student') {
      return NextResponse.json({ error: 'Not authorized - student role required' }, { status: 403 });
    }
    
    const body = await request.json();
    const {
      assessmentData,
      calculatedScores,
      matrixScores,
      readinessZones,
      overallStage,
      totalScore,
      areaScores,
      assessmentSessionId
    } = body;
    
    // Validate required fields
    if (!assessmentData || !matrixScores || !readinessZones || !overallStage || !totalScore) {
      return NextResponse.json({ 
        error: 'Missing required assessment data' 
      }, { status: 400 });
    }
    
    // No longer need counselor assignment - all counselors can see all assessments
    
    // Generate unique session ID if not provided
    const sessionId = assessmentSessionId || `assessment_${Date.now()}_${studentUserId}`;
    
    // Save assessment to database
    const insertResult = await executeQuery(`
      INSERT INTO counselor_assessments (
        student_user_id,
        assessment_session_id,
        assessment_data,
        calculated_scores,
        matrix_scores,
        readiness_zones,
        overall_stage,
        total_score,
        area_scores
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (student_user_id, assessment_session_id) 
      DO UPDATE SET
        assessment_data = EXCLUDED.assessment_data,
        calculated_scores = EXCLUDED.calculated_scores,
        matrix_scores = EXCLUDED.matrix_scores,
        readiness_zones = EXCLUDED.readiness_zones,
        overall_stage = EXCLUDED.overall_stage,
        total_score = EXCLUDED.total_score,
        area_scores = EXCLUDED.area_scores,
        updated_at = NOW()
      RETURNING id, assessment_date
    `, [
      studentUserId,
      sessionId,
      JSON.stringify(assessmentData),
      JSON.stringify(calculatedScores || {}),
      JSON.stringify(matrixScores),
      JSON.stringify(readinessZones),
      overallStage,
      totalScore,
      JSON.stringify(areaScores || {})
    ]);
    
    console.log('✅ Assessment saved successfully:', {
      studentId: studentUserId,
      sessionId,
      totalScore,
      stage: overallStage
    });
    
    return NextResponse.json({
      success: true,
      assessmentId: insertResult[0].id,
      assessmentDate: insertResult[0].assessment_date,
      sessionId
    });
    
  } catch (error) {
    console.error('Error saving counselor assessment:', error);
    return NextResponse.json(
      { error: 'Failed to save assessment' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve assessment history for a student
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(req);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const studentUserId = session.user.sub;
    
    // Get assessment history for this student
    const assessments = await executeQuery(`
      SELECT 
        id,
        assessment_session_id,
        matrix_scores,
        readiness_zones,
        overall_stage,
        total_score,
        area_scores,
        assessment_date,
        created_at
      FROM counselor_assessments 
      WHERE student_user_id = $1
      ORDER BY assessment_date DESC
      LIMIT 10
    `, [studentUserId]);
    
    return NextResponse.json({
      success: true,
      assessments: assessments.map(assessment => ({
        id: assessment.id,
        sessionId: assessment.assessment_session_id,
        matrixScores: assessment.matrix_scores,
        readinessZones: assessment.readiness_zones,
        overallStage: assessment.overall_stage,
        totalScore: assessment.total_score,
        areaScores: assessment.area_scores,
        assessmentDate: assessment.assessment_date,
        createdAt: assessment.created_at
      }))
    });
    
  } catch (error) {
    console.error('Error fetching assessment history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment history' },
      { status: 500 }
    );
  }
}
