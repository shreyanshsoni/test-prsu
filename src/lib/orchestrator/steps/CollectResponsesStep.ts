import { Step, StepState } from '../orchestrator';

export class CollectResponsesStep implements Step {
  name = 'CollectResponses';
  retryable = false;

  async execute(state: StepState): Promise<StepState> {
    console.log('📝 Collecting user responses...');
    
    // This step is a stub since the frontend already collects responses
    // The assessmentData should already be populated in the state
    if (!state.assessmentData) {
      throw new Error('Assessment data not provided');
    }

    console.log('✅ User responses collected:', {
      hasAssessmentData: !!state.assessmentData,
      hasUserPreferences: !!state.userPreferences,
      stage: state.assessmentData.stage,
      readinessZones: {
        clarity: state.assessmentData.clarity,
        engagement: state.assessmentData.engagement,
        preparation: state.assessmentData.preparation,
        support: state.assessmentData.support
      }
    });

    return state;
  }

  validate(state: StepState): boolean {
    const isValid = !!(
      state.assessmentData &&
      state.assessmentData.stage &&
      state.assessmentData.clarity &&
      state.assessmentData.engagement &&
      state.assessmentData.preparation &&
      state.assessmentData.support
    );

    if (!isValid) {
      console.error('❌ CollectResponses validation failed: Missing required assessment data');
    }

    return isValid;
  }
}

