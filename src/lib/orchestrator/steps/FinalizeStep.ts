import { Step, StepState } from '../orchestrator';

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

    console.log('✅ Roadmap finalized:', {
      hasCareerBlurb: !!finalizedRoadmap.career_blurb,
      hasScoresSummary: !!finalizedRoadmap.scores_summary,
      phaseCount: finalizedRoadmap.roadmap?.length || 0,
      hasError: !!finalizedRoadmap.error,
      generatedAt: finalizedRoadmap.generated_at
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

