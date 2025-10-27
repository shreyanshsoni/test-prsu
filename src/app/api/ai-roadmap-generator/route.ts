import { NextRequest, NextResponse } from "next/server";
import { getSession } from '@auth0/nextjs-auth0/edge';
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


export async function POST(req: NextRequest) {
  try {
    // Get user session
    const session = await getSession(req);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.sub;
    
    const body = await req.json();
    const { assessmentData } = body;
    
    // Validate assessment data
    if (!assessmentData || !assessmentData.stage) {
      return NextResponse.json({ 
        error: "Invalid assessment data" 
      }, { status: 400 });
    }

    // Add user ID to assessment data
    const enrichedAssessmentData = {
      ...assessmentData,
      user_id: userId
    };

    // Create orchestrator with initial state
    const orchestrator = new Orchestrator({
      assessmentData: enrichedAssessmentData,
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
      return NextResponse.json({ 
        error: result.error,
        data: result.roadmap // Return fallback roadmap if available
      }, { status: 500 });
    }

    // Return successful result
    return NextResponse.json({
      success: true,
      data: result.roadmap
    });

  } catch (error) {
    return NextResponse.json({ 
      error: "Failed to generate roadmap" 
    }, { status: 500 });
  }
}