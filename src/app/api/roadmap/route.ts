import { NextRequest, NextResponse } from "next/server";
import { getOpenRouterApiKey } from "../../../lib/server/env";

/**
 * API Route for intelligent goal refinement and roadmap
 * Flow: Goal Validation → Vague Precheck → LLM Refinement → User Approval → Auto Roadmap Generation
 */

export const runtime = 'nodejs';

type RoadmapItem = { title: string; year: number; description: string };

type UnclearGoalResponse = {
  status: "unclear_goal";
  message: string;
  suggestions: string[];
};

type RefinedGoalResponse = {
  status: "refined";
  refinedGoal: string;
  description: string;
};

type GoalValidationResult = UnclearGoalResponse | RefinedGoalResponse;

type LogData = Record<string, any>;

const logger = {
  info: (msg: string, data?: LogData) => {
    const entry = data ? `${msg} ${JSON.stringify(data)}` : msg;
    console.log(`[INFO] ${new Date().toISOString()} - ${entry}`);
  },
  error: (msg: string, err?: unknown) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, err || '');
  },
  debug: (msg: string, data?: LogData) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${msg}`, data || '');
    }
  }
};

const MODEL_FALLBACKS = [
  "moonshotai/kimi-k2:free",
  "anthropic/claude-3-haiku:free",
  "google/gemini-pro:free",
  "mistralai/mistral-7b-instruct:free",
];
const TIMEOUTS = [30000, 45000, 60000];

// Real-life student vague phrases
const VAGUE_KEYWORDS = [
  // General life
  "family", "happy", "happiness", "good life", "purpose", "meaning", "dream life",
  // Success
  "successful", "success", "rich", "wealthy", "famous", "powerful", "big dream",
  // Career vague
  "good job", "nice career", "stable job", "corporate", "startup", "boss",
  // Relationships
  "married", "wife", "husband", "kids", "friends", "relationship", "soulmate",
  // Personal development
  "better person", "improve myself", "grow", "confident", "smart", "talented",
  // Academic vague
  "good grades", "pass", "graduate", "degree", "education", "university",
  // Financial vague
  "money", "financial freedom", "luxury", "comfortable", "salary",
  // Creative vague
  "creative", "passion", "hobby", "talent", "influencer",
  // Lifestyle vague
  "travel", "explore", "adventure", "freedom", "lifestyle",
  // Emotional vague
  "mental health", "self-care", "wellness", "mindfulness", "peace"
];

function looksVague(text: string): boolean {
  const lower = text.toLowerCase();
  if (lower.length <= 8) return true;
  for (const w of VAGUE_KEYWORDS) {
    if (lower.includes(w)) return true;
  }
  if (/^i (want|wish|need|would like) .+$/.test(lower)
      && !/\b(learn|study|job|career|degree|internship|project|skill)\b/.test(lower)
  ) return true;
  if (lower.trim().split(/\s+/).length < 3) return true;
  return false;
}

async function callOpenRouterAPI(
  url: string, 
  apiKey: string, 
  payload: Omit<{ model: string; messages: any[]; temperature?: number; response_format?: any }, 'model'>,
  maxRetries = 1
) {
  let lastError: Error | null = null;
  for (const model of MODEL_FALLBACKS) {
    const body = { ...payload, model };
    logger.info(`Trying model: ${model}`);
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const timeout = TIMEOUTS[Math.min(attempt, TIMEOUTS.length - 1)];
        const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://plan.goprsu.com",
            "X-Title": "CareerBuilder AI"
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(timeout)
        });
        if (!res.ok) {
          const txt = await res.text();
          if (res.status === 429) throw new Error("Rate limit");
          throw new Error(`Status ${res.status}: ${txt}`);
        }
        const json = await res.json();
        return json;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (String(lastError).includes("Rate limit")) break;
      }
    }
  }
  throw lastError!;
}

function cleanResponseText(text: string): string {
  let t = text;
  if (t.startsWith('"') && t.endsWith('"')) t = t.slice(1, -1);
  return t.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\').trim();
}

function parseRoadmapJSON(content: string): RoadmapItem[] {
  let txt = content.trim();
  if (txt.startsWith('```json\n')) {
    txt = txt.replace(/```json\n?/, '').replace(/\n?```/g, '');
  } else if (txt.startsWith('```')) {
    txt = txt.replace(/```/g, '');
  }
  const arr = JSON.parse(txt);
  if (!Array.isArray(arr)) throw new Error('Response is not an array');
  return arr.map((it: any, i: number) => {
    if (typeof it.title !== 'string' || typeof it.year !== 'number' || typeof it.description !== 'string') {
      throw new Error(`Item ${i} invalid`);
    }
    return it as RoadmapItem;
  });
}

/**
 * Goal refinement prompt that returns JSON with first-person goals
 */
function createGoalRefinementPrompt(goal: string, duration: string): string {
  return `You are an expert career strategist tasked with refining vague goals into specific, actionable plans.

INPUT:
- Goal: "${goal}"
- Duration: ${duration}

TASK:
Analyze the goal and determine if it's specific enough to create a detailed roadmap.

1. If the goal is TOO VAGUE (e.g., "I want to work with computers", "I sportman", "I want to do something big"):
   Return JSON with status "unclear_goal" and 3 specific first-person suggestions that maintain the user's intent.

2. If the goal is SPECIFIC ENOUGH:
   Return JSON with status "refined" containing a first-person refined goal (2 sentences, under 40 words).

OUTPUT FORMAT RULES:
- ALL goals and suggestions MUST be in FIRST PERSON ("I want to...", "I plan to...", "I aim to...", "I hope to...")
- Return ONLY valid JSON - no explanation, markdown, or formatting outside the JSON object
- For vague goals: Include a helpful message explaining why more specificity is needed

EXAMPLES:

1. VAGUE GOAL EXAMPLE:
Input: "I want to do something with computers"
Output:
{
  "status": "unclear_goal",
  "message": "Your goal needs more specificity to create an effective roadmap. Here are some potential directions:",
  "suggestions": [
    "I want to become a cybersecurity specialist protecting organizations from emerging digital threats",
    "I want to develop web applications using React and Node.js that solve real business problems",
    "I want to specialize in data science using Python and machine learning for business intelligence"
  ]
}

2. SPECIFIC GOAL EXAMPLE:
Input: "I want to learn coding"
Output:
{
  "status": "refined",
  "refinedGoal": "I plan to master full-stack development with React and Node.js while building three production applications that solve real business problems. I aim to position myself as a job-ready developer for high-growth tech teams within 18 months."
}

Analyze the provided goal and return ONLY a valid JSON response following the exact format above.`;
}

function createOutlinePrompt(refinedGoal: string, duration: string): string {
  return `You are Michael Torres, an elite academic planner.

REFINED GOAL:
${refinedGoal}
DURATION:
${duration}

TASK: Create a structured 4-phase outline with titles, objectives, and milestones.`;
}

function createRoadmapPrompt(refinedGoal: string, duration: string, outline: string): string {
  return `You are Elena Rodriguez, a world-class roadmap architect.

GOAL:
${refinedGoal}
DURATION:
${duration}
OUTLINE:
${outline}

TASK: Produce a detailed multi-phase roadmap with actions, resources, and checks.`;
}

function createJsonConversionPrompt(detailedRoadmap: string): string {
  return `You are Alex Kim, a UX strategist.

ROADMAP:
${detailedRoadmap}

TASK: Convert to JSON array of 5-7 milestones: {title, year, description}. Return only JSON.`;
}

async function processAutomaticSteps(
  url: string, apiKey: string,
  refinedGoal: string, duration: string,
  temperature: number, requestId: string
): Promise<NextResponse> {
  try {
    // Step 3: Create outline
    logger.info(`Starting Step 3: Create outline`, { requestId });
    const oRes = await callOpenRouterAPI(url, apiKey, {
      messages: [{ role: "user", content: createOutlinePrompt(refinedGoal, duration) }],
      temperature
    });
    const outline = oRes.choices[0].message.content;
    logger.info(`Step 3 completed: Outline created`, { requestId });
    
    // Step 4: Generate detailed roadmap
    logger.info(`Starting Step 4: Generate detailed roadmap`, { requestId });
    const rRes = await callOpenRouterAPI(url, apiKey, {
      messages: [{ role: "user", content: createRoadmapPrompt(refinedGoal, duration, outline) }],
      temperature
    });
    const detailed = rRes.choices[0].message.content;
    logger.info(`Step 4 completed: Detailed roadmap generated`, { requestId });
    
    // Step 5: Convert to JSON
    logger.info(`Starting Step 5: Convert to JSON`, { requestId });
    const jRes = await callOpenRouterAPI(url, apiKey, {
      messages: [{ role: "user", content: createJsonConversionPrompt(detailed) }],
      temperature: 0.3
    });
    const jsonContent = jRes.choices[0].message.content;
    logger.info(`Step 5 completed: JSON conversion done`, { requestId });
    
    // Parse the JSON roadmap
    const items = parseRoadmapJSON(jsonContent);
    logger.info(`Roadmap generated with ${items.length} milestones`, { requestId });
    
    return NextResponse.json({
      success: true,
      data: {
        roadmap: items,
        meta: { 
          totalMilestones: items.length, 
          duration, 
          generatedAt: new Date().toISOString() 
        }
      },
      requestId
    });
  } catch (err) {
    logger.error('Automatic roadmap generation failed', { requestId, error: err });
    return NextResponse.json({ 
      error: "Failed to generate roadmap", 
      message: err instanceof Error ? err.message : String(err),
      requestId
    }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  logger.info(`Request ${requestId}`);

  try {
    const { goal, duration, refinedGoal, temperature = 0.7 } = await req.json();
    const apiKey = getOpenRouterApiKey();
    if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    const url = "https://openrouter.ai/api/v1/chat/completions";

    // FLOW 1: Initial goal refinement (when only goal and duration are provided)
    if (goal && duration && !refinedGoal) {
      logger.info(`Starting Step 2: Goal Refinement`, { requestId });
      
      // Get response from LLM
      const step2Response = await callOpenRouterAPI(url, apiKey, {
        messages: [{ role: "user", content: createGoalRefinementPrompt(goal, duration) }],
        temperature
      });
      
      const responseContent = cleanResponseText(step2Response.choices[0].message.content);
      logger.info(`Step 2 completed: Goal refinement response received`, { requestId });
      
      // Parse the JSON response from the AI
      try {
        const validationResult = JSON.parse(responseContent);
        
        if (validationResult.status === "unclear_goal") {
          // Goal is too vague - return suggestions
          logger.info(`Goal detected as too vague, returning suggestions`, { requestId });
          return NextResponse.json({ 
            step: 2,
            action: "clarify",
            data: {
              message: validationResult.message,
              suggestions: validationResult.suggestions,
              originalGoal: goal,
              duration: duration
            },
            requestId
          });
        } else if (validationResult.status === "refined") {
          // Goal is refined - return for user review
          logger.info(`Goal successfully refined, returning for review`, { requestId });
          return NextResponse.json({
            step: 2,
            action: "review",
            data: {
              refinedGoal: validationResult.refinedGoal,
              originalGoal: goal,
              duration: duration
            },
            message: "Please review and edit your refined goal before proceeding to roadmap generation.",
            requestId
          });
        }
      } catch (parseError) {
        logger.error('Failed to parse goal refinement JSON', { requestId, parseError, responseContent });
          
        // Fallback: treat as a simple refined goal if JSON parsing fails
        return NextResponse.json({
          step: 2,
          action: "review",
          data: {
            refinedGoal: responseContent,
            originalGoal: goal,
            duration: duration
          },
          message: "Please review and edit your refined goal before proceeding to roadmap generation.",
          requestId
        });
      }
    }

    // FLOW 2: Auto roadmap generation (when refinedGoal is provided)
    else if (refinedGoal && duration) {
      logger.info(`Starting automatic roadmap generation with refined goal`, { requestId });
      return await processAutomaticSteps(url, apiKey, refinedGoal, duration, temperature, requestId);
    }

    // Invalid parameters
    else {
      return NextResponse.json({ 
        error: "Invalid parameters", 
        message: "Please provide either (goal + duration) for refinement or (refinedGoal + duration) for roadmap generation."
      }, { status: 400 });
    }
  } catch (err) {
    logger.error('Unhandled', err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
