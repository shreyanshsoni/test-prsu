import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';
import { executeQuery } from '../../../lib/db';

// GET endpoint to fetch students assigned to the current counselor
export async function GET(request: NextRequest) {
  try {
    console.log('Starting counselor-students API request...');
    const session = await getSession(request);
    
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

    const counselorInstituteId: number | null = counselorProfile[0].institute_id || null;
    
    // First, automatically assign students from counselor's institute to this counselor if none are assigned
    if (counselorInstituteId !== null) {
      const existingAssignments = await executeQuery(`
        SELECT COUNT(*) as count FROM counselor_student_assignments 
        WHERE counselor_user_id = $1 AND is_active = true
      `, [counselorUserId]);
      
      if (existingAssignments[0].count === '0') {
        // Auto-assign students from counselor's institute to this counselor
        const instituteStudents = await executeQuery(`
          SELECT user_id FROM user_profiles 
          WHERE user_role = 'student' AND institute_id = $1
        `, [counselorInstituteId]);
        
        for (const student of instituteStudents) {
          await executeQuery(`
            INSERT INTO counselor_student_assignments (counselor_user_id, student_user_id) 
            VALUES ($1, $2)
            ON CONFLICT (counselor_user_id, student_user_id) 
            DO UPDATE SET is_active = true, assigned_at = NOW()
          `, [counselorUserId, student.user_id]);
        }
      } else {
        // Check for any unassigned students from counselor's institute and assign them
        const unassignedStudents = await executeQuery(`
          SELECT up.user_id 
          FROM user_profiles up
          WHERE up.user_role = 'student'
            AND up.institute_id = $1
            AND NOT EXISTS (
              SELECT 1 FROM counselor_student_assignments csa 
              WHERE csa.student_user_id = up.user_id 
              AND csa.is_active = true
            )
        `, [counselorInstituteId]);
        
        for (const student of unassignedStudents) {
          await executeQuery(`
            INSERT INTO counselor_student_assignments (counselor_user_id, student_user_id) 
            VALUES ($1, $2)
            ON CONFLICT (counselor_user_id, student_user_id) 
            DO UPDATE SET is_active = true, assigned_at = NOW()
          `, [counselorUserId, student.user_id]);
        }
      }
    }
    
    // Get students from counselor's institute with their roadmap completion data
    let students;
    try {
      // Build query with optional institute filter
      let whereClause = "WHERE up.user_role = 'student'";
      const queryParams: any[] = [];
      
      if (counselorInstituteId !== null) {
        whereClause += " AND up.institute_id = $1";
        queryParams.push(counselorInstituteId);
      }
      
      students = await executeQuery(`
        SELECT 
          up.user_id as id,
          up.profile_data,
          up.display_name,
          up.first_name,
          up.last_name,
          up.created_at as student_created_at,
          up.updated_at as student_updated_at,
          COUNT(DISTINCT rp.id) as total_roadmaps,
          COUNT(DISTINCT CASE WHEN rp.completion_status = 'completed' THEN rp.id END) as completed_roadmaps,
          COUNT(DISTINCT CASE WHEN rp.completion_status = 'in_progress' THEN rp.id END) as in_progress_roadmaps,
          COUNT(DISTINCT CASE WHEN rp.completion_status = 'paused' THEN rp.id END) as paused_roadmaps,
          COUNT(DISTINCT CASE WHEN rp.completion_status = 'cancelled' THEN rp.id END) as cancelled_roadmaps,
          MAX(rp.recent_activity) as most_recent_roadmap_activity,
          COUNT(DISTINCT rt.id) as total_tasks,
          COUNT(DISTINCT CASE WHEN rt.completed = true THEN rt.id END) as completed_tasks
        FROM user_profiles up
        LEFT JOIN roadmap_planners rp ON up.user_id = rp.user_id
        LEFT JOIN roadmap_phases rph ON rp.id = rph.roadmap_id
        LEFT JOIN roadmap_tasks rt ON rph.id = rt.phase_id
        ${whereClause}
        GROUP BY up.user_id, up.profile_data, up.display_name, up.first_name, up.last_name, up.created_at, up.updated_at
        ORDER BY up.user_id
      `, queryParams);
    } catch (dbError) {
      console.error('Database query error:', dbError);
      throw dbError;
    }
    
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
        
        // Score history locked - no need to fetch assessment history
        const historyResult: any[] = [];
        
        // Get ALL assessments for matrix score averaging
        const allAssessmentsResult = await executeQuery(`
          SELECT 
            matrix_scores
          FROM counselor_assessments 
          WHERE student_user_id = $1 
          AND matrix_scores IS NOT NULL
          ORDER BY assessment_date DESC
        `, [student.id]);
        
        // Get user goals for this student
        const goalsResult = await executeQuery(`
          SELECT 
            id,
            title,
            description,
            due_date,
            category,
            completed,
            priority,
            created_at,
            updated_at
          FROM user_goals 
          WHERE user_id = $1 
          ORDER BY created_at DESC
        `, [student.id]);
        
        // Get counselor notes for this student
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
          LIMIT 10
        `, [student.id]);
        
        return {
          ...student,
          latestAssessment: assessmentResult[0] || null,
          assessmentHistory: historyResult,
          allAssessments: allAssessmentsResult,
          goals: goalsResult,
          notes: notesResult
        };
      })
    );
    
    // Transform data to match Student interface
    const transformedStudents = await Promise.all(
      studentsWithAssessments.map(async (student) => {
        const profileData = student.profile_data || {};
        const assessment = student.latestAssessment;
        
        // Use first_name and last_name from database, fallback to display_name, then 'Student'
        const name = (student.first_name && student.last_name) 
          ? `${student.first_name} ${student.last_name}`
          : student.display_name || 'Student';
      
      const grade = profileData.gradeLevel ? parseInt(profileData.gradeLevel) : null;
      const collegeGoal = profileData.collegeGoals?.[0] || 'Not specified';
      
      // Calculate last activity (days since most recent roadmap activity)
      let lastActivity = 0;
      if (student.most_recent_roadmap_activity) {
        const lastRoadmapActivity = new Date(student.most_recent_roadmap_activity);
        const now = new Date();
        lastActivity = Math.floor((now.getTime() - lastRoadmapActivity.getTime()) / (1000 * 60 * 60 * 24));
      } else {
        // If no roadmap activity, use profile creation date as fallback
        const profileCreated = new Date(student.student_created_at);
        const now = new Date();
        lastActivity = Math.floor((now.getTime() - profileCreated.getTime()) / (1000 * 60 * 60 * 24));
      }
      
      // Calculate average matrix scores from all assessments
      let matrixScores = {
        clarity: 0,
        engagement: 0,
        preparation: 0,
        support: 0
      };
      
      if (student.allAssessments && student.allAssessments.length > 0) {
        // Calculate averages for each matrix dimension
        const totalAssessments = student.allAssessments.length;
        
        student.allAssessments.forEach((assessment: any) => {
          if (assessment.matrix_scores) {
            matrixScores.clarity += assessment.matrix_scores.clarity || 0;
            matrixScores.engagement += assessment.matrix_scores.engagement || 0;
            matrixScores.preparation += assessment.matrix_scores.preparation || 0;
            matrixScores.support += assessment.matrix_scores.support || 0;
          }
        });
        
        // Calculate averages
        matrixScores.clarity = Math.round(matrixScores.clarity / totalAssessments);
        matrixScores.engagement = Math.round(matrixScores.engagement / totalAssessments);
        matrixScores.preparation = Math.round(matrixScores.preparation / totalAssessments);
        matrixScores.support = Math.round(matrixScores.support / totalAssessments);
      }
      
      // Calculate roadmap completion progress
      const totalRoadmaps = parseInt(student.total_roadmaps) || 0;
      const completedRoadmaps = parseInt(student.completed_roadmaps) || 0;
      
      let progress;
      let roadmapStage;
      
      if (totalRoadmaps === 0) {
        progress = 'No roadmap';
        roadmapStage = 'Early'; // Consider no roadmap as Early stage
      } else {
        progress = Math.round((completedRoadmaps / totalRoadmaps) * 100);
        
        // Determine roadmap stage based on completion percentage
        if (progress >= 80) roadmapStage = 'Late';
        else if (progress >= 40) roadmapStage = 'Mid';
        else roadmapStage = 'Early';
      }
      
      // Determine status based on progress and activity
      let status: 'On Track' | 'Needs Attention' | 'At Risk' = 'On Track';
      if (progress === 'No roadmap') {
        status = 'Needs Attention';
      } else if (typeof progress === 'number') {
        if (progress < 30 || lastActivity > 30) {
          status = 'At Risk';
        } else if (progress < 60 || lastActivity > 14) {
          status = 'Needs Attention';
        }
      }
      
      return {
        id: student.id,
        name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        grade,
        collegeGoal,
        lastActivity,
        progress: progress === 'No roadmap' ? 0 : progress,
        progressText: progress,
        roadmapStage,
        status,
        matrixScores,
        roadmapStats: {
          total: totalRoadmaps,
          completed: completedRoadmaps,
          inProgress: parseInt(student.in_progress_roadmaps) || 0,
          paused: parseInt(student.paused_roadmaps) || 0,
          cancelled: parseInt(student.cancelled_roadmaps) || 0
        },
        taskCompletion: {
          total: parseInt(student.total_tasks) || 0,
          completed: parseInt(student.completed_tasks) || 0
        },
        scoreHistory: student.assessmentHistory.map((h: any) => ({
          date: h.date,
          score: Math.round((h.total_score / 1200) * 100)
        })),
        milestones: [
          { id: '1', name: 'Profile Completion', completed: !!profileData.name, dateCompleted: profileData.name ? student.student_created_at : undefined },
          { id: '2', name: 'Assessment Taken', completed: !!assessment, dateCompleted: assessment?.assessment_date },
          { id: '3', name: 'Goals Set', completed: !!profileData.careerGoals?.length, dateCompleted: profileData.careerGoals?.length ? student.student_updated_at : undefined }
        ],
        recentActivity: [
          { id: '1', type: 'activity', description: 'Profile updated', date: student.student_updated_at },
          ...(assessment ? [{ id: '2', type: 'milestone', description: 'Assessment completed', date: assessment.assessment_date }] : [])
        ],
        academicGoals: student.goals.map((goal: any) => ({
          id: goal.id,
          title: goal.title,
          category: goal.category,
          status: goal.completed ? 'Completed' : 'Incomplete',
          dateCreated: goal.created_at,
          dateCompleted: goal.completed ? goal.updated_at : undefined,
          description: goal.description,
          dueDate: goal.due_date,
          priority: goal.priority
        })),
        counselorNotes: (() => {
          const notes = student.notes.map((note: any) => ({
            id: note.id,
            text: note.note_text,
            author: `Ms. ${note.first_name} ${note.last_name}`,
            date: note.created_at,
            updatedAt: note.updated_at,
            counselorUserId: note.counselor_user_id,
            isOwnNote: note.counselor_user_id === counselorUserId
          }));
          
          // Sort notes: own notes first, then others (both by date DESC)
          return notes.sort((a: any, b: any) => {
            // First sort by ownership (own notes first)
            if (a.isOwnNote && !b.isOwnNote) return -1;
            if (!a.isOwnNote && b.isOwnNote) return 1;
            
            // Then sort by date (newest first)
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
        })()
      };
      })
    );
    
    return NextResponse.json({ students: transformedStudents }, { status: 200 });
  } catch (error) {
    console.error('Error fetching counselor students:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { 
        error: 'Failed to fetch students',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
