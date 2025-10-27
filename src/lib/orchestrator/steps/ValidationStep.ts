import { Step, StepState } from '../orchestrator';

export class ValidationStep implements Step {
  name = 'Validation';
  retryable = false;

  async execute(state: StepState): Promise<StepState> {
    const { rawLlmResponse } = state;
    
    if (!rawLlmResponse) {
      throw new Error('Raw LLM response not available for validation');
    }

    try {
      // Clean the JSON string - remove any text before or after JSON
      let cleanedJson = rawLlmResponse.trim();
      
      // Try to extract JSON if there's extra text
      const jsonMatch = cleanedJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedJson = jsonMatch[0];
      }
      
      // Parse JSON
      const parsed = JSON.parse(cleanedJson);
      
      // Validate structure for new format
      if (!parsed.career_blurb || !parsed.scores_summary || !parsed.roadmap || !Array.isArray(parsed.roadmap)) {
        throw new Error('Invalid JSON structure from LLM - missing required fields');
      }
      
      // Validate scores_summary structure
      if (!parsed.scores_summary.Clarity || !parsed.scores_summary.Engagement || 
          !parsed.scores_summary.Preparation || !parsed.scores_summary.Support || 
          !parsed.scores_summary.overall_stage) {
        throw new Error('Invalid JSON structure from LLM - missing scores_summary fields');
      }
      
      // Validate roadmap structure
      if (parsed.roadmap.length !== 4) {
        throw new Error('Invalid JSON structure from LLM - roadmap must have exactly 4 phases');
      }

      // Validate each phase has required fields
      for (let i = 0; i < parsed.roadmap.length; i++) {
        const phase = parsed.roadmap[i];
        if (!phase.phase || !phase.timeline || !phase.tasks || !phase.reflection) {
          throw new Error(`Invalid phase structure at index ${i} - missing required fields`);
        }
        if (!Array.isArray(phase.tasks) || phase.tasks.length < 3 || phase.tasks.length > 4) {
          throw new Error(`Invalid phase at index ${i} - tasks must be array with 3-4 items`);
        }
      }
      
      // Update state with validated roadmap
      state.roadmap = parsed;

      return state;

    } catch (parseError) {
      // Return fallback structure with error info
      state.roadmap = {
        career_blurb: "Unable to generate personalized roadmap. Please try again.",
        scores_summary: {
          Clarity: "Development",
          Engagement: "Development", 
          Preparation: "Development",
          Support: "Development",
          overall_stage: "Early"
        },
        roadmap: [],
        error: "Invalid JSON response from AI service"
      };

      return state;
    }
  }

  validate(state: StepState): boolean {
    const isValid = !!(
      state.roadmap &&
      state.roadmap.career_blurb &&
      state.roadmap.scores_summary &&
      state.roadmap.roadmap &&
      Array.isArray(state.roadmap.roadmap)
    );

    return isValid;
  }
}

