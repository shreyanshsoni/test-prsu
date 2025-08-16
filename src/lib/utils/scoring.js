/**
 * Scoring utility for the 12-question assessment
 * Questions 1-3: Clarity, 4-6: Engagement, 7-9: Preparation, 10-12: Support
 */

const ANSWER_POINTS = {
  'A': 25,    // 25 points
  'B': 50,    // 50 points
  'C': 75,    // 75 points
  'D': 100,   // 100 points
  'E': 0      // 0 points
};

const AREA_QUESTIONS = {
  clarity: [0, 1, 2],      // Q1-Q3
  engagement: [3, 4, 5],   // Q4-Q6
  preparation: [6, 7, 8],  // Q7-Q9
  support: [9, 10, 11]     // Q10-Q12
};

const AREA_CATEGORIES = {
  DEVELOPMENT: 'Development Area',
  BALANCED: 'Balanced Zone',
  PROFICIENCY: 'Proficiency Area'
};

const STAGE_THRESHOLDS = {
  EARLY: 600,  // 0-600 points
  MID: 900     // 601-900 points
};

const AREA_MAX_SCORE = 300; // 3 questions × 100 points max each
const TOTAL_MAX_SCORE = 1200; // 4 areas × 300 points each

/**
 * Calculate scores for the assessment
 * @param {Array<'A'|'B'|'C'|'D'|'E'>} answers - Array of 12 answers
 * @returns {Object} Scoring results
 */
export function calculateScores(answers) {
  // Validation
  if (!Array.isArray(answers) || answers.length !== 12) {
    throw new Error('Answers must be an array of exactly 12 elements');
  }

  // Normalize answers to uppercase and validate
  const normalizedAnswers = answers.map((answer, index) => {
    const normalized = String(answer).toUpperCase();
    if (!['A', 'B', 'C', 'D', 'E'].includes(normalized)) {
      throw new Error(`Invalid answer at position ${index + 1}: ${answer}`);
    }
    return normalized;
  });

  // Calculate area scores
  const areaScores = {};
  let totalScore = 0;

  Object.entries(AREA_QUESTIONS).forEach(([areaName, questionIndices]) => {
    const areaScore = questionIndices.reduce((sum, index) => {
      return sum + ANSWER_POINTS[normalizedAnswers[index]];
    }, 0);
    
    areaScores[areaName] = Math.round(areaScore);
    totalScore += areaScore;
  });

  totalScore = Math.round(totalScore);

  // Determine area categories
  const getAreaCategory = (score) => {
    // Validate score range (0-300)
    const validScore = Math.max(0, Math.min(300, Math.round(score)));
    
    if (validScore <= 150) return AREA_CATEGORIES.DEVELOPMENT;   // 0-150 points
    if (validScore <= 225) return AREA_CATEGORIES.BALANCED;      // 151-225 points
    return AREA_CATEGORIES.PROFICIENCY;                          // 226-300 points
  };

  // Check for insufficient data (7 or more answers are 'E')
  const countEAnswers = normalizedAnswers.filter(answer => answer === 'E').length;
  const isInsufficientData = countEAnswers >= 7; // 7 or more out of 12 questions

  // Determine stage
  const getStage = (total) => {
    // Validate total score range (0-1200)
    const validTotal = Math.max(0, Math.min(1200, Math.round(total)));
    
    // Check for insufficient data first
    if (isInsufficientData) return 'Insufficient Data';
    
    // Normal stage classification
    if (validTotal <= STAGE_THRESHOLDS.EARLY) return 'Early';
    if (validTotal <= STAGE_THRESHOLDS.MID) return 'Mid';
    return 'Late';
  };

  return {
    stage: getStage(totalScore),
    totalScore,
    clarity: {
      score: areaScores.clarity,
      category: isInsufficientData ? 'Insufficient Data' : getAreaCategory(areaScores.clarity)
    },
    engagement: {
      score: areaScores.engagement,
      category: isInsufficientData ? 'Insufficient Data' : getAreaCategory(areaScores.engagement)
    },
    preparation: {
      score: areaScores.preparation,
      category: isInsufficientData ? 'Insufficient Data' : getAreaCategory(areaScores.preparation)
    },
    support: {
      score: areaScores.support,
      category: isInsufficientData ? 'Insufficient Data' : getAreaCategory(areaScores.support)
    }
  };
}

/**
 * Get category description for display
 * @param {string} category - Area category
 * @returns {string} Description
 */
export function getCategoryDescription(category) {
  switch (category) {
    case AREA_CATEGORIES.DEVELOPMENT:
      return 'Needs focused improvement';
    case AREA_CATEGORIES.BALANCED:
      return 'Moderate strength, can improve further';
    case AREA_CATEGORIES.PROFICIENCY:
      return 'Strong performance';
    case 'Insufficient Data':
      return 'Please answer more questions for accurate assessment';
    default:
      return '';
  }
}

export const SCORING_CONSTANTS = {
  AREA_MAX_SCORE,
  TOTAL_MAX_SCORE,
  AREA_CATEGORIES
};
