import { Step, StepState } from '../orchestrator';
import { executeQuery } from '../../db';

export class FinalizeStep implements Step {
  name = 'Finalize';
  retryable = false;

  async execute(state: StepState): Promise<StepState> {
    console.log('🎯 Finalizing roadmap output...');
    
    const { roadmap } = state;
    
    if (!roadmap) {
      throw new Error('Roadmap not available for finalization');
    }

    // Ensure the roadmap has the correct structure for the frontend
    const finalizedRoadmap = {
      ...roadmap,
      // Add any final processing or formatting here if needed
      success: true,
      generated_at: new Date().toISOString()
    };

    state.roadmap = finalizedRoadmap;

    // Save assessment scores to database only if roadmap generation was successful
    if (finalizedRoadmap.success && state.matrixScores && state.totalScore) {
      try {
        console.log('💾 Saving assessment scores to database...');
        
        // Get student user ID from assessment data
        const studentUserId = state.assessmentData?.user_id || state.assessmentData?.userId;
        
        if (!studentUserId) {
          console.warn('⚠️ No student user ID found, skipping score save');
        } else {
          // Generate unique session ID if not provided
          const sessionId = state.assessmentSessionId || `assessment_${Date.now()}_${studentUserId}`;
          
          // Save assessment to database directly
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
            JSON.stringify(state.assessmentData),
            JSON.stringify(state.readinessScores || {}),
            JSON.stringify(state.matrixScores),
            JSON.stringify(state.readinessScores),
            state.stage,
            state.totalScore,
            JSON.stringify(state.matrixScores)
          ]);

          console.log('✅ Assessment scores saved successfully:', {
            assessmentId: insertResult[0].id,
            sessionId,
            totalScore: state.totalScore,
            stage: state.stage
          });
        }
      } catch (error) {
        console.error('❌ Error saving assessment scores:', error);
        // Don't fail the entire process if score saving fails
      }
    }

    console.log('✅ Roadmap finalized:', {
      hasCareerBlurb: !!finalizedRoadmap.career_blurb,
      hasScoresSummary: !!finalizedRoadmap.scores_summary,
      phaseCount: finalizedRoadmap.roadmap?.length || 0,
      hasError: !!finalizedRoadmap.error,
      generatedAt: finalizedRoadmap.generated_at,
      scoresSaved: !!(state.matrixScores && state.totalScore)
    });

    return state;
  }

  validate(state: StepState): boolean {
    const isValid = !!(
      state.roadmap &&
      state.roadmap.career_blurb &&
      state.roadmap.scores_summary &&
      state.roadmap.roadmap &&
      Array.isArray(state.roadmap.roadmap)
    );

    if (!isValid) {
      console.error('❌ Finalize validation failed: Invalid finalized roadmap');
    }

    return isValid;
  }
}

