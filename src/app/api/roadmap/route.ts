import { NextRequest, NextResponse } from "next/server";
import { getOpenRouterApiKey } from "../../../lib/server/env";

/**
 * API Route for generating career roadmaps using OpenRouter AI
 * 
 * Example Postman cURL to test:
 * curl -X POST http://localhost:3000/api/roadmap \
 * -H "Content-Type: application/json" \
 * -d '{ "goal": "I want to become a product manager", "temperature": 0.7 }'
 * 
 * NOTE: Make sure to set OPENROUTER_API_KEY in your .env.local file
 */

export const runtime = 'nodejs';

// Response schema for roadmap items
type RoadmapItem = {
  title: string;
  year: number;
  description: string;
};

// Types for logging
type LogData = Record<string, unknown>;

// Helper for structured logging
const logger = {
  info: (message: string, data?: LogData) => {
    const logEntry = data ? `${message} ${JSON.stringify(data)}` : message;
    console.log(`[INFO] ${new Date().toISOString()} - ${logEntry}`);
  },
  error: (message: string, error?: unknown) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
  },
  debug: (message: string, data?: LogData) => {
    if (process.env.NODE_ENV === 'development') {
      const logEntry = data ? `${message} ${JSON.stringify(data, null, 2)}` : message;
      console.log(`[DEBUG] ${new Date().toISOString()} - ${logEntry}`);
    }
  }
};

// OpenRouter API request payload type
type OpenRouterPayload = {
  model: string;
  messages: Array<{role: string; content: string}>;
  temperature?: number;
};

// OpenRouter API response type
type OpenRouterResponse = {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    index: number;
    finish_reason: string;
  }>;
  id: string;
  model: string;
  object: string;
  created: number;
};

// Helper to make OpenRouter API call with retry logic
async function callOpenRouterAPI(
  url: string, 
  apiKey: string, 
  payload: OpenRouterPayload, 
  maxRetries: number = 1
): Promise<OpenRouterResponse> {
  let lastError: Error | null = null;
  let retryCount = 0;
  
  while (retryCount <= maxRetries) {
    try {
      if (retryCount > 0) {
        logger.info(`Retry attempt ${retryCount} for OpenRouter API call`);
      }
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://plan.goprsu.com",
          "X-Title": "CareerBuilder AI",
        },
        body: JSON.stringify(payload),
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`OpenRouter API returned status ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json() as OpenRouterResponse;
      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      retryCount++;
      
      if (retryCount > maxRetries) {
        logger.error(`OpenRouter API call failed after ${maxRetries} retries`, { error: lastError.message });
        throw lastError;
      }
      
      // Simple exponential backoff
      const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
      logger.info(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never happen due to the throw in the loop, but TypeScript needs it
  throw lastError || new Error('Unknown error in OpenRouter API call');
}

// Parse and validate the roadmap JSON from the LLM response
function parseRoadmapJSON(content: string): RoadmapItem[] {
  try {
    // Try to parse the JSON response
    let jsonContent = content.trim();
    
    // Handle common LLM formatting issues
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    
    const parsed = JSON.parse(jsonContent);
    
    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array');
    }
    
    // Validate each roadmap item
    const roadmap = parsed.map((item, index) => {
      if (!item.title || typeof item.title !== 'string') {
        throw new Error(`Item ${index} missing or invalid title`);
      }
      
      if (!item.year || typeof item.year !== 'number') {
        throw new Error(`Item ${index} missing or invalid year`);
      }
      
      if (!item.description || typeof item.description !== 'string') {
        throw new Error(`Item ${index} missing or invalid description`);
      }
      
      return {
        title: item.title,
        year: item.year,
        description: item.description
      };
    });
    
    return roadmap;
  } catch (error) {
    // Log the error with a preview of the content
    console.error('Failed to parse roadmap JSON:', error, {
      content: content.substring(0, 200) + (content.length > 200 ? '...' : '')
    });
    throw new Error(`Failed to parse roadmap JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  logger.info(`Processing roadmap request ${requestId}`);
  
  try {
    // Parse request body
    const body = await req.json();
    const { goal, temperature = 0.7 } = body;
    
    logger.debug('Request parameters', { requestId, goal, temperature });

    // Validate input
    if (!goal || typeof goal !== "string") {
      logger.error(`Invalid request: missing or invalid goal`, { requestId });
      return NextResponse.json({ error: "Invalid or missing 'goal'" }, { status: 400 });
    }

    // Validate temperature if provided
    if (temperature !== undefined && (typeof temperature !== 'number' || temperature < 0 || temperature > 1)) {
      logger.error(`Invalid request: invalid temperature`, { requestId, temperature });
      return NextResponse.json({ error: "Temperature must be a number between 0 and 1" }, { status: 400 });
    }

    // Get API key from server-side utility instead of directly from process.env
    const apiKey = getOpenRouterApiKey();

    if (!apiKey) {
      logger.error(`Configuration error: Missing OpenRouter API Key`, { requestId });
      return NextResponse.json({ 
        error: "Missing OpenRouter API Key", 
        requestId
      }, { status: 500 });
    }

    const openRouterURL = "https://openrouter.ai/api/v1/chat/completions";

    // First, get natural language roadmap, then request JSON format
    const messages = [
      {
        role: "user",
        content: `Please provide guidance to achieve the following goal in 5 years:\n"${goal}"`,
      },
      {
        role: "assistant",
        content: "I'll create a detailed 5-year roadmap to help you achieve this goal.",
      },
      {
        role: "user",
        content: `Now format that roadmap as a JSON array with this structure:
[
  {
    "title": "Step 1 Title",
    "year": 2025,
    "description": "Detailed explanation of what to do in this step"
  },
  ...
]

IMPORTANT: Respond ONLY with valid JSON that can be parsed directly. Do not include any markdown formatting or code blocks.`,
      },
    ];

    logger.debug('Sending request to OpenRouter', { requestId, model: "moonshotai/kimi-k2:free" });
    
    try {
      const data = await callOpenRouterAPI(
        openRouterURL,
        apiKey,
        {
          model: "moonshotai/kimi-k2:free",
          messages,
          temperature,
        },
        1 // 1 retry max
      );
      
      logger.debug('Received response from OpenRouter', { 
        requestId,
        success: !!data?.choices?.[0]?.message?.content,
        contentLength: data?.choices?.[0]?.message?.content?.length || 0
      });

      // Validate LLM response
      if (!data || !data.choices || !data.choices[0]?.message?.content) {
        logger.error('Invalid LLM response structure', { requestId, data });
        return NextResponse.json({ 
          error: "Invalid or empty response from AI model",
          requestId
        }, { status: 500 });
      }

      const content = data.choices[0].message.content;
      
      // Try to parse and validate the JSON response
      try {
        const parsedRoadmap = parseRoadmapJSON(content);
        
        logger.info(`Successfully generated roadmap with ${parsedRoadmap.length} steps`, { 
          requestId,
          goal: goal.substring(0, 50) + (goal.length > 50 ? '...' : '')
        });
        
        // Return validated response
        return NextResponse.json({
          roadmap: parsedRoadmap,
          roadmapText: content,
          originalGoal: goal,
          requestId
        });
      } catch (parseError) {
        // If JSON parsing fails, return the raw content with an error flag
        logger.error('Failed to parse roadmap JSON', { requestId, parseError });
        
        return NextResponse.json({
          roadmapText: content,
          originalGoal: goal,
          requestId,
          parseError: parseError instanceof Error ? parseError.message : String(parseError),
          warning: "The AI generated invalid JSON. The raw response is included, but may need manual formatting."
        }, { status: 207 }); // 207 Multi-Status to indicate partial success
      }
    } catch (apiError) {
      logger.error('OpenRouter API call failed', { requestId, error: apiError });
      
      return NextResponse.json({ 
        error: "Failed to generate roadmap",
        message: apiError instanceof Error ? apiError.message : String(apiError),
        requestId
      }, { status: 502 }); // 502 Bad Gateway for upstream service failure
    }
  } catch (err) {
    logger.error('Unhandled error in roadmap API', { requestId, error: err });
    
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: err instanceof Error ? err.message : "Unknown error",
      requestId
    }, { status: 500 });
  }
}

/**
 * ✅ Summary:
 * This API receives a user goal, sends it to OpenRouter (Kimi K2 free model),
 * gets a roadmap in natural language, re-requests a JSON version of the roadmap,
 * and returns it to your backend for storage or frontend use.
 * 
 * Improvements:
 * - Structured logging with timestamps and log levels
 * - Request IDs for tracing
 * - Retry logic for network failures
 * - JSON validation and parsing
 * - Graceful handling of malformed AI responses
 * - Proper HTTP status codes for different error types
 * - Timeout prevention
 */ 