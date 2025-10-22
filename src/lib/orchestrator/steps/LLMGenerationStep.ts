import { Step, StepState } from '../orchestrator';

export class LLMGenerationStep implements Step {
  name = 'LLMGeneration';
  retryable = true;
  maxRetries = 2;

  async execute(state: StepState): Promise<StepState> {
    console.log('🤖 Calling LLM API...');
    
    const { systemPrompt } = state;
    
    if (!systemPrompt) {
      throw new Error('System prompt not available for LLM generation');
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "moonshotai/kimi-k2    ",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LLM API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const rawLlmResponse = data.choices?.[0]?.message?.content || "{}";
      
      state.rawLlmResponse = rawLlmResponse;
      state.llmResponse = data;

      console.log('✅ LLM API call successful:', {
        model: data.model,
        usage: data.usage,
        responseLength: rawLlmResponse.length,
        hasChoices: !!data.choices?.length
      });

      return state;

    } catch (error) {
      console.error('❌ LLM API call failed:', error);
      
      // Determine specific error type for better retry logic
      if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('network')) {
          throw new Error('Network error: Unable to connect to AI service');
        } else if (error.message.includes('timeout')) {
          throw new Error('Request timeout: AI service took too long to respond');
        } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
          throw new Error('Rate limit exceeded: AI service usage limit reached');
        } else if (error.message.includes('authentication') || error.message.includes('API key')) {
          throw new Error('Authentication error: Invalid API configuration');
        }
      }
      
      throw error;
    }
  }

  validate(state: StepState): boolean {
    const isValid = !!(
      state.rawLlmResponse &&
      state.llmResponse &&
      state.rawLlmResponse.length > 0 &&
      state.llmResponse.choices &&
      state.llmResponse.choices.length > 0
    );

    if (!isValid) {
      console.error('❌ LLMGeneration validation failed: Invalid LLM response');
    }

    return isValid;
  }
}

