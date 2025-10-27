import { Step, StepState } from '../orchestrator';

export class ReadinessScoringStep implements Step {
  name = 'ReadinessScoring';
  retryable = false;

  async execute(state: StepState): Promise<StepState> {
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

    // Calculate matrix scores (numeric values for counselor view)
    const matrixScores = {
      clarity: this.zoneToScore(assessmentData.clarity),
      engagement: this.zoneToScore(assessmentData.engagement),
      preparation: this.zoneToScore(assessmentData.preparation),
      support: this.zoneToScore(assessmentData.support)
    };

    // Calculate total score (sum of all matrix scores * 4 for 1200 max)
    // Max possible: 75 + 75 + 75 + 75 = 300, then 300 * 4 = 1200
    const totalScore = Object.values(matrixScores).reduce((sum, score) => sum + score, 0) * 4;

    // Store calculated scores in state for potential saving
    state.readinessScores = readinessScores;
    state.stage = stage;
    state.matrixScores = matrixScores;
    state.totalScore = totalScore;
    state.assessmentSessionId = `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return state;
  }

  // Helper method to convert readiness zones to numeric scores
  private zoneToScore(zone: string): number {
    switch (zone) {
      case 'Development': return 25;  // 0-33%
      case 'Balanced': return 50;     // 34-66%
      case 'Proficiency': return 75;  // 67-100%
      default: return 25;
    }
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

    return isValid;
  }
}

