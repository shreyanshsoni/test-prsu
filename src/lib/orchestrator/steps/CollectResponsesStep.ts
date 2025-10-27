import { Step, StepState } from '../orchestrator';

export class CollectResponsesStep implements Step {
  name = 'CollectResponses';
  retryable = false;

  async execute(state: StepState): Promise<StepState> {
    // This step is a stub since the frontend already collects responses
    // The assessmentData should already be populated in the state
    if (!state.assessmentData) {
      throw new Error('Assessment data not provided');
    }

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

    return isValid;
  }
}

