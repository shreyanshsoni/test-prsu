import { NextRequest, NextResponse } from "next/server";
import { Orchestrator } from '../../../lib/orchestrator/orchestrator';
import {
  CollectResponsesStep,
  ReadinessScoringStep,
  PromptBuilderStep,
  LLMGenerationStep,
  ValidationStep,
  FinalizeStep
} from '../../../lib/orchestrator/steps';

/**
 * AI Roadmap Generator API - Orchestrator Pattern
 * Integrates assessment scoring with LLM-powered roadmap generation
 */

export const runtime = 'nodejs';


export async function POST(req: NextRequest) {
  try {
    console.log("🚀 AI Roadmap Generator API called (Orchestrator Pattern)");
    const body = await req.json();
    console.log("📥 Request body:", body);
    
    const { assessmentData } = body;
    
    // Validate assessment data
    if (!assessmentData || !assessmentData.stage) {
      console.error("❌ Invalid assessment data:", assessmentData);
      return NextResponse.json({ 
        error: "Invalid assessment data" 
      }, { status: 400 });
    }

    // Create orchestrator with initial state
    const orchestrator = new Orchestrator({
      assessmentData,
      userPreferences: assessmentData.userPreferences
    });

    // Add all steps to the orchestrator
    orchestrator
      .addStep(new CollectResponsesStep())
      .addStep(new ReadinessScoringStep())
      .addStep(new PromptBuilderStep())
      .addStep(new LLMGenerationStep())
      .addStep(new ValidationStep())
      .addStep(new FinalizeStep());

    // Execute the orchestrator pipeline
    const result = await orchestrator.run();

    // Check if the pipeline completed successfully
    if (result.error) {
      console.error('❌ Orchestrator pipeline failed:', result.error);
      return NextResponse.json({ 
        error: result.error,
        data: result.roadmap // Return fallback roadmap if available
      }, { status: 500 });
    }

    // Return successful result
    console.log("✅ Orchestrator pipeline completed successfully");
    return NextResponse.json({
      success: true,
      data: result.roadmap
    });

  } catch (error) {
    console.error('AI Roadmap Generator Error:', error);
    return NextResponse.json({ 
      error: "Failed to generate roadmap" 
    }, { status: 500 });
  }
}