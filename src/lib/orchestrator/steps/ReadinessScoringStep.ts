import { Step, StepState } from '../orchestrator';

export class ReadinessScoringStep implements Step {
  name = 'ReadinessScoring';
  retryable = false;

  async execute(state: StepState): Promise<StepState> {
    console.log('🧮 Calculating readiness scores...');
    
    const { assessmentData } = state;
    
    if (!assessmentData) {
      throw new Error('Assessment data not available for scoring');
    }

    // Extract readiness zones from assessment data
    const readinessScores = {
      clarity: assessmentData.clarity,
      engagement: assessmentData.engagement,
      preparation: assessmentData.preparation,
      support: assessmentData.support
    };

    const stage = assessmentData.stage;

    // Validate readiness zones are valid
    const validZones = ['Development', 'Balanced', 'Proficiency'];
    const validStages = ['Early', 'Mid', 'Late'];

    for (const [key, value] of Object.entries(readinessScores)) {
      if (!validZones.includes(value)) {
        throw new Error(`Invalid readiness zone for ${key}: ${value}`);
      }
    }

    if (!validStages.includes(stage)) {
      throw new Error(`Invalid stage: ${stage}`);
    }

    // Update state with processed scores
    state.readinessScores = readinessScores;
    state.stage = stage;

    console.log('✅ Readiness scores calculated:', {
      stage,
      readinessScores,
      userPreferences: state.userPreferences
    });

    return state;
  }

  validate(state: StepState): boolean {
    const isValid = !!(
      state.readinessScores &&
      state.stage &&
      state.readinessScores.clarity &&
      state.readinessScores.engagement &&
      state.readinessScores.preparation &&
      state.readinessScores.support
    );

    if (!isValid) {
      console.error('❌ ReadinessScoring validation failed: Missing required scores');
    }

    return isValid;
  }
}

