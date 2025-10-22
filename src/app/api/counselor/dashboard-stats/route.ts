import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * GET /api/counselor/dashboard-stats
 * Get real-time dashboard statistics for counselor view
 */
export async function GET(req: NextRequest) {
  try {
    console.log('📊 Fetching real-time dashboard statistics...');
    
    // Get all students with their roadmap completion data
    const { rows: studentRows } = await sql`
      SELECT 
        up.user_id,
        up.display_name,
        up.profile_data,
        up.created_at,
        up.updated_at,
        COUNT(rp.id) as total_roadmaps,
        COUNT(CASE WHEN rp.completion_status = 'completed' THEN 1 END) as completed_roadmaps,
        COUNT(CASE WHEN rp.completion_status = 'in_progress' THEN 1 END) as in_progress_roadmaps,
        COUNT(CASE WHEN rp.completion_status = 'paused' THEN 1 END) as paused_roadmaps,
        COUNT(CASE WHEN rp.completion_status = 'cancelled' THEN 1 END) as cancelled_roadmaps
      FROM user_profiles up
      LEFT JOIN roadmap_planners rp ON up.user_id = rp.user_id
      WHERE up.user_role = 'student'
      GROUP BY up.user_id, up.display_name, up.profile_data, up.created_at, up.updated_at
      ORDER BY up.created_at DESC
    `;
    
    // Get phase completion statistics
    const { rows: phaseStats } = await sql`
      SELECT 
        COUNT(*) as total_phases,
        COUNT(CASE WHEN completion_status = 'completed' THEN 1 END) as completed_phases,
        COUNT(CASE WHEN completion_status = 'in_progress' THEN 1 END) as in_progress_phases
      FROM roadmap_phases
    `;
    
    // Get task completion statistics
    const { rows: taskStats } = await sql`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN completion_status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN completed = true THEN 1 END) as old_completed_tasks,
        COUNT(CASE WHEN completion_status = 'in_progress' THEN 1 END) as in_progress_tasks
      FROM roadmap_tasks
    `;
    
    // Get readiness assessment statistics
    const { rows: assessmentStats } = await sql`
      SELECT 
        COUNT(*) as total_assessments,
        AVG(total_score) as average_total_score,
        COUNT(CASE WHEN overall_stage = 'Early' THEN 1 END) as early_stage_count,
        COUNT(CASE WHEN overall_stage = 'Mid' THEN 1 END) as mid_stage_count,
        COUNT(CASE WHEN overall_stage = 'Late' THEN 1 END) as late_stage_count
      FROM counselor_assessments
    `;
    
    // Get actual matrix scores from assessments for proper calculation
    // STEP 1: Calculate average per student (unbiased approach)
    const { rows: perStudentAverages } = await sql`
      SELECT 
        student_user_id,
        AVG(
          CASE 
            WHEN matrix_scores::text LIKE '%"clarity"%' 
            THEN CAST(matrix_scores->>'clarity' AS INTEGER)
            ELSE NULL 
          END
        ) AS avg_clarity,
        AVG(
          CASE 
            WHEN matrix_scores::text LIKE '%"engagement"%' 
            THEN CAST(matrix_scores->>'engagement' AS INTEGER)
            ELSE NULL 
          END
        ) AS avg_engagement,
        AVG(
          CASE 
            WHEN matrix_scores::text LIKE '%"preparation"%' 
            THEN CAST(matrix_scores->>'preparation' AS INTEGER)
            ELSE NULL 
          END
        ) AS avg_preparation,
        AVG(
          CASE 
            WHEN matrix_scores::text LIKE '%"support"%' 
            THEN CAST(matrix_scores->>'support' AS INTEGER)
            ELSE NULL 
          END
        ) AS avg_support
      FROM counselor_assessments
      WHERE matrix_scores IS NOT NULL
      GROUP BY student_user_id
    `;
    
    // Get assessment stages for all students in one query
    const { rows: allStudentStages } = await sql`
      SELECT 
        student_user_id,
        AVG(
          CASE 
            WHEN overall_stage = 'Early' THEN 1
            WHEN overall_stage = 'Mid' THEN 2
            WHEN overall_stage = 'Late' THEN 3
            ELSE 1
          END
        ) AS avg_stage_numeric
      FROM counselor_assessments
      WHERE overall_stage IS NOT NULL
      GROUP BY student_user_id
    `;
    
    // Create a map for quick lookup
    const studentStageMap = new Map();
    allStudentStages.forEach(row => {
      const avgStage = row.avg_stage_numeric;
      let stage = 'Early';
      if (avgStage >= 2.5) stage = 'Late';
      else if (avgStage >= 1.5) stage = 'Mid';
      studentStageMap.set(row.student_user_id, stage);
    });
    
    // Calculate individual student progress percentages
    const studentsWithProgress = studentRows.map(student => {
      const totalRoadmaps = parseInt(student.total_roadmaps) || 0;
      const completedRoadmaps = parseInt(student.completed_roadmaps) || 0;
      const progressPercentage = totalRoadmaps > 0 ? Math.round((completedRoadmaps / totalRoadmaps) * 100) : 0;
      
      // Calculate stage based on roadmap completion percentage
      let roadmapStage = 'Early';
      if (progressPercentage >= 80) roadmapStage = 'Late';      // 80-100% completion
      else if (progressPercentage >= 40) roadmapStage = 'Mid';  // 40-79% completion
      else roadmapStage = 'Early';                               // 0-39% completion
      
      // Extract additional info from profile_data if available
      let grade = null;
      let collegeGoal = null;
      let matrixScores = null;
      
      try {
        if (student.profile_data) {
          const profileData = typeof student.profile_data === 'string' 
            ? JSON.parse(student.profile_data) 
            : student.profile_data;
          grade = profileData.gradeLevel || profileData.grade || null;
          collegeGoal = profileData.college_goal || profileData.collegeGoal || null;
          matrixScores = profileData.matrix_scores || profileData.matrixScores || null;
        }
      } catch (error) {
        console.warn('Error parsing profile data for student:', student.user_id, error);
      }
      
      return {
        id: student.user_id,
        name: student.display_name || 'Unknown Student',
        grade: grade,
        collegeGoal: collegeGoal,
        progress: progressPercentage,
        totalRoadmaps: totalRoadmaps,
        completedRoadmaps: completedRoadmaps,
        inProgressRoadmaps: parseInt(student.in_progress_roadmaps) || 0,
        pausedRoadmaps: parseInt(student.paused_roadmaps) || 0,
        cancelledRoadmaps: parseInt(student.cancelled_roadmaps) || 0,
        matrixScores: matrixScores,
        roadmapStage, // NEW: Roadmap completion-based stage
        createdAt: student.created_at,
        updatedAt: student.updated_at
      };
    });
    
    // Calculate overall statistics
    const totalStudents = studentsWithProgress.length;
    const averageProgress = totalStudents > 0 
      ? Math.round(studentsWithProgress.reduce((sum, student) => sum + student.progress, 0) / totalStudents)
      : 0;
    
    // Calculate stage distribution based on assessment data (unbiased approach)
    // STEP 1: Get average stage per student from assessments
    const { rows: studentStageAverages } = await sql`
      SELECT 
        student_user_id,
        AVG(
          CASE 
            WHEN overall_stage = 'Early' THEN 1
            WHEN overall_stage = 'Mid' THEN 2
            WHEN overall_stage = 'Late' THEN 3
            ELSE 1
          END
        ) AS avg_stage_numeric
      FROM counselor_assessments
      WHERE overall_stage IS NOT NULL
      GROUP BY student_user_id
    `;
    
    // STEP 2: Convert numeric averages back to stage categories
    const stageDistribution = studentStageAverages.reduce((acc, student) => {
      const avgStage = student.avg_stage_numeric;
      if (avgStage >= 2.5) acc.Late++;      // 2.5-3.0 = Late
      else if (avgStage >= 1.5) acc.Mid++;  // 1.5-2.4 = Mid
      else acc.Early++;                      // 1.0-1.4 = Early
      return acc;
    }, { Early: 0, Mid: 0, Late: 0 });
    
    // Convert to percentages (only count students with assessment data)
    const studentsWithAssessments = allStudentStages.length;
    Object.keys(stageDistribution).forEach(key => {
      stageDistribution[key] = studentsWithAssessments > 0 ? Math.round((stageDistribution[key] / studentsWithAssessments) * 100) : 0;
    });
    
    // Calculate average matrix scores using unbiased approach (each student counts equally)
    let averageMatrix = { clarity: 0, engagement: 0, preparation: 0, support: 0 };
    
    if (perStudentAverages.length > 0) {
      // STEP 2: Average across students (final unbiased average)
      const totalScores = perStudentAverages.reduce((acc, student) => {
        acc.clarity += parseFloat(student.avg_clarity) || 0;
        acc.engagement += parseFloat(student.avg_engagement) || 0;
        acc.preparation += parseFloat(student.avg_preparation) || 0;
        acc.support += parseFloat(student.avg_support) || 0;
        return acc;
      }, { clarity: 0, engagement: 0, preparation: 0, support: 0 });
      
      const studentCount = perStudentAverages.length;
      averageMatrix = {
        clarity: Math.min(Math.round(totalScores.clarity / studentCount), 100),
        engagement: Math.min(Math.round(totalScores.engagement / studentCount), 100),
        preparation: Math.min(Math.round(totalScores.preparation / studentCount), 100),
        support: Math.min(Math.round(totalScores.support / studentCount), 100)
      };
    }
    
    // Get top performers and at-risk students
    const topPerformers = [...studentsWithProgress]
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5);
    
    const atRiskStudents = studentsWithProgress.filter(student => student.progress < 30);
    
    console.log('📊 Dashboard statistics calculated:', {
      totalStudents,
      averageProgress,
      stageDistribution,
      phaseStats: phaseStats[0],
      taskStats: taskStats[0],
      assessmentStats: assessmentStats[0],
      perStudentAverages: perStudentAverages.length,
      averageMatrix,
      studentsWithAssessmentStages: studentsWithProgress.filter(s => s.assessmentStage !== 'Early').length
    });
    
    return NextResponse.json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      stats: {
        averageProgress,
        stageDistribution,
        averageMatrix,
        topPerformers,
        atRiskStudents,
        students: studentsWithProgress
      },
      summary: {
        totalStudents,
        totalRoadmaps: studentRows.reduce((sum, student) => sum + parseInt(student.total_roadmaps), 0),
        completedRoadmaps: studentRows.reduce((sum, student) => sum + parseInt(student.completed_roadmaps), 0),
        totalPhases: parseInt(phaseStats[0]?.total_phases) || 0,
        completedPhases: parseInt(phaseStats[0]?.completed_phases) || 0,
        totalTasks: parseInt(taskStats[0]?.total_tasks) || 0,
        completedTasks: parseInt(taskStats[0]?.completed_tasks) || 0,
        totalAssessments: parseInt(assessmentStats[0]?.total_assessments) || 0,
        averageAssessmentScore: Math.round(assessmentStats[0]?.average_total_score) || 0
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching dashboard statistics:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch dashboard statistics', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
