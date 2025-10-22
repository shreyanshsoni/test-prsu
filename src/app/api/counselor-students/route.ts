import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';
import { executeQuery } from '../../../lib/db';

// GET endpoint to fetch students assigned to the current counselor
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(req);
    
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
    
    // First, automatically assign all students to this counselor if none are assigned
    const existingAssignments = await executeQuery(`
      SELECT COUNT(*) as count FROM counselor_student_assignments 
      WHERE counselor_user_id = $1 AND is_active = true
    `, [counselorUserId]);
    
    if (existingAssignments[0].count === '0') {
      // Auto-assign all students to this counselor
      const allStudents = await executeQuery(`
        SELECT user_id FROM user_profiles WHERE user_role = 'student'
      `);
      
      for (const student of allStudents) {
        await executeQuery(`
          INSERT INTO counselor_student_assignments (counselor_user_id, student_user_id) 
          VALUES ($1, $2)
          ON CONFLICT (counselor_user_id, student_user_id) 
          DO UPDATE SET is_active = true, assigned_at = NOW()
        `, [counselorUserId, student.user_id]);
      }
    } else {
      // Check for any unassigned students and assign them to this counselor
      const unassignedStudents = await executeQuery(`
        SELECT up.user_id 
        FROM user_profiles up
        WHERE up.user_role = 'student'
        AND NOT EXISTS (
          SELECT 1 FROM counselor_student_assignments csa 
          WHERE csa.student_user_id = up.user_id 
          AND csa.is_active = true
        )
      `);
      
      for (const student of unassignedStudents) {
        await executeQuery(`
          INSERT INTO counselor_student_assignments (counselor_user_id, student_user_id) 
          VALUES ($1, $2)
          ON CONFLICT (counselor_user_id, student_user_id) 
          DO UPDATE SET is_active = true, assigned_at = NOW()
        `, [counselorUserId, student.user_id]);
      }
    }
    
    // Get ALL students (not just assigned ones) since all counselors can see all students
    const students = await executeQuery(`
      SELECT 
        up.user_id as id,
        up.profile_data,
        up.display_name,
        up.created_at as student_created_at,
        up.updated_at as student_updated_at
      FROM user_profiles up
      WHERE up.user_role = 'student'
      ORDER BY up.created_at DESC
    `);
    
    // Get latest assessment data for each student
    const studentsWithAssessments = await Promise.all(
      students.map(async (student) => {
        // Get latest assessment for this student
        const assessmentResult = await executeQuery(`
          SELECT 
            matrix_scores,
            readiness_zones,
            overall_stage,
            total_score,
            assessment_date
          FROM counselor_assessments 
          WHERE student_user_id = $1 
          ORDER BY assessment_date DESC 
          LIMIT 1
        `, [student.id]);
        
        // Get assessment history (last 5 assessments)
        const historyResult = await executeQuery(`
          SELECT 
            total_score,
            assessment_date as date
          FROM counselor_assessments 
          WHERE student_user_id = $1 
          ORDER BY assessment_date DESC 
          LIMIT 5
        `, [student.id]);
        
        return {
          ...student,
          latestAssessment: assessmentResult[0] || null,
          assessmentHistory: historyResult
        };
      })
    );
    
    // Transform data to match Student interface
    const transformedStudents = await Promise.all(
      studentsWithAssessments.map(async (student) => {
        const profileData = student.profile_data || {};
        const assessment = student.latestAssessment;
        
        // Use display_name from database (populated by /api/auth/me)
        const name = student.display_name || 'Student';
      
      const grade = profileData.gradeLevel ? parseInt(profileData.gradeLevel) : 10;
      const collegeGoal = profileData.collegeGoals?.[0] || 'Not specified';
      
      // Calculate last activity (days since last update)
      const lastUpdate = new Date(student.student_updated_at);
      const now = new Date();
      const lastActivity = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Use assessment data if available, otherwise use defaults
      const matrixScores = assessment?.matrix_scores || {
        clarity: 50,
        engagement: 50,
        preparation: 50,
        support: 50
      };
      
      const roadmapStage = assessment?.overall_stage || 'Early';
      const progress = assessment ? Math.round((assessment.total_score / 1200) * 100) : 25;
      
      // Determine status based on progress and activity
      let status: 'On Track' | 'Needs Attention' | 'At Risk' = 'On Track';
      if (progress < 30 || lastActivity > 30) {
        status = 'At Risk';
      } else if (progress < 60 || lastActivity > 14) {
        status = 'Needs Attention';
      }
      
      return {
        id: student.id,
        name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        grade,
        collegeGoal,
        lastActivity,
        progress,
        roadmapStage,
        status,
        matrixScores,
        scoreHistory: student.assessmentHistory.map(h => ({
          date: h.date,
          score: Math.round((h.total_score / 1200) * 100)
        })),
        milestones: [
          { id: '1', name: 'Profile Completion', completed: !!profileData.name, dateCompleted: profileData.name ? student.student_created_at : undefined },
          { id: '2', name: 'Assessment Taken', completed: !!assessment, dateCompleted: assessment?.assessment_date },
          { id: '3', name: 'Goals Set', completed: !!profileData.careerGoals?.length, dateCompleted: profileData.careerGoals?.length ? student.student_updated_at : undefined }
        ],
        counselorNotes: '',
        recentActivity: [
          { id: '1', type: 'activity', description: 'Profile updated', date: student.student_updated_at },
          ...(assessment ? [{ id: '2', type: 'milestone', description: 'Assessment completed', date: assessment.assessment_date }] : [])
        ],
        academicGoals: [
          { id: '1', title: 'Complete Profile', category: 'Personal', status: profileData.name ? 'Completed' : 'Incomplete', dateCreated: student.student_created_at, dateCompleted: profileData.name ? student.student_created_at : undefined },
          { id: '2', title: 'Take Assessment', category: 'Academic', status: assessment ? 'Completed' : 'Incomplete', dateCreated: student.student_created_at, dateCompleted: assessment?.assessment_date },
          { id: '3', title: 'Set Career Goals', category: 'Career', status: profileData.careerGoals?.length ? 'Completed' : 'Incomplete', dateCreated: student.student_created_at, dateCompleted: profileData.careerGoals?.length ? student.student_updated_at : undefined }
        ]
      };
      })
    );
    
    return NextResponse.json({ students: transformedStudents }, { status: 200 });
  } catch (error) {
    console.error('Error fetching counselor students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}
