import { NextRequest, NextResponse } from "next/server";
import { TASK_LIBRARY } from "@/lib/types/taskLibrary";

/**
 * AI Roadmap Generator API
 * Integrates assessment scoring with LLM-powered roadmap generation
 */

export const runtime = 'nodejs';

interface AssessmentData {
  stage: string;
  totalScore: number;
  clarity: { score: number; category: string };
  engagement: { score: number; category: string };
  preparation: { score: number; category: string };
  support: { score: number; category: string };
}

interface ReadinessData {
  Clarity: string;
  Engagement: string;
  Preparation: string;
  Support: string;
}

export async function POST(req: NextRequest) {
  try {
    const { assessmentData } = await req.json();
    
    // Validate assessment data
    if (!assessmentData || !assessmentData.stage) {
      return NextResponse.json({ 
        error: "Invalid assessment data" 
      }, { status: 400 });
    }

    // Extract stage and readiness from assessment data
    const stage = assessmentData.stage;
    const readiness: ReadinessData = {
      Clarity: assessmentData.clarity.category,
      Engagement: assessmentData.engagement.category,
      Preparation: assessmentData.preparation.category,
      Support: assessmentData.support.category
    };

    // Generate LLM-powered roadmap
    const roadmap = await generateLLMRoadmap(stage, readiness);
    
    return NextResponse.json({
      success: true,
      data: roadmap
    });

  } catch (error) {
    console.error('AI Roadmap Generator Error:', error);
    return NextResponse.json({ 
      error: "Failed to generate roadmap" 
    }, { status: 500 });
  }
}

async function generateLLMRoadmap(stage: string, readiness: ReadinessData) {
  const systemPrompt = `
You are PRSU's AI Academic Counselor.

INPUT:
- stage: one of Early, Mid, Late
- readiness: readiness zone for each area (Clarity, Engagement, Preparation, Support)
- taskLibrary: full list of tasks with stage and zone tags

TASK:
Select tasks ONLY from taskLibrary where BOTH:
1. stage matches student stage
2. zone matches readiness zone for that area

RULES:
- 4 months total
- Each month: 3 tasks (Clarity, Engagement, Preparation) + 1 reflection (Support)
- No task repetition
- Keep task names exactly as in taskLibrary
- Include readiness zone for each task in output
- Output valid JSON only, no text outside JSON

FORMAT:
{
  "summary": "1–2 sentence motivational message",
  "roadmap": [
    {
      "month": 1,
      "tasks": [
        {"task": "...", "area": "Clarity", "zone": "..."},
        {"task": "...", "area": "Engagement", "zone": "..."},
        {"task": "...", "area": "Preparation", "zone": "..."}
      ],
      "reflection": {"task": "...", "area": "Support", "zone": "..."}
    }
  ]
}

INPUT VALUES:
stage: ${stage}
readiness: ${JSON.stringify(readiness)}
taskLibrary: ${JSON.stringify(TASK_LIBRARY)}
`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "moonshotai/kimi-k2:free",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt }
        ]
      })
    });

    const data = await response.json();

    // Extract assistant content
    const roadmapJson = data.choices?.[0]?.message?.content || "{}";

    // Enhanced JSON validation and cleaning
    try {
      // Clean the JSON string
      const cleanedJson = roadmapJson.trim();
      
      // Parse JSON
      const parsed = JSON.parse(cleanedJson);
      
      // Validate structure
      if (!parsed.summary || !parsed.roadmap || !Array.isArray(parsed.roadmap)) {
        throw new Error('Invalid JSON structure from LLM');
      }
      
      return parsed;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw LLM Response:', roadmapJson);
      
      // Return fallback structure with error info
      return {
        summary: "Unable to generate personalized roadmap. Please try again.",
        roadmap: [],
        error: "Invalid JSON response from AI service"
      };
    }
  } catch (error) {
    console.error('LLM Roadmap Generation Error:', error);
    
    // Determine specific error type
    let errorMessage = 'Failed to generate LLM roadmap';
    if (error instanceof Error) {
      if (error.message.includes('fetch') || error.message.includes('network')) {
        errorMessage = 'Network error: Unable to connect to AI service';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout: AI service took too long to respond';
      } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
        errorMessage = 'Rate limit exceeded: AI service usage limit reached';
      } else if (error.message.includes('authentication') || error.message.includes('API key')) {
        errorMessage = 'Authentication error: Invalid API configuration';
      } else {
        errorMessage = `AI service error: ${error.message}`;
      }
    }
    
    throw new Error(errorMessage);
  }
}
