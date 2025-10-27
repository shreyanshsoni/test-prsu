/**
 * Orchestrator Pattern for LLM Workflow
 * Manages sequential execution of steps with shared state and validation
 */

export interface StepState {
  // Input data
  assessmentData?: any;
  userPreferences?: any;
  
  // Processed data
  readinessScores?: {
    clarity: string;
    engagement: string;
    preparation: string;
    support: string;
  };
  stage?: string;
  matrixScores?: {
    clarity: number;
    engagement: number;
    preparation: number;
    support: number;
  };
  totalScore?: number;
  assessmentSessionId?: string;
  
  // LLM data
  systemPrompt?: string;
  llmResponse?: any;
  rawLlmResponse?: string;
  
  // Final output
  roadmap?: any;
  error?: string;
  
  // Metadata
  stepHistory: string[];
  startTime: number;
  endTime?: number;
}

export interface Step {
  name: string;
  execute(state: StepState): Promise<StepState>;
  validate(state: StepState): boolean;
  retryable?: boolean;
  maxRetries?: number;
}

export class Orchestrator {
  private steps: Step[] = [];
  private state: StepState;

  constructor(initialState: Partial<StepState> = {}) {
    this.state = {
      stepHistory: [],
      startTime: Date.now(),
      ...initialState
    };
  }

  addStep(step: Step): Orchestrator {
    this.steps.push(step);
    return this;
  }

  async run(): Promise<StepState> {
    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      const stepStartTime = Date.now();
      
      try {
        // Execute the step
        this.state = await step.execute(this.state);
        this.state.stepHistory.push(step.name);
        
        // Validate the step output
        if (!step.validate(this.state)) {
          throw new Error(`Validation failed for step: ${step.name}`);
        }
        
      } catch (error) {
        // Handle retryable steps
        if (step.retryable && step.maxRetries && step.maxRetries > 0) {
          step.maxRetries--;
          i--; // Retry the same step
          continue;
        }
        
        // Mark state with error and stop execution
        this.state.error = error instanceof Error ? error.message : String(error);
        this.state.endTime = Date.now();
        break;
      }
    }
    
    this.state.endTime = Date.now();
    
    return this.state;
  }

  getState(): StepState {
    return this.state;
  }
}

