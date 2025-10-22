import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, User, BookOpen, Target, Users, ArrowRight, RotateCcw, Edit, Trash2, Plus, Calendar, Clock, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useTheme } from '../app/contexts/ThemeContext';
import { StarryBackground } from './ui/StarryBackground';
import { createPortal } from 'react-dom';

interface AssessmentData {
  clarity: number;
  engagement: number;
  preparation: number;
  support: number;
  responses: Record<string, string>;
  rawScores?: {
    clarity: number;
    engagement: number;
    preparation: number;
    support: number;
    total: number;
  };
  percentages?: {
    clarity: number;
    engagement: number;
    preparation: number;
    support: number;
    overall: number;
  };
}

interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category: 'academic' | 'career' | 'personal' | 'resources';
}

interface Phase {
  id: string;
  title: string;
  description: string;
  tasks: RoadmapTask[];
  completed: number;
  total: number;
}

interface Stage {
  level: 'early' | 'mid' | 'late';
  title: string;
  description: string;
  strengths: string[];
  growthAreas: string[];
  phases: Phase[];
  reflectionPrompts: string[];
}

const ASSESSMENT_QUESTIONS = [
  {
    id: 'clarity_future',
    category: 'clarity',
    question: 'Do you feel clear about what you want to do after high school?',
    options: [
      { value: 'A', label: 'Not really' },
      { value: 'B', label: 'Kind of' },
      { value: 'C', label: 'Mostly' },
      { value: 'D', label: 'Definitely' },
      { value: 'E', label: 'I do not wish to answer' }
    ]
  },
  {
    id: 'clarity_thinking',
    category: 'clarity',
    question: 'How often do you think about your future goals?',
    options: [
      { value: 'A', label: 'Never' },
      { value: 'B', label: 'Sometimes' },
      { value: 'C', label: 'Often' },
      { value: 'D', label: 'Almost always' },
      { value: 'E', label: 'I do not wish to answer' }
    ]
  },
  {
    id: 'clarity_research',
    category: 'clarity',
    question: 'Have you explored careers or subjects that interest you?',
    options: [
      { value: 'A', label: 'Not yet' },
      { value: 'B', label: 'A little' },
      { value: 'C', label: 'Some' },
      { value: 'D', label: 'A lot' },
      { value: 'E', label: 'I do not wish to answer' }
    ]
  },
  {
    id: 'engagement_activities',
    category: 'engagement',
    question: 'Are you involved in activities like clubs, sports, or volunteering?',
    options: [
      { value: 'A', label: 'Not yet' },
      { value: 'B', label: 'A little' },
      { value: 'C', label: 'Some' },
      { value: 'D', label: 'A lot' },
      { value: 'E', label: 'I do not wish to answer' }
    ]
  },
  {
    id: 'engagement_motivation',
    category: 'engagement',
    question: 'Do you feel motivated to work on your goals?',
    options: [
      { value: 'A', label: 'Not really' },
      { value: 'B', label: 'Kind of' },
      { value: 'C', label: 'Mostly' },
      { value: 'D', label: 'Definitely' },
      { value: 'E', label: 'I do not wish to answer' }
    ]
  },
  {
    id: 'engagement_projects',
    category: 'engagement',
    question: 'Have you done projects or experiences related to your interests?',
    options: [
      { value: 'A', label: 'Not yet' },
      { value: 'B', label: 'A little' },
      { value: 'C', label: 'Some' },
      { value: 'D', label: 'A lot' },
      { value: 'E', label: 'I do not wish to answer' }
    ]
  },
  {
    id: 'preparation_confidence',
    category: 'preparation',
    question: 'Do you feel confident in your schoolwork and skills?',
    options: [
      { value: 'A', label: 'Not really' },
      { value: 'B', label: 'Kind of' },
      { value: 'C', label: 'Mostly' },
      { value: 'D', label: 'Definitely' },
      { value: 'E', label: 'I do not wish to answer' }
    ]
  },
  {
    id: 'preparation_classes',
    category: 'preparation',
    question: 'Have you taken classes or started learning skills for your future?',
    options: [
      { value: 'A', label: 'Not yet' },
      { value: 'B', label: 'A little' },
      { value: 'C', label: 'Some' },
      { value: 'D', label: 'A lot' },
      { value: 'E', label: 'I do not wish to answer' }
    ]
  },
  {
    id: 'preparation_tests',
    category: 'preparation',
    question: 'Have you done tests, certifications, or programs related to your goals?',
    options: [
      { value: 'A', label: 'Not yet' },
      { value: 'B', label: 'A little' },
      { value: 'C', label: 'Some' },
      { value: 'D', label: 'A lot' },
      { value: 'E', label: 'I do not wish to answer' }
    ]
  },
  {
    id: 'support_encouragement',
    category: 'support',
    question: 'Do you have people who encourage you in your goals?',
    options: [
      { value: 'A', label: 'Not really' },
      { value: 'B', label: 'Kind of' },
      { value: 'C', label: 'Mostly' },
      { value: 'D', label: 'Definitely' },
      { value: 'E', label: 'I do not wish to answer' }
    ]
  },
  {
    id: 'support_asking_help',
    category: 'support',
    question: 'Do you feel comfortable asking for help when you need it?',
    options: [
      { value: 'A', label: 'Not really' },
      { value: 'B', label: 'Kind of' },
      { value: 'C', label: 'Mostly' },
      { value: 'D', label: 'Definitely' },
      { value: 'E', label: 'I do not wish to answer' }
    ]
  },
  {
    id: 'support_mentors',
    category: 'support',
    question: 'Have you connected with mentors or counselors who support your plans?',
    options: [
      { value: 'A', label: 'Not yet' },
      { value: 'B', label: 'A little' },
      { value: 'C', label: 'Some' },
      { value: 'D', label: 'A lot' },
      { value: 'E', label: 'I do not wish to answer' }
    ]
  }
];

const CATEGORY_ICONS = {
  clarity: Target,
  engagement: BookOpen,
  preparation: CheckCircle,
  support: Users
};

const CATEGORY_COLORS = {
  clarity: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  engagement: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  preparation: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  support: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
};

interface AIRoadmapBuilderProps {
  onClose?: () => void;
  userPreferences?: {
    interests: string;
    futureJob: string;
    targetDate: string;
  };
}

function AIRoadmapBuilder({ onClose, userPreferences }: AIRoadmapBuilderProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [currentStep, setCurrentStep] = useState('welcome');
  const [assessmentStep, setAssessmentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [stage, setStage] = useState<Stage | null>(null);
  const [reflection, setReflection] = useState('');
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(['phase1']));
  const [customTask, setCustomTask] = useState('');
  const [showAssessmentResults, setShowAssessmentResults] = useState(true);
  const [llmResponse, setLlmResponse] = useState<any>(null);
  const [isLoadingLlm, setIsLoadingLlm] = useState(false);
  const [llmError, setLlmError] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [enrichedDataForLLM, setEnrichedDataForLLM] = useState<any>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [llmLoadingStage, setLlmLoadingStage] = useState<'llm-generation' | 'roadmap-creation'>('llm-generation');
  const [llmErrorDetails, setLlmErrorDetails] = useState<string>('');
  const [isLlmError, setIsLlmError] = useState(false);
  const [showAIServiceError, setShowAIServiceError] = useState(false);
  
  // Local storage for calculated readiness scores
  const [calculatedScores, setCalculatedScores] = useState<{
    matrixScores: { clarity: number; engagement: number; preparation: number; support: number } | null;
    totalScore: number | null;
    readinessZones: { clarity: string; engagement: string; preparation: string; support: string } | null;
    overallStage: string | null;
    assessmentSessionId: string | null;
  }>({
    matrixScores: null,
    totalScore: null,
    readinessZones: null,
    overallStage: null,
    assessmentSessionId: null
  });
  
  // Preload the GIFs for instant display
  useEffect(() => {
    const preloadImage1 = new Image();
    preloadImage1.src = '/icons8-ai.gif';
    
    const preloadImage2 = new Image();
    preloadImage2.src = '/icons8-writing.gif';
  }, []);

  // Handle LLM generation when loading step is active
  useEffect(() => {
    if (currentStep === 'llm-loading' && enrichedDataForLLM) {
      // Clear any previous error states to ensure fresh start
      setIsLlmError(false);
      setLlmErrorDetails('');
      setShowAIServiceError(false);
      
      console.log("🚀 useEffect triggered - starting LLM generation...");
      console.log("📊 enrichedDataForLLM:", enrichedDataForLLM);
      
      const generateRoadmap = async () => {
        try {
          console.log("🌐 Making API call to /api/ai-roadmap-generator from loading step...");
          
          // Stage 1: LLM Generation
          setLlmLoadingStage('llm-generation');
          
          const response = await fetch('/api/ai-roadmap-generator', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              assessmentData: enrichedDataForLLM
            }),
          });

          console.log("📡 API Response status:", response.status, response.ok);

          if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ API Error Response:", errorText);
            setLlmErrorDetails(errorText || `HTTP ${response.status}`);
            setShowAIServiceError(true);
            setIsLlmError(false);
            setShowErrorModal(false);
            setIsLoadingLlm(false);
            return;
          }

          const result = await response.json();
          console.log("✅ API Response result:", result);
          
          if (result.error) {
            console.error("❌ Result contains error:", result.error);
            throw new Error(result.error);
          }

          const responseData = result.data;
          console.log("📊 Response data:", responseData);
          
          // Check if the backend returned an error response (even with 200 status)
          if (responseData && responseData.error) {
            console.error("❌ Backend returned error response:", responseData.error);
            // Set AI service error state for dedicated UI
            setLlmErrorDetails(responseData.error);
            setShowAIServiceError(true);
            setIsLlmError(false);
            setShowErrorModal(false);
            setIsLoadingLlm(false);
            return; // Exit early, don't proceed to roadmap creation
          }
          
          // Validate LLM response before proceeding
          if (!responseData || !responseData.roadmap || !Array.isArray(responseData.roadmap) || responseData.roadmap.length === 0) {
            console.error("❌ Invalid LLM response - missing required fields:", responseData);
            setLlmErrorDetails('Invalid LLM response: Missing roadmap data or contains errors');
            setShowAIServiceError(true);
            setIsLlmError(false);
            setShowErrorModal(false);
            setIsLoadingLlm(false);
            return;
          }

          console.log("🎯 LLM generation successful, creating roadmap...");
          
          // Stage 2: Roadmap Creation
          setLlmLoadingStage('roadmap-creation');
          
          // Automatically create the roadmap and redirect
          try {
            const createdRoadmap = await createRoadmapFromLLM(responseData);
            console.log("✅ Roadmap created successfully, redirecting...");
            console.log("🎯 Created roadmap:", createdRoadmap);
            // Redirect to roadmap planner with the specific roadmap selected
            window.location.href = `/?tab=roadmapPlanner&roadmapId=${createdRoadmap.id}`;
          } catch (error) {
            console.error('❌ Error creating roadmap:', error);
            // Set roadmap creation error details
            const errorMessage = error instanceof Error ? error.message : 'Failed to create roadmap';
            setLlmErrorDetails(errorMessage);
            setIsLlmError(true);
            setShowErrorModal(true);
          }
          
        } catch (error) {
          console.error('❌ LLM Roadmap Generation Error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to generate roadmap';
          setLlmErrorDetails(errorMessage);
          setShowAIServiceError(true);      // always show dedicated AI error UI
          setIsLlmError(false);
          setShowErrorModal(false);
          setIsLoadingLlm(false);
        }
      };

      // Start the generation process
      generateRoadmap();
    } else {
      console.log("⚠️ useEffect not triggered - currentStep:", currentStep, "enrichedDataForLLM:", !!enrichedDataForLLM);
    }
  }, [currentStep, enrichedDataForLLM]);
  
  // Helper function to calculate and store readiness scores
  const calculateAndStoreScores = (assessmentData: AssessmentData) => {
    // Convert readiness zones to numeric scores for counselor view
    const zoneToScore = (zone: string): number => {
      switch (zone) {
        case 'Development': return 25;  // 0-33%
        case 'Balanced': return 50;     // 34-66%
        case 'Proficiency': return 75;  // 67-100%
        default: return 25;
      }
    };

    const matrixScores = {
      clarity: zoneToScore(assessmentData.clarity),
      engagement: zoneToScore(assessmentData.engagement),
      preparation: zoneToScore(assessmentData.preparation),
      support: zoneToScore(assessmentData.support)
    };

    // Calculate total score (sum of all matrix scores * 4 for 1200 max)
    // Max possible: 75 + 75 + 75 + 75 = 300, then 300 * 4 = 1200
    const totalScore = Object.values(matrixScores).reduce((sum, score) => sum + score, 0) * 4;

    const readinessZones = {
      clarity: assessmentData.clarity,
      engagement: assessmentData.engagement,
      preparation: assessmentData.preparation,
      support: assessmentData.support
    };

    const overallStage = assessmentData.stage;
    const assessmentSessionId = `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store in local state immediately
    setCalculatedScores({
      matrixScores,
      totalScore,
      readinessZones,
      overallStage,
      assessmentSessionId
    });

    console.log('📊 Readiness scores calculated and stored locally:', {
      matrixScores,
      totalScore,
      readinessZones,
      overallStage,
      sessionId: assessmentSessionId
    });

    return {
      matrixScores,
      totalScore,
      readinessZones,
      overallStage,
      assessmentSessionId
    };
  };

  const calculateAssessment = (responses: Record<string, string>): AssessmentData => {
    // Convert responses to array format for new scoring system
    const answersArray = ASSESSMENT_QUESTIONS.map(q => (responses[q.id] || 'E')) as ('A' | 'B' | 'C' | 'D' | 'E')[];
    
    try {
      // Calculate scores using the exact scoring system specified
      const questionScores = answersArray.map(answer => {
        switch (answer) {
          case 'A': return 2.0833; // 25% → 2.0833 points
          case 'B': return 4.1667; // 50% → 4.1667 points
          case 'C': return 6.2500; // 75% → 6.2500 points
          case 'D': return 8.3333; // 100% → 8.3333 points
          case 'E': return 0;      // 0% → 0 points
          default: return 0;
        }
      });

      // Calculate section scores (each section has 3 questions, max 25 points)
      const clarityScore = questionScores.slice(0, 3).reduce((sum, score) => sum + score, 0);
      const engagementScore = questionScores.slice(3, 6).reduce((sum, score) => sum + score, 0);
      const preparationScore = questionScores.slice(6, 9).reduce((sum, score) => sum + score, 0);
      const supportScore = questionScores.slice(9, 12).reduce((sum, score) => sum + score, 0);

      // Calculate total score (max 100 points)
      const totalScore = questionScores.reduce((sum, score) => sum + score, 0);

      // Convert to percentages for display (each section max 25, total max 100)
      const clarityPercent = (clarityScore / 25) * 100;
      const engagementPercent = (engagementScore / 25) * 100;
      const preparationPercent = (preparationScore / 25) * 100;
      const supportPercent = (supportScore / 25) * 100;
      const overallPercent = (totalScore / 100) * 100;

    return {
        clarity: Math.round(clarityPercent * 100) / 100, // Round to 2 decimal places
        engagement: Math.round(engagementPercent * 100) / 100,
        preparation: Math.round(preparationPercent * 100) / 100,
        support: Math.round(supportPercent * 100) / 100,
        responses,
        // Add raw scores for debugging
        rawScores: {
          clarity: clarityScore,
          engagement: engagementScore,
          preparation: preparationScore,
          support: supportScore,
          total: totalScore
        },
        // Add percentages for display
        percentages: {
          clarity: clarityPercent,
          engagement: engagementPercent,
          preparation: preparationPercent,
          support: supportPercent,
          overall: overallPercent
        }
    };
    } catch (error) {
      console.error('Scoring error:', error);
      // Fallback to neutral scores
      return {
        clarity: 50,
        engagement: 50,
        preparation: 50,
        support: 50,
        responses,
        rawScores: { clarity: 12.5, engagement: 12.5, preparation: 12.5, support: 12.5, total: 50 },
        percentages: { clarity: 50, engagement: 50, preparation: 50, support: 50, overall: 50 }
      };
    }
  };

  const generateStage = (data: AssessmentData): Stage => {
    // Calculate percentage scores for each category
    const clarityPercent = data.clarity;
    const engagementPercent = data.engagement;
    const preparationPercent = data.preparation;
    const supportPercent = data.support;
    
    // Calculate overall percentage (average of all categories)
    const overallPercent = (clarityPercent + engagementPercent + preparationPercent + supportPercent) / 4;
    
    const strengths: string[] = [];
    const growthAreas: string[] = [];

    // Identify strengths and growth areas based on percentage thresholds
    if (clarityPercent >= 75) strengths.push('Clear sense of direction');
    else if (clarityPercent >= 50) growthAreas.push('Career/academic clarity (developing)');
    else growthAreas.push('Career/academic clarity (needs focus)');

    if (engagementPercent >= 75) strengths.push('High engagement and motivation');
    else if (engagementPercent >= 50) growthAreas.push('Engagement and participation (developing)');
    else growthAreas.push('Engagement and participation (needs focus)');

    if (preparationPercent >= 75) strengths.push('Strong academic preparation');
    else if (preparationPercent >= 50) growthAreas.push('Academic and planning preparation (developing)');
    else growthAreas.push('Academic and planning preparation (needs focus)');

    if (supportPercent >= 75) strengths.push('Good support system');
    else if (supportPercent >= 50) growthAreas.push('Support network and resources (developing)');
    else growthAreas.push('Support network and resources (needs focus)');

    let level: 'early' | 'mid' | 'late';
    let title: string;
    let description: string;
    let phases: Phase[];
    let reflectionPrompts: string[];

    // Stage determination based on overall percentage using the new scoring system
    if (overallPercent < 50) {
      level = 'early';
      title = 'Early Stage: Foundation Building';
      description = `You're at ${Math.round(overallPercent)}% readiness. Focus on exploration, building awareness, and establishing good habits.`;
      phases = [
        {
          id: 'phase1',
          title: 'Phase 1: Pursue Passions',
          description: 'Try new subjects, clubs, and activities to uncover genuine interests and natural talents.',
          tasks: [
            {
              id: 'e1',
              title: 'Challenge yourself in 1 subject that feels new or hard',
              description: 'Take on a challenging course or topic to discover hidden strengths.',
              completed: false,
              category: 'academic'
            },
            {
              id: 'e2',
              title: 'Join 1-2 activities that seem interesting',
              description: 'Participate in clubs, sports, or organizations that align with your curiosity.',
              completed: false,
              category: 'personal'
            },
            {
              id: 'e3',
              title: 'Apply to 1 summer experience or enrichment program',
              description: 'Seek out summer programs, internships, or volunteer opportunities.',
              completed: false,
              category: 'career'
            }
          ],
          completed: 0,
          total: 3
        },
        {
          id: 'phase2',
          title: 'Phase 2: Build Foundation',
          description: 'Establish strong academic habits and explore career possibilities.',
          tasks: [
            {
              id: 'e4',
              title: 'Meet with your school counselor',
              description: 'Schedule a meeting to discuss graduation requirements and post-secondary options.',
              completed: false,
              category: 'resources'
            },
            {
              id: 'e5',
              title: 'Complete a career interest assessment',
              description: 'Take online career assessments to explore potential interests and career paths.',
              completed: false,
              category: 'career'
            },
            {
              id: 'e6',
              title: 'Improve study habits',
              description: 'Establish consistent study routines and organizational systems.',
              completed: false,
              category: 'academic'
            }
          ],
          completed: 0,
          total: 3
        }
      ];
      reflectionPrompts = [
        'What subjects or activities make you feel most engaged and excited?',
        'What kind of work environment do you think would suit you best?',
        'What obstacles are currently holding you back from academic success?'
      ];
    } else if (overallPercent < 75) {
      level = 'mid';
      title = 'Mid Stage: Focused Development';
      description = `You're at ${Math.round(overallPercent)}% readiness. Build on your foundation with more specific planning and skill development.`;
      phases = [
        {
          id: 'phase1',
          title: 'Phase 1: Academic Planning',
          description: 'Create structured plans for your remaining high school years.',
          tasks: [
            {
              id: 'm1',
              title: 'Create a 4-year academic plan',
              description: 'Map out your remaining high school courses to meet graduation and college requirements.',
              completed: false,
              category: 'academic'
            },
            {
              id: 'm2',
              title: 'Prepare for standardized tests',
              description: 'Register for and prepare for SAT/ACT if planning to attend college.',
              completed: false,
              category: 'academic'
            },
            {
              id: 'm3',
              title: 'Research specific colleges or programs',
              description: 'Create a list of target schools or programs that align with your interests.',
              completed: false,
              category: 'career'
            }
          ],
          completed: 0,
          total: 3
        },
        {
          id: 'phase2',
          title: 'Phase 2: Leadership & Experience',
          description: 'Take on leadership roles and gain real-world experience.',
          tasks: [
            {
              id: 'm4',
              title: 'Take leadership role in activities',
              description: 'Seek leadership positions in clubs, sports, or community organizations.',
              completed: false,
              category: 'personal'
            },
            {
              id: 'm5',
              title: 'Research specific careers',
              description: 'Conduct informational interviews or job shadowing in fields of interest.',
              completed: false,
              category: 'career'
            },
            {
              id: 'm6',
              title: 'Build your resume',
              description: 'Document your experiences, skills, and achievements in a professional format.',
              completed: false,
              category: 'career'
            }
          ],
          completed: 0,
          total: 3
        }
      ];
      reflectionPrompts = [
        'How do your current activities align with your future goals?',
        'What skills do you need to develop to reach your career aspirations?',
        'How can you better use your support system to achieve your goals?'
      ];
    } else {
      level = 'late';
      title = 'Late Stage: Action & Application';
      description = `You're at ${Math.round(overallPercent)}% readiness. Execute your plans with concrete applications and final preparations.`;
      phases = [
        {
          id: 'phase1',
          title: 'Phase 1: Applications & Planning',
          description: 'Submit applications and secure your post-graduation path.',
          tasks: [
            {
              id: 'l1',
              title: 'Submit college/program applications',
              description: 'Complete applications for colleges, trade schools, or other programs.',
              completed: false,
              category: 'academic'
            },
            {
              id: 'l2',
              title: 'Apply for scholarships and financial aid',
              description: 'Research and apply for scholarships, grants, and complete FAFSA.',
              completed: false,
              category: 'resources'
            },
            {
              id: 'l3',
              title: 'Secure recommendations',
              description: 'Request letters of recommendation from teachers, mentors, or employers.',
              completed: false,
              category: 'resources'
            }
          ],
          completed: 0,
          total: 3
        },
        {
          id: 'phase2',
          title: 'Phase 2: Transition Preparation',
          description: 'Prepare for life after high school and give back to others.',
          tasks: [
            {
              id: 'l4',
              title: 'Plan your transition',
              description: 'Create detailed plans for housing, transportation, and life skills for post-graduation.',
              completed: false,
              category: 'personal'
            },
            {
              id: 'l5',
              title: 'Mentor others',
              description: 'Share your experiences by helping younger students with their planning.',
              completed: false,
              category: 'personal'
            }
          ],
          completed: 0,
          total: 2
        }
      ];
      reflectionPrompts = [
        'How confident do you feel about your post-graduation plans?',
        'What backup plans do you have if your primary plan doesn\'t work out?',
        'How will you continue growing and learning after high school?'
      ];
    }

    return {
      level,
      title,
      description,
      strengths,
      growthAreas,
      phases,
      reflectionPrompts
    };
  };

  const handleResponse = (questionId: string, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const nextAssessmentStep = () => {
    // Only used for non-final steps now
      setAssessmentStep(prev => prev + 1);
  };

  const toggleTask = (phaseId: string, taskId: string) => {
    if (stage) {
      const updatedPhases = stage.phases.map(phase => {
        if (phase.id === phaseId) {
          const updatedTasks = phase.tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          );
          const completed = updatedTasks.filter(task => task.completed).length;
          return { ...phase, tasks: updatedTasks, completed };
        }
        return phase;
      });
      setStage({ ...stage, phases: updatedPhases });
    }
  };

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(phaseId)) {
        newSet.delete(phaseId);
      } else {
        newSet.add(phaseId);
      }
      return newSet;
    });
  };

  const addCustomTask = (phaseId: string) => {
    if (stage && customTask.trim()) {
      const updatedPhases = stage.phases.map(phase => {
        if (phase.id === phaseId) {
          const newTask: RoadmapTask = {
            id: `custom-${Date.now()}`,
            title: customTask.trim(),
            description: 'Custom task added by student',
            completed: false,
            category: 'personal'
          };
          return {
            ...phase,
            tasks: [...phase.tasks, newTask],
            total: phase.total + 1
          };
        }
        return phase;
      });
      setStage({ ...stage, phases: updatedPhases });
      setCustomTask('');
    }
  };

  const resetAssessment = () => {
    setCurrentStep('welcome');
    setAssessmentStep(0);
    setResponses({});
    setAssessmentData(null);
    setStage(null);
    setReflection('');
    setExpandedPhases(new Set(['phase1']));
    setLlmResponse(null);
    setIsLoadingLlm(false);
    setLlmError(null);
    
    // Reset calculated scores
    setCalculatedScores({
      matrixScores: null,
      totalScore: null,
      readinessZones: null,
      overallStage: null,
      assessmentSessionId: null
    });
  };

  const calculateOverallProgress = () => {
    if (!stage) return 0;
    const totalTasks = stage.phases.reduce((sum, phase) => sum + phase.total, 0);
    const completedTasks = stage.phases.reduce((sum, phase) => sum + phase.completed, 0);
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const generateLLMRoadmap = async (assessmentData: any) => {
    console.log("🚀 generateLLMRoadmap called with:", assessmentData);
    console.log("👤 userPreferences prop received:", userPreferences);
    setIsLoadingLlm(true);
    setLlmError(null);
    
    // Calculate stage from updated percentages
    const overallPercent = assessmentData.percentages?.overall || 0;
    let stage = 'Early';
    if (overallPercent >= 75) stage = 'Late';
    else if (overallPercent >= 50) stage = 'Mid';
    
    console.log("📊 Calculated stage:", stage, "from overall percent:", overallPercent);
    
    // Calculate readiness zones from percentages
    const calculateReadinessZone = (percentage: number): string => {
      if (percentage >= 75) return 'Proficiency';
      if (percentage >= 50) return 'Balanced';
      return 'Development';
    };
    
    // Create enriched assessment data with calculated stage, readiness zones, and user preferences
    const enrichedAssessmentData = {
      ...assessmentData,
      stage: stage,
      clarity: calculateReadinessZone(assessmentData.clarity),
      engagement: calculateReadinessZone(assessmentData.engagement),
      preparation: calculateReadinessZone(assessmentData.preparation),
      support: calculateReadinessZone(assessmentData.support),
      userPreferences: userPreferences || null
    };
    
    console.log("📊 Calculated readiness zones:", {
      clarity: calculateReadinessZone(assessmentData.clarity),
      engagement: calculateReadinessZone(assessmentData.engagement),
      preparation: calculateReadinessZone(assessmentData.preparation),
      support: calculateReadinessZone(assessmentData.support)
    });
    
    console.log("📤 Sending enriched assessment data to LLM:", enrichedAssessmentData);
    console.log("📋 Final API request body:", { assessmentData: enrichedAssessmentData });
    
    // Store enriched data for later use
    setEnrichedDataForLLM(enrichedAssessmentData);
    
    // Go directly to LLM loading
    setCurrentStep('llm-loading');
    
    // The API call and roadmap creation is now handled by the useEffect in the loading step
    // Just set the loading step and let the useEffect handle everything
    console.log("🚀 Setting step to llm-loading, useEffect will handle the rest...");
  };

  const generateMeaningfulTitle = (interests: string, futureJob: string): string => {
    if (!interests || !futureJob) return 'AI Career Roadmap';
    
    // Handle "other" interests and create meaningful combinations
    const interest = interests === 'other' ? 'Custom' : interests;
    const role = futureJob === 'other' ? 'Professional' : futureJob;
    
    // Create meaningful title combinations
    const titleMap: { [key: string]: { [key: string]: string } } = {
      'Technology': {
        'Tech Expert': 'Tech Mastery Path',
        'Leader or Manager': 'Tech Leadership Journey',
        'Creative': 'Digital Innovation Roadmap',
        'Entrepreneur': 'Tech Startup Path',
        'Researcher or Scientist': 'Tech Research Journey',
        'Helping or Support role': 'Tech Support Career',
        'Professional': 'Technology Career Path'
      },
      'Arts & Humanities': {
        'Creative': 'Creative Arts Journey',
        'Leader or Manager': 'Arts Leadership Path',
        'Tech Expert': 'Digital Arts Career',
        'Entrepreneur': 'Creative Business Path',
        'Researcher or Scientist': 'Arts Research Journey',
        'Helping or Support role': 'Arts Education Path',
        'Professional': 'Arts & Humanities Career'
      },
      'Healthcare & Medicine': {
        'Leader or Manager': 'Healthcare Leadership',
        'Tech Expert': 'Health Tech Career',
        'Creative': 'Medical Arts Path',
        'Entrepreneur': 'Health Innovation',
        'Researcher or Scientist': 'Medical Research',
        'Helping or Support role': 'Healthcare Support',
        'Professional': 'Healthcare Career'
      },
      'Business & Entrepreneurship': {
        'Entrepreneur': 'Business Startup Path',
        'Leader or Manager': 'Business Leadership',
        'Tech Expert': 'Business Tech Career',
        'Creative': 'Business Innovation',
        'Researcher or Scientist': 'Business Research',
        'Helping or Support role': 'Business Support',
        'Professional': 'Business Career Path'
      },
      'Science & Engineering': {
        'Researcher or Scientist': 'Scientific Discovery',
        'Tech Expert': 'Engineering Tech Path',
        'Leader or Manager': 'Science Leadership',
        'Creative': 'Engineering Innovation',
        'Entrepreneur': 'Science Startup',
        'Helping or Support role': 'Science Education',
        'Professional': 'Science & Engineering'
      },
      'Social Sciences': {
        'Researcher or Scientist': 'Social Research Path',
        'Helping or Support role': 'Social Support Career',
        'Leader or Manager': 'Social Services Leadership',
        'Tech Expert': 'Social Tech Career',
        'Creative': 'Social Innovation',
        'Entrepreneur': 'Social Enterprise',
        'Professional': 'Social Sciences Career'
      },
      'Environment & Sustainability': {
        'Researcher or Scientist': 'Environmental Research',
        'Leader or Manager': 'Sustainability Leadership',
        'Tech Expert': 'Green Tech Career',
        'Creative': 'Environmental Innovation',
        'Entrepreneur': 'Green Business Path',
        'Helping or Support role': 'Environmental Support',
        'Professional': 'Environmental Career'
      },
      'Custom': {
        'Leader or Manager': 'Leadership Journey',
        'Tech Expert': 'Tech Career Path',
        'Creative': 'Innovation Journey',
        'Entrepreneur': 'Startup Path',
        'Researcher or Scientist': 'Research Journey',
        'Helping or Support role': 'Support Career',
        'Professional': 'Professional Career'
      },
      'I\'m not sure': {
        'Leader or Manager': 'Exploratory Leadership',
        'Tech Expert': 'Tech Exploration',
        'Creative': 'Creative Exploration',
        'Entrepreneur': 'Business Exploration',
        'Researcher or Scientist': 'Research Exploration',
        'Helping or Support role': 'Support Exploration',
        'Professional': 'Career Exploration'
      }
    };
    
    // Get the specific title for this combination
    const specificTitle = titleMap[interest]?.[role];
    if (specificTitle) return specificTitle;
    
    // Fallback: create a meaningful combination
    if (interest === 'Custom') {
      return `${role} Career Path`;
    }
    
    return `${interest} ${role} Path`;
  };

  const createRoadmapFromLLM = async (responseData?: any) => {
    const dataToUse = responseData || llmResponse;
    if (!dataToUse || !dataToUse.roadmap || dataToUse.roadmap.length === 0) {
      throw new Error('No roadmap data available');
    }

    try {
      console.log('🚀 Starting roadmap creation...');
      console.log('📊 LLM Response Data:', dataToUse);
      console.log('👤 User Preferences:', userPreferences);
      
      // Create goal from LLM response data
      const goal = {
        title: generateMeaningfulTitle(userPreferences?.interests, userPreferences?.futureJob),
        identity: `${dataToUse.scores_summary?.overall_stage || 'Student'} Stage Student`,
        deadline: userPreferences?.targetDate || new Date(Date.now() + 4 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Use student's target date or fallback to 4 months
        careerBlurb: dataToUse.career_blurb || ''
      };

      console.log('🎯 Created goal:', goal);

      // Transform LLM roadmap to phases
      const phases = dataToUse.roadmap.map((phase: any, index: number) => {
        // Calculate due dates based on student's target date and phase timeline
        const targetDate = userPreferences?.targetDate ? new Date(userPreferences.targetDate) : new Date(Date.now() + 4 * 30 * 24 * 60 * 60 * 1000);
        
        let phaseDueDate: Date;
        switch (phase.timeline) {
          case 'short_term':
            phaseDueDate = new Date(targetDate.getTime() - (3 * 30 * 24 * 60 * 60 * 1000)); // 3 months before target
            break;
          case 'mid_term':
            phaseDueDate = new Date(targetDate.getTime() - (6 * 30 * 24 * 60 * 60 * 1000)); // 6 months before target
            break;
          case 'long_term':
            phaseDueDate = new Date(targetDate.getTime() - (12 * 30 * 24 * 60 * 60 * 1000)); // 12 months before target
            break;
          default:
            phaseDueDate = new Date(targetDate.getTime() - ((index + 1) * 3 * 30 * 24 * 60 * 60 * 1000)); // Fallback: 3 months apart
        }
        
        return {
          title: phase.phase,
          description: `${phase.phase} phase - ${phase.timeline} timeline`,
        tasks: [
            ...phase.tasks.map((task: any, taskIndex: number) => ({
              title: task,
              notes: `Task ${taskIndex + 1} from ${phase.phase} phase`,
              dueDate: phaseDueDate.toISOString().split('T')[0],
            completed: false
          })),
          {
              title: phase.reflection || 'Reflection Question',
              notes: `Reflection for ${phase.phase} phase`,
              dueDate: phaseDueDate.toISOString().split('T')[0],
            completed: false
          }
        ],
          reflection: phase.reflection || ''
        };
      });

      console.log('📋 Created phases:', phases);

      // Create the roadmap using the existing API
      console.log('🌐 Making API call to /api/roadmap-planners...');
      const response = await fetch('/api/roadmap-planners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          goal,
          phases 
        }),
      });

      console.log('📡 API Response status:', response.status, response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ API Response result:', result);
      
      if (result.roadmapPlanner) {
        console.log('🎉 Roadmap created successfully!');
        return result.roadmapPlanner;
      } else {
        throw new Error('No roadmap planner returned from API');
      }
    } catch (error) {
      console.error('❌ Error creating roadmap from LLM:', error);
      throw error; // Re-throw the error so the calling function can handle it
    }
  };

  const handleSliderChange = (areaKey: string, newValue: number) => {
    console.log(`handleSliderChange called: ${areaKey} = ${newValue}`);
    
    if (!assessmentData) {
      console.log('No assessment data available');
      return;
    }
    
    // Ensure the value is a valid number and round it
    const roundedValue = Math.max(0, Math.min(100, Math.round(newValue)));
    console.log(`Rounded value for ${areaKey}: ${roundedValue}`);
    
    // Update the assessment data with new slider value
    const updatedData = { ...assessmentData };
    
    // Update the percentage value (0-100)
    updatedData[areaKey as keyof AssessmentData] = roundedValue;
    console.log(`Updated ${areaKey} to ${roundedValue}`);
    
    // Recalculate raw scores based on percentage (0-25)
    const newRawScore = (roundedValue / 100) * 25;
    if (updatedData.rawScores) {
      updatedData.rawScores[areaKey as keyof typeof updatedData.rawScores] = newRawScore;
      console.log(`Updated raw score for ${areaKey} to ${newRawScore}`);
    }
    
    // Recalculate overall percentage
    if (updatedData.percentages) {
      updatedData.percentages[areaKey as keyof typeof updatedData.percentages] = roundedValue;
      const overallPercent = (updatedData.clarity + updatedData.engagement + updatedData.preparation + updatedData.support) / 4;
      updatedData.percentages.overall = overallPercent;
      console.log(`Updated overall percentage to ${overallPercent}`);
    }
    
    console.log('Final updated data:', updatedData);
    setAssessmentData(updatedData);
  };

  if (currentStep === 'welcome') {
    return (
      <div className={`fixed inset-0 ${isDark ? 'bg-dark-background' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'} flex items-center justify-center p-2 sm:p-4 z-[9999]`}>
        {isDark && <StarryBackground />}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 rounded-full bg-light-card/20 dark:bg-dark-card/20 backdrop-blur-sm text-light-text dark:text-dark-text hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}
        <div className="w-full max-w-xs sm:max-w-lg md:max-w-2xl mx-auto text-center">
          <div className={`${isDark ? 'bg-dark-card/90' : 'bg-white/80'} backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border ${isDark ? 'border-dark-border/20' : 'border-white/20'} p-4 sm:p-6 md:p-6 lg:p-7 transition-all duration-500 hover:shadow-3xl`}>
            <div className="mb-2 sm:mb-3 md:mb-3 lg:mb-4">
              <div className="w-8 h-12 sm:w-10 sm:h-16 flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-3 lg:mb-4">
                <img src="/P_Logo.png" alt="P Logo" className="w-8 h-12 sm:w-10 sm:h-16" />
              </div>
                             <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r ${isDark ? 'from-white to-gray-300' : 'from-gray-900 to-gray-700'} bg-clip-text text-transparent mb-1 sm:mb-2 md:mb-2 lg:mb-3`}>
                Your Personalized AI Roadmap
              </h1>
               <p className={`text-base sm:text-lg md:text-xl ${isDark ? 'text-dark-text' : 'text-gray-600'} leading-relaxed`}>
                Get a tailored academic and career plan designed just for you
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-4 lg:gap-5 mb-3 sm:mb-4 md:mb-5 lg:mb-6">
              {Object.entries(CATEGORY_ICONS).map(([category, Icon]) => (
                 <div key={category} className={`text-center p-3 sm:p-4 md:p-4 lg:p-5 rounded-xl sm:rounded-2xl ${isDark ? 'bg-dark-card border-dark-border' : 'bg-gradient-to-br from-white to-gray-50 border border-gray-100'} shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1`}>
                   <Icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-8 lg:w-9 md:h-8 lg:h-9 mx-auto mb-2 sm:mb-3 text-blue-600" />
                   <p className={`text-xs sm:text-sm font-semibold capitalize ${isDark ? 'text-dark-text' : 'text-gray-700'}`}>{category}</p>
                </div>
              ))}
            </div>

            <div className="text-left space-y-2 sm:space-y-2 md:space-y-2.5 lg:space-y-3 mb-3 sm:mb-4 md:mb-5 lg:mb-6">
              <div className="flex items-center">
                 <div className={`w-6 h-6 sm:w-8 sm:h-8 ${isDark ? 'bg-green-900' : 'bg-green-100'} rounded-full flex items-center justify-center mr-3 sm:mr-4`}>
                   <CheckCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                 <span className={`text-sm sm:text-base ${isDark ? 'text-dark-text' : 'text-gray-700'} font-medium`}>Quick 5-minute assessment</span>
              </div>
              <div className="flex items-center">
                 <div className={`w-6 h-6 sm:w-8 sm:h-8 ${isDark ? 'bg-green-900' : 'bg-green-100'} rounded-full flex items-center justify-center mr-3 sm:mr-4`}>
                   <CheckCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                 <span className={`text-sm sm:text-base ${isDark ? 'text-dark-text' : 'text-gray-700'} font-medium`}>Personalized action plan</span>
              </div>
              <div className="flex items-center">
                 <div className={`w-6 h-6 sm:w-8 sm:h-8 ${isDark ? 'bg-green-900' : 'bg-green-100'} rounded-full flex items-center justify-center mr-3 sm:mr-4`}>
                   <CheckCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                 <span className={`text-sm sm:text-base ${isDark ? 'text-dark-text' : 'text-gray-700'} font-medium`}>Built-in reflection tools</span>
              </div>
              <div className="flex items-center">
                 <div className={`w-6 h-6 sm:w-8 sm:h-8 ${isDark ? 'bg-green-900' : 'bg-green-100'} rounded-full flex items-center justify-center mr-3 sm:mr-4`}>
                   <CheckCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                 <span className={`text-sm sm:text-base ${isDark ? 'text-dark-text' : 'text-gray-700'} font-medium`}>Progress tracking</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep('assessment')}
               className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold hover:from-blue-700 hover:to-blue-500 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Start Your Assessment
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'assessment') {
    const currentQuestion = ASSESSMENT_QUESTIONS[assessmentStep];
    const progress = ((assessmentStep + 1) / ASSESSMENT_QUESTIONS.length) * 100;

    return (
      <div className={`fixed inset-0 ${isDark ? 'bg-dark-background' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'} py-4 sm:py-8 md:py-12 px-2 sm:px-4 z-[9999]`}>
        {isDark && <StarryBackground />}
        <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl mx-auto h-full flex flex-col justify-center">
          <div className="mb-4 sm:mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs sm:text-sm font-medium ${isDark ? 'text-dark-text' : 'text-gray-600'}`}>Question {assessmentStep + 1} of {ASSESSMENT_QUESTIONS.length}</span>
              <span className={`text-xs sm:text-sm font-medium ${isDark ? 'text-dark-text' : 'text-gray-600'}`}>{Math.round(progress)}% Complete</span>
            </div>
                         <div className={`w-full ${isDark ? 'bg-dark-card/50' : 'bg-white/50'} rounded-full h-2 sm:h-3 shadow-inner`}>
              <div 
                 className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 sm:h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className={`${isDark ? 'bg-dark-card/90' : 'bg-white/80'} backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border ${isDark ? 'border-dark-border/20' : 'border-white/20'} p-4 sm:p-6 md:p-10`}>
            <div className="mb-4 sm:mb-6">
              <div className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold mb-4 sm:mb-6 ${CATEGORY_COLORS[currentQuestion.category as keyof typeof CATEGORY_COLORS]} shadow-sm`}>
                {React.createElement(CATEGORY_ICONS[currentQuestion.category as keyof typeof CATEGORY_ICONS], { className: "w-3 h-3 sm:w-4 sm:h-4 mr-2" })}
                {currentQuestion.category.charAt(0).toUpperCase() + currentQuestion.category.slice(1)}
              </div>
                             <h2 className={`text-lg sm:text-xl md:text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'} mb-2 leading-relaxed`}>
                {currentQuestion.question}
              </h2>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {currentQuestion.options.map((option) => (
                <label
                  key={option.value}
                   className={`flex items-center p-3 sm:p-4 md:p-5 border-2 ${isDark ? 'border-dark-border hover:bg-dark-card/50 hover:border-primary-600' : 'border-gray-200 hover:bg-blue-50 hover:border-indigo-300'} rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 group`}
                >
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={option.value}
                    onChange={() => handleResponse(currentQuestion.id, option.value)}
                    checked={responses[currentQuestion.id] === option.value}
                     className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-3 sm:mr-4 focus:ring-2 focus:ring-blue-500"
                  />
                   <span className={`text-sm sm:text-base ${isDark ? 'text-dark-text group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'} font-medium transition-colors`}>{option.label}</span>
                </label>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8 md:mt-10">
              <button
                onClick={() => assessmentStep > 0 ? setAssessmentStep(prev => prev - 1) : setCurrentStep('welcome')}
                 className={`px-4 sm:px-6 md:px-8 py-2 sm:py-3 border-2 ${isDark ? 'border-dark-border text-dark-text hover:bg-dark-card hover:border-primary-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'} rounded-xl sm:rounded-2xl transition-all duration-300 font-medium text-sm sm:text-base`}
              >
                Back
              </button>
              <button
                onClick={() => {
                  console.log(`Button clicked. Current step: ${assessmentStep}, Total questions: ${ASSESSMENT_QUESTIONS.length}`);
                  
                  if (assessmentStep === ASSESSMENT_QUESTIONS.length - 1) {
                    // Last question - calculate assessment and show results popup
                    console.log("Last question - calculating assessment");
                    const data = calculateAssessment(responses);
                    console.log("Assessment data calculated:", data);
                    setAssessmentData(data);
                    
                    // Calculate and store readiness scores immediately
                    calculateAndStoreScores(data);
                    
                    // Show custom results popup instead of simple alert
                    setCurrentStep('results-popup');
                  } else {
                    // Not last question - go to next question
                    console.log("Not last question - going to next question");
                    setAssessmentStep(prev => prev + 1);
                  }
                }}
                disabled={responses[currentQuestion.id] === undefined}
                   className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-blue-500 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none text-sm sm:text-base"
              >
                {assessmentStep === ASSESSMENT_QUESTIONS.length - 1 ? 'Get My Roadmap' : 'Next'}
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Custom Results Popup - Shows stage, scores, and proficiency
  if (currentStep === 'results-popup' && assessmentData) {
    // Calculate stage based on overall percentage
    const overallPercent = assessmentData.percentages?.overall || 0;
    let stageText = '';
    if (overallPercent >= 75) stageText = 'Late Stage';
    else if (overallPercent >= 50) stageText = 'Mid Stage';
    else stageText = 'Early Stage';

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-[9999]">
        <div className="w-full max-w-xs sm:max-w-lg md:max-w-2xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 transform transition-all">
          <div className="text-center mb-4 sm:mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-green-100 mb-3 sm:mb-4">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Assessment Complete!</h3>
            <p className="text-base sm:text-lg text-gray-600 mb-3 sm:mb-4">
              Your personalized academic profile is ready
            </p>
            <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold text-sm sm:text-base">
              {stageText}
            </div>
          </div>

          {/* Overall Score */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
            <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Overall Performance</h4>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
              {Math.round(overallPercent)} / 100
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 sm:h-3 rounded-full transition-all duration-500"
                style={{ width: `${overallPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Area Scores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {[
              { key: 'clarity', label: 'Clarity', icon: Target, color: '#3b82f6' },
              { key: 'engagement', label: 'Engagement', icon: BookOpen, color: '#10b981' },
              { key: 'preparation', label: 'Preparation', icon: CheckCircle, color: '#8b5cf6' },
              { key: 'support', label: 'Support', icon: Users, color: '#f59e0b' }
            ].map(({ key, label, icon: Icon, color }) => {
              const score = assessmentData[key as keyof AssessmentData] as number;
              const proficiency = score >= 75 ? 'Proficiency' : score >= 50 ? 'Balanced' : 'Development';
              const proficiencyColor = score >= 75 ? 'text-green-600 bg-green-100' : score >= 50 ? 'text-yellow-600 bg-yellow-100' : 'text-red-600 bg-red-100';
              
              return (
                <div key={key} className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center mb-2">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" style={{ color }} />
                    <span className="font-semibold text-gray-800 text-sm sm:text-base">{label}</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{Math.round(score)}%</div>
                  <div className={`text-xs px-2 py-1 rounded-full ${proficiencyColor} font-medium`}>
                    {proficiency}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Button */}
          <div className="text-center">
            <button
              onClick={() => {
                console.log("View Full Results clicked");
                setCurrentStep('scoring-results');
              }}
              className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
            >
              View Full Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'scoring-results' && assessmentData) {
    return (
      <div className={`fixed inset-0 ${isDark ? 'bg-dark-background' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'} flex items-center justify-center p-2 sm:p-4 z-[9999]`}>
        {isDark && <StarryBackground />}
        
        <style jsx>{`
          input[type="range"] {
            -webkit-appearance: none;
            appearance: none;
            height: 8px;
            border-radius: 4px;
            outline: none;
            transition: all 0.2s ease;
            cursor: pointer !important;
            pointer-events: auto !important;
          }
          
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: white;
            border: 2px solid var(--thumb-color, #3b82f6);
            cursor: pointer !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: all 0.2s ease;
            pointer-events: auto !important;
          }
          
          input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          }
          
          input[type="range"]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: white;
            border: 2px solid var(--thumb-color, #3b82f6);
            cursor: pointer !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            pointer-events: auto !important;
          }
          
          input[type="range"]::-moz-range-thumb:hover {
            transform: scale(1.1);
          }
          
          /* Ensure slider track is interactive */
          input[type="range"]::-webkit-slider-track {
            cursor: pointer !important;
            pointer-events: auto !important;
          }
          
          input[type="range"]::-moz-range-track {
            cursor: pointer !important;
            pointer-events: auto !important;
          }
          
          /* Specific fixes for Clarity slider */
          input[type="range"]:first-of-type {
            cursor: pointer !important;
            pointer-events: auto !important;
            z-index: 10;
            opacity: 1 !important;
            visibility: visible !important;
          }
          
          input[type="range"]:first-of-type::-webkit-slider-thumb {
            cursor: pointer !important;
            pointer-events: auto !important;
            z-index: 10;
            opacity: 1 !important;
            visibility: visible !important;
          }
          
          /* Specific fixes for Engagement slider (second slider) */
          input[type="range"]:nth-of-type(2) {
            cursor: pointer !important;
            pointer-events: auto !important;
            z-index: 10;
            opacity: 1 !important;
            visibility: visible !important;
          }
          
          input[type="range"]:nth-of-type(2)::-webkit-slider-thumb {
            cursor: pointer !important;
            pointer-events: auto !important;
            z-index: 10;
            opacity: 1 !important;
            visibility: visible !important;
          }
          
          /* Specific fixes for Preparation slider (third slider) */
          input[type="range"]:nth-of-type(3) {
            cursor: pointer !important;
            pointer-events: auto !important;
            z-index: 10;
            opacity: 1 !important;
            visibility: visible !important;
          }
          
          input[type="range"]:nth-of-type(3)::-webkit-slider-thumb {
            cursor: pointer !important;
            pointer-events: auto !important;
            z-index: 10;
            opacity: 1 !important;
            visibility: visible !important;
          }
          
          /* Specific fixes for Support slider (fourth slider) */
          input[type="range"]:nth-of-type(4) {
            cursor: pointer !important;
            pointer-events: auto !important;
            z-index: 10;
            opacity: 1 !important;
            visibility: visible !important;
          }
          
          input[type="range"]:nth-of-type(4)::-webkit-slider-thumb {
            cursor: pointer !important;
            pointer-events: auto !important;
            z-index: 10;
            opacity: 1 !important;
            visibility: visible !important;
          }
          
          /* Ensure smooth slider movement */
          input[type="range"] {
            transition: none !important;
          }
          
          input[type="range"]::-webkit-slider-thumb {
            transition: none !important;
          }
          

        `}</style>
        
        <div className="w-full max-w-xs sm:max-w-lg md:max-w-2xl mx-auto">
          <div className={`${isDark ? 'bg-dark-card/90' : 'bg-white/80'} backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border ${isDark ? 'border-dark-border/20' : 'border-white/20'} p-3 sm:p-4`}>
            
            {/* Header */}
            <div className="text-center mb-3 sm:mb-4 relative">
                              <div className="absolute top-0 right-0 z-20">
                  <div className="group relative">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-full flex items-center justify-center cursor-help transition-colors`}>
                      <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    {/* Tooltip */}
                    <div className={`absolute right-0 top-6 sm:top-8 w-64 sm:w-80 ${isDark ? 'bg-gray-800 text-gray-100 border-gray-600' : 'bg-white text-black border-gray-200'} text-xs sm:text-sm rounded-lg p-3 sm:p-4 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto z-30 border`}>
                      <div className="relative">
                        <p className="leading-relaxed">
                          Not sure this stage fits? Adjust the slider to choose the stage that feels right. Once you click OK, we'll lock it in and build your roadmap.
                        </p>
                        {/* Arrow pointing up */}
                        <div className={`absolute -top-2 right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent ${isDark ? 'border-b-gray-800' : 'border-b-white'}`}></div>
                      </div>
                    </div>
                  </div>
            </div>

              <h1 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'} mb-1`}>
                {(() => {
                  const overallPercent = assessmentData.percentages?.overall || 0;
                  if (overallPercent >= 75) return 'Late Stage';
                  if (overallPercent >= 50) return 'Mid Stage';
                  return 'Early Stage';
                })()}
              </h1>

              <div className={`text-xs sm:text-sm ${isDark ? 'text-dark-muted' : 'text-gray-600'} ${isDark ? 'bg-gray-800/80' : 'bg-gray-50'} p-2 sm:p-3 rounded-lg`}>
                {(() => {
                  const overallPercent = assessmentData.percentages?.overall || 0;
                  if (overallPercent >= 75) {
                    return "You've come far and are excelling! Now's the time to refine your skills, challenge yourself, and seize opportunities to reach your full potential.";
                  } else if (overallPercent >= 50) {
                    return "You've made meaningful progress—your effort is paying off! Keep strengthening your habits, experimenting with new strategies, and pushing yourself to grow even more.";
                  } else {
                    return "You're at the beginning of your journey—every step you take now lays the foundation for future success. Keep exploring and building your skills with curiosity and confidence.";
                  }
                })()}
              </div>
            </div>

            {/* Area Scores with Interactive Sliders */}
            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
              {[
                { key: 'clarity', label: 'Clarity', icon: Target, color: '#3b82f6' },
                { key: 'engagement', label: 'Engagement', icon: BookOpen, color: '#10b981' },
                { key: 'preparation', label: 'Preparation', icon: CheckCircle, color: '#8b5cf6' },
                { key: 'support', label: 'Support', icon: Users, color: '#f59e0b' }
              ].map(({ key, label, icon: Icon, color }) => {
                const score = assessmentData[key as keyof AssessmentData] as number;
                const rawScore = assessmentData.rawScores?.[key as keyof typeof assessmentData.rawScores] || 0;
                
                // Ensure slider value is a valid number between 0-100
                const sliderValue = Math.max(0, Math.min(100, Math.round(score) || 0));
                
                return (
                  <div key={key} className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-gray-50 to-white border-gray-100'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2 sm:gap-0">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 ${isDark ? 'bg-gradient-to-br from-gray-700 to-gray-600' : 'bg-gradient-to-br from-gray-100 to-gray-200'}`}>
                          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <span className={`font-semibold text-base sm:text-lg ${isDark ? 'text-dark-text' : 'text-gray-800'}`}>{label}</span>
                          <p className={`text-xs sm:text-sm ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
                            {score >= 75 ? 'Strong performance' : 
                             score >= 50 ? 'Moderate strength, can improve further' : 
                             'Needs focus and development'}
                          </p>
                        </div>
                      </div>
                                             <div className="text-right sm:text-left sm:ml-auto">


                         <div className="text-xs font-medium mt-1">
                          {score >= 75 && (
                            <span className={`px-2 py-1 rounded-full ${isDark ? 'text-green-400 bg-green-900/30' : 'text-green-600 bg-green-100'}`}>Proficiency</span>
                           )}
                          {score >= 50 && score < 75 && (
                             <span className={`px-2 py-1 rounded-full ${isDark ? 'text-yellow-400 bg-yellow-900/30' : 'text-yellow-600 bg-yellow-100'}`}>Balanced</span>
                           )}
                          {score < 50 && (
                             <span className={`px-2 py-1 rounded-full ${isDark ? 'text-red-400 bg-red-900/30' : 'text-red-600 bg-red-100'}`}>Development</span>
                           )}
                         </div>
                       </div>
                    </div>
                    
                    {/* Interactive Slider with Colors */}
                    <div className="mb-2">
                      <input
                        type="range"
                        id={`slider-${key}`}
                        min="0"
                        max="100"
                        step="0.1"
                        value={sliderValue}
                        onChange={(e) => {
                          const newValue = parseFloat(e.target.value);
                          console.log(`Slider change for ${key}: ${newValue}`);
                          handleSliderChange(key, Math.round(newValue));
                        }}
                        onMouseDown={(e) => {
                          console.log(`Mouse down on ${key} slider`);
                        }}
                        onMouseUp={(e) => {
                          console.log(`Mouse up on ${key} slider`);
                        }}
                        onInput={(e) => {
                          const newValue = parseFloat(e.currentTarget.value);
                          console.log(`Slider input for ${key}: ${newValue}`);
                        }}
                        onTouchStart={(e) => {
                          console.log(`Touch start on ${key} slider`);
                        }}
                        onTouchMove={(e) => {
                          console.log(`Touch move on ${key} slider`);
                        }}
                        onTouchEnd={(e) => {
                          console.log(`Touch end on ${key} slider`);
                        }}
                        className="w-full h-3 rounded-lg cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, ${color} 0%, ${color} ${sliderValue}%, ${isDark ? '#374151' : '#e5e7eb'} ${sliderValue}%, ${isDark ? '#374151' : '#e5e7eb'} 100%)`,
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          appearance: 'none',
                          '--thumb-color': color,
                          cursor: 'pointer',
                          pointerEvents: 'auto',
                          zIndex: 1000,
                          position: 'relative',
                          touchAction: 'none'
                        } as React.CSSProperties}
                      />

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Button */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  // Call LLM to generate roadmap (like the original OK button)
                  console.log("🟦 OK button clicked - calling LLM...");
                  generateLLMRoadmap(assessmentData);
                }}
                className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-blue-500 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LLM Results Display
  if (currentStep === 'llm-results' && llmResponse) {
    // Check if LLM failed to generate proper roadmap
    const isErrorResponse = !llmResponse.roadmap || llmResponse.roadmap.length === 0 || 
                           llmResponse.career_blurb?.includes('Unable to generate') ||
                           llmResponse.career_blurb?.includes('try again') ||
                           llmResponse.career_blurb?.includes('Failed to generate') ||
                           llmResponse.error;

    // Determine error type and message
    const getErrorDetails = () => {
      if (llmResponse.error) {
        if (llmResponse.error.includes('network') || llmResponse.error.includes('fetch')) {
          return {
            type: 'network',
            title: 'Network Connection Error',
            description: 'Unable to connect to the AI service',
            details: 'Please check your internet connection and try again.',
            suggestions: ['Check your internet connection', 'Try again in a few moments', 'Contact support if the issue persists']
          };
        } else if (llmResponse.error.includes('API') || llmResponse.error.includes('authentication')) {
          return {
            type: 'api',
            title: 'Service Configuration Error',
            description: 'AI service is not properly configured',
            details: 'There was an issue with the AI service configuration.',
            suggestions: ['Try again later', 'Contact support for assistance', 'Check service status']
          };
        } else if (llmResponse.error.includes('timeout') || llmResponse.error.includes('time out')) {
          return {
            type: 'timeout',
            title: 'Request Timeout',
            description: 'The AI service took too long to respond',
            details: 'The request timed out while generating your roadmap.',
            suggestions: ['Try again', 'Check your internet speed', 'Try during off-peak hours']
          };
        } else if (llmResponse.error.includes('rate limit') || llmResponse.error.includes('quota')) {
          return {
            type: 'rate-limit',
            title: 'Service Limit Reached',
            description: 'AI service usage limit exceeded',
            details: 'The AI service has reached its usage limit for this period.',
            suggestions: ['Try again in a few minutes', 'Wait for rate limit reset', 'Contact support if urgent']
          };
        } else {
          return {
            type: 'unknown',
            title: 'Unexpected Error',
            description: 'An unexpected error occurred',
            details: 'Something went wrong while generating your roadmap.',
            suggestions: ['Try again', 'Check your internet connection', 'Contact support if the issue persists']
          };
        }
      } else if (isErrorResponse) {
        return {
          type: 'generation',
          title: 'Roadmap Generation Failed',
          description: 'Could not generate personalized roadmap',
          details: 'The AI system encountered an issue while creating your personalized roadmap.',
          suggestions: ['Try generating the roadmap again', 'Check your internet connection', 'Contact support if the issue persists']
        };
      }
      return null;
    };

    const errorDetails = getErrorDetails();

    return (
      <div className={`fixed inset-0 ${isDark ? 'bg-dark-background' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'} flex items-center justify-center p-4 z-[9999]`}>
        {isDark && <StarryBackground />}
        <div className="max-w-6xl w-full mx-auto h-full">
          <div className={`${isDark ? 'bg-dark-card/90' : 'bg-white/80'} backdrop-blur-sm rounded-3xl shadow-2xl border ${isDark ? 'border-dark-border/20' : 'border-white/20'} p-8 h-full flex flex-col`}>
            
            {/* Error Message Display */}
            {errorDetails && (
              <div className="mb-6 p-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                    errorDetails.type === 'network' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                    errorDetails.type === 'api' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                    errorDetails.type === 'timeout' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    errorDetails.type === 'rate-limit' ? 'bg-gradient-to-r from-pink-500 to-red-500' :
                    'bg-gradient-to-r from-red-500 to-orange-500'
                  }`}>
                    {errorDetails.type === 'network' ? (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                      </svg>
                    ) : errorDetails.type === 'api' ? (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ) : errorDetails.type === 'timeout' ? (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : errorDetails.type === 'rate-limit' ? (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                      {errorDetails.title}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                      {errorDetails.description}
                    </p>
                  </div>
                </div>
                <div className={`p-4 bg-white/50 rounded-xl border border-red-100`}>
                  <p className={`text-sm ${isDark ? 'text-gray-700' : 'text-gray-600'} mb-3`}>
                    <strong>What happened?</strong> {errorDetails.details}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-700' : 'text-gray-600'} mb-3`}>
                    <strong>What you can do:</strong>
                  </p>
                  <ul className={`text-sm ${isDark ? 'text-gray-700' : 'text-gray-600'} list-disc list-inside space-y-1 ml-4`}>
                    {errorDetails.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="text-center mb-6">
              <h1 className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'} mb-2`}>
                {isErrorResponse ? 'Error Response' : 'Your AI-Generated Career Roadmap'}
              </h1>
              <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>
                {isErrorResponse ? 'Error details from AI Roadmap Generator' : 'Personalized roadmap based on your interests and assessment'}
              </p>
            </div>

            {/* Career Blurb Display */}
            {!isErrorResponse && llmResponse.career_blurb && (
              <div className={`mb-6 p-6 ${isDark ? 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-700/30' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'} border rounded-2xl`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-blue-300' : 'text-blue-800'} mb-2`}>Career Path Overview</h3>
                <p className={isDark ? 'text-blue-200' : 'text-blue-700'}>{llmResponse.career_blurb}</p>
              </div>
            )}

            {/* Scores Summary Display */}
            {!isErrorResponse && llmResponse.scores_summary && (
              <div className={`mb-6 p-6 ${isDark ? 'bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-700/30' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'} border rounded-2xl`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-green-300' : 'text-green-800'} mb-3`}>Your Assessment Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isDark ? 'text-green-300' : 'text-green-700'}`}>{llmResponse.scores_summary.Clarity}</div>
                    <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>Clarity</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isDark ? 'text-green-300' : 'text-green-700'}`}>{llmResponse.scores_summary.Engagement}</div>
                    <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>Engagement</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isDark ? 'text-green-300' : 'text-green-700'}`}>{llmResponse.scores_summary.Preparation}</div>
                    <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>Preparation</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isDark ? 'text-green-300' : 'text-green-700'}`}>{llmResponse.scores_summary.Support}</div>
                    <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>Support</div>
                  </div>
                </div>
                <div className="text-center mt-3">
                  <div className={`text-lg font-semibold ${isDark ? 'text-green-300' : 'text-green-700'}`}>Overall Stage: {llmResponse.scores_summary.overall_stage}</div>
                </div>
              </div>
            )}

            {/* Roadmap Phases Display */}
            {!isErrorResponse && llmResponse.roadmap && llmResponse.roadmap.length > 0 && (
              <div className="mb-6">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-gray-800'} mb-4`}>Your 4-Phase Roadmap</h3>
                <div className="space-y-4">
                  {llmResponse.roadmap.map((phase: any, index: number) => (
                    <div key={index} className={`p-4 ${isDark ? 'bg-dark-card/50 border-dark-border/30' : 'bg-white/50 border-gray-200'} border rounded-xl`}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className={`font-semibold ${isDark ? 'text-dark-text' : 'text-gray-800'}`}>{phase.phase}</h4>
                        <span className={`text-sm ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'} px-2 py-1 rounded-full`}>{phase.timeline}</span>
                      </div>
                      <div className="mb-3">
                        <h5 className={`text-sm font-medium ${isDark ? 'text-dark-muted' : 'text-gray-700'} mb-2`}>Tasks:</h5>
                        <ul className={`list-disc list-inside space-y-1 text-sm ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>
                          {phase.tasks.map((task: string, taskIndex: number) => (
                            <li key={taskIndex}>{task}</li>
                          ))}
                        </ul>
                      </div>
                      {phase.reflection && (
                        <div>
                          <h5 className={`text-sm font-medium ${isDark ? 'text-dark-muted' : 'text-gray-700'} mb-2`}>Reflection Question:</h5>
                          <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-600'} italic`}>{phase.reflection}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw JSON Output (for debugging) */}
            <div className="flex-1 overflow-auto mb-6">
              <details className={`${isDark ? 'bg-dark-card/30' : 'bg-gray-100'} rounded-xl`}>
                <summary className={`p-4 cursor-pointer text-sm font-medium ${isDark ? 'text-dark-muted' : 'text-gray-700'}`}>View Raw JSON (Debug)</summary>
                <pre className={`p-4 text-xs font-mono ${isDark ? 'text-gray-300' : 'text-gray-800'} whitespace-pre-wrap overflow-x-auto`}>
                {JSON.stringify(llmResponse, null, 2)}
              </pre>
              </details>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setCurrentStep('scoring-results');
                }}
                className="px-6 py-3 bg-gray-500 text-white rounded-2xl hover:bg-gray-600 transition-all duration-300 font-semibold"
              >
                Back
              </button>
              <div className="flex gap-3">
                {errorDetails && (
                  <button
                    onClick={() => {
                      window.location.href = '/';
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Return to Homepage
                  </button>
                )}
                {!errorDetails && llmResponse && llmResponse.roadmap && llmResponse.roadmap.length > 0 && (
                  <button
                    onClick={createRoadmapFromLLM}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-2xl hover:from-purple-700 hover:to-purple-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Create AI Roadmap
                  </button>
                )}
                <button
                  onClick={() => {
                    // Generate stage data for the roadmap
                    const data = calculateAssessment(responses);
                    setAssessmentData(data);
                    
                    // Calculate and store readiness scores immediately
                    calculateAndStoreScores(data);
                    
                    const generatedStage = generateStage(data);
                    setStage(generatedStage);
                    setCurrentStep('results');
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-2xl hover:from-blue-700 hover:to-blue-500 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Continue to Roadmap
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }



  // LLM Confirmation Step - Shows what data is being sent to LLM
  if (currentStep === 'llm-confirmation' && llmResponse?.confirmation) {
    return (
      <div className={`fixed inset-0 ${isDark ? 'bg-dark-background' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'} flex items-center justify-center p-4 z-[9999]`}>
        {isDark && <StarryBackground />}
        <div className="max-w-4xl w-full mx-auto">
          <div className={`${isDark ? 'bg-dark-card/90' : 'bg-white/80'} backdrop-blur-sm rounded-3xl shadow-2xl border ${isDark ? 'border-dark-border/20' : 'border-white/20'} p-8`}>
            
            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'} mb-2`}>
                Data Successfully Pushed to LLM! 🚀
              </h1>
              <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>
                Your assessment data has been sent to the AI service. Here's what was included:
              </p>
            </div>

            {/* Data Confirmation Display */}
            <div className="space-y-6 mb-8">
              
              {/* User Preferences */}
              <div className={`p-6 ${isDark ? 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-700/30' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'} border rounded-2xl`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-blue-300' : 'text-blue-800'} mb-3`}>
                  🎯 Your 3-Question Answers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'} mb-1`}>Interests</div>
                    <div className={`font-semibold ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                      {llmResponse.dataSent.userPreferences?.interests || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'} mb-1`}>Future Job</div>
                    <div className={`font-semibold ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                      {llmResponse.dataSent.userPreferences?.futureJob || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'} mb-1`}>Target Date</div>
                    <div className={`font-semibold ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                      {llmResponse.dataSent.userPreferences?.targetDate || 'Not provided'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stage and Readiness Zones */}
              <div className={`p-6 ${isDark ? 'bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-700/30' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'} border rounded-2xl`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-green-300' : 'text-green-800'} mb-3`}>
                  📊 Assessment Results Sent to LLM
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-600'} mb-2`}>Overall Stage</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                      {llmResponse.dataSent.stage}
                    </div>
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-600'} mb-2`}>Readiness Zones</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className={`text-lg font-bold ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                          {llmResponse.dataSent.readinessZones.Clarity}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>Clarity</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                          {llmResponse.dataSent.readinessZones.Engagement}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>Engagement</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                          {llmResponse.dataSent.readinessZones.Preparation}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>Preparation</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                          {llmResponse.dataSent.readinessZones.Support}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>Support</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Message */}
              <div className={`p-4 ${isDark ? 'bg-green-900/20 border-green-700/30' : 'bg-green-50 border-green-200'} border rounded-xl text-center`}>
                <div className={`text-sm ${isDark ? 'text-green-300' : 'text-green-600'}`}>
                  ✅ <strong>All data successfully pushed to LLM!</strong> The AI service is now generating your personalized roadmap...
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  // Continue to the actual LLM call
                  setCurrentStep('llm-loading');
                }}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl hover:from-green-700 hover:to-green-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Continue to LLM Generation 🚀
              </button>
              <button
                onClick={() => {
                  // Go back to scoring results to retry
                  setCurrentStep('scoring-results');
                }}
                className="px-6 py-3 bg-gray-500 text-white rounded-2xl hover:bg-gray-600 transition-all duration-300 font-semibold"
              >
                🔄 Start Over
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AI Service Error Step - Dedicated UI for AI service failures
  if (showAIServiceError) {
    return (
      <div className={`fixed inset-0 ${isDark ? 'bg-dark-background' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'} flex items-center justify-center p-4 z-[9999]`}>
        {isDark && <StarryBackground />}
        <div className="max-w-lg w-full mx-auto text-center">
          <div className={`${isDark ? 'bg-dark-card/90' : 'bg-white/80'} backdrop-blur-sm rounded-3xl shadow-2xl border ${isDark ? 'border-dark-border/20' : 'border-white/20'} p-8`}>
            
            {/* Error Icon */}
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
              <svg className="h-12 w-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            {/* Error Title */}
            <h2 className={`text-2xl font-bold ${isDark ? 'text-red-400' : 'text-red-700'} mb-4`}>
              {llmErrorDetails?.includes('network') || llmErrorDetails?.includes('timeout') 
                ? 'Oops! Connection Lost 🚀' 
                : llmErrorDetails?.includes('rate limit') || llmErrorDetails?.includes('quota')
                ? 'Too Many Students Ahead! 🎓'
                : llmErrorDetails?.includes('LLM API error') || llmErrorDetails?.includes('orchestrator')
                ? 'Our AI Brain Needs a Coffee Break ☕'
                : 'AI Service Taking a Nap 😴'
              }
            </h2>
            
            {/* Error Description */}
            <p className={`text-base ${isDark ? 'text-dark-muted' : 'text-gray-600'} mb-6 leading-relaxed`}>
              {llmErrorDetails?.includes('network') || llmErrorDetails?.includes('timeout')
                ? 'Looks like our AI got lost in cyberspace! 🌐 Don\'t worry, it happens to the best of us. Just like when your WiFi decides to take a break during an important video call.'
                : llmErrorDetails?.includes('rate limit') || llmErrorDetails?.includes('quota')
                ? 'Whoa! Looks like everyone had the same brilliant idea as you! 🎯 Our AI is currently helping tons of students create their roadmaps. It\'s like the hottest study spot on campus - sometimes you gotta wait for a seat!'
                : llmErrorDetails?.includes('LLM API error') || llmErrorDetails?.includes('orchestrator')
                ? 'Our AI brain got a bit overwhelmed trying to create your perfect roadmap! 🧠✨ It\'s like when you\'re studying for finals and your brain just needs a quick snack break. Give it a few minutes to recharge!'
                : 'Our AI is having one of those "Monday morning" moments! 😅 Sometimes even the smartest algorithms need a little breather. This usually sorts itself out pretty quickly.'
              }
            </p>
            
            {/* Technical Details */}
            <div className={`text-sm ${isDark ? 'text-red-300' : 'text-red-600'} bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-6 text-left`}>
              <strong>Behind the scenes:</strong> {
                llmErrorDetails?.includes('network') || llmErrorDetails?.includes('timeout')
                  ? 'Our AI couldn\'t reach the server - probably got distracted by cat videos on the internet! 🐱'
                  : llmErrorDetails?.includes('rate limit') || llmErrorDetails?.includes('quota')
                  ? 'Too many students are creating roadmaps right now - it\'s like rush hour for AI! 🚗💨'
                  : llmErrorDetails?.includes('LLM API error') || llmErrorDetails?.includes('orchestrator')
                  ? 'Our AI tried really hard (3 times!) but got overwhelmed. Even robots need breaks sometimes! 🤖💤'
                  : 'Something unexpected happened - our AI is probably having an existential crisis about student life! 🤔'
              }
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setShowAIServiceError(false);
                  // Go back to home/dashboard
                  if (onClose) {
                    onClose();
                  } else {
                    // Fallback: redirect to home
                    window.location.href = '/';
                  }
                }}
                className="px-8 py-3 bg-gray-500 text-white rounded-2xl hover:bg-gray-600 transition-all duration-300 font-semibold"
              >
                Home
              </button>
              
              <button
                onClick={async () => {
                  // Clear ALL error states before retrying to ensure fresh start
                  setShowAIServiceError(false);
                  setIsLlmError(false);
                  setLlmErrorDetails('');
                  
                  // Reset to loading step and immediately retry LLM call
                  setCurrentStep('llm-loading');
                  
                  // Wait a moment for state to update, then retry
                  setTimeout(async () => {
                    try {
                      console.log("🔄 Retrying LLM generation with existing data...");
                      
                      // Make the API call directly using stored enriched data
                      const response = await fetch('/api/ai-roadmap-generator', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                          assessmentData: enrichedDataForLLM
                        }),
                      });

                      console.log("📡 Retry API Response status:", response.status, response.ok);

                      if (!response.ok) {
                        const errorText = await response.text();
                        console.error("❌ Retry API Error Response:", errorText);
                        throw new Error(`HTTP error! status: ${response.status}`);
                      }

                      const result = await response.json();
                      console.log("✅ Retry API Response result:", result);
                      
                      if (result.error) {
                        console.error("❌ Retry result contains error:", result.error);
                        throw new Error(result.error);
                      }

                      const responseData = result.data;
                      console.log("📊 Retry response data:", responseData);
                      
                      // Validate LLM response before proceeding (fresh validation, no cached errors)
                      if (!responseData || !responseData.roadmap || !Array.isArray(responseData.roadmap) || responseData.roadmap.length === 0) {
                        console.error("❌ Retry invalid LLM response - missing required fields:", responseData);
                        throw new Error('Invalid LLM response: Missing roadmap data or contains errors');
                      }

                      console.log("🎯 Retry LLM generation successful, creating roadmap...");
                      
                      // Stage 2: Roadmap Creation
                      setLlmLoadingStage('roadmap-creation');
                      
                      // Automatically create the roadmap and redirect
                      try {
                        const createdRoadmap = await createRoadmapFromLLM(responseData);
                        console.log("✅ Retry roadmap created successfully, redirecting...");
                        console.log("🎯 Created roadmap:", createdRoadmap);
                        // Redirect to roadmap planner with the specific roadmap selected
                        window.location.href = `/?tab=roadmapPlanner&roadmapId=${createdRoadmap.id}`;
                      } catch (error) {
                        console.error('❌ Retry error creating roadmap:', error);
                        // Show error modal if roadmap creation fails
                        setShowErrorModal(true);
                      }
                      
                    } catch (error) {
                      console.error('❌ Retry LLM Roadmap Generation Error:', error);
                      // Show the error again with fresh error state
                      setLlmErrorDetails(error instanceof Error ? error.message : 'Failed to generate roadmap');
                      setIsLlmError(true);
                      setShowAIServiceError(true);
                    }
                  }, 100); // Small delay to ensure state updates
                }}
                className="px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-2xl hover:from-orange-700 hover:to-orange-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again ✨
              </button>
            </div>
            
            {/* Help Text */}
            <p className={`text-xs ${isDark ? 'text-dark-muted' : 'text-gray-500'} mt-6`}>
              Don't worry! Your assessment answers are safely stored - no need to retake that quiz! 🎯
            </p>

          </div>
        </div>
      </div>
    );
  }

  // LLM Loading Step
  if (currentStep === 'llm-loading') {
    return (
      <div className={`fixed inset-0 ${isDark ? 'bg-dark-background' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'} flex items-center justify-center p-4 z-[9999]`}>
        {isDark && <StarryBackground />}
        <div className="max-w-md w-full mx-auto text-center">
          <div className={`${isDark ? 'bg-dark-card/90' : 'bg-white/80'} backdrop-blur-sm rounded-3xl shadow-2xl border ${isDark ? 'border-dark-border/20' : 'border-white/20'} p-8`}>
            
            {/* Loading Animation - Different for each stage */}
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-lg">
              {llmLoadingStage === 'llm-generation' ? (
                // Stage 1: Robot GIF for LLM Generation
                <img 
                  src="/icons8-ai.gif" 
                  alt="AI Processing" 
                  className="h-12 w-12 object-contain brightness-0 invert"
                  loading="eager"
                  decoding="sync"
                />
              ) : (
                // Stage 2: Writing GIF for Roadmap Creation
                <img 
                  src="/icons8-writing.gif" 
                  alt="Creating Roadmap" 
                  className="h-12 w-12 object-contain brightness-0 invert"
                  loading="eager"
                  decoding="sync"
                />
              )}
            </div>
            
            {/* Stage-specific Title */}
            <h2 className={`text-xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'} mb-4`}>
              {llmLoadingStage === 'llm-generation' ? (
                <>
                  Generating Your AI Roadmap
                  <span className="inline-flex space-x-1 ml-2">
                    <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-white' : 'bg-gray-800'}`} style={{animationDelay: '0ms'}}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-white' : 'bg-gray-800'}`} style={{animationDelay: '150ms'}}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-white' : 'bg-gray-800'}`} style={{animationDelay: '300ms'}}></div>
                  </span>
                </>
              ) : (
                <>
                  Creating Your Roadmap
                  <span className="inline-flex space-x-1 ml-2">
                    <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-white' : 'bg-gray-800'}`} style={{animationDelay: '0ms'}}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-white' : 'bg-gray-800'}`} style={{animationDelay: '150ms'}}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-white' : 'bg-gray-800'}`} style={{animationDelay: '300ms'}}></div>
                  </span>
                </>
              )}
            </h2>
            
            {/* Stage-specific Description */}
            <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-600'} mb-6`}>
              {llmLoadingStage === 'llm-generation' ? (
                "The AI is analyzing your assessment data and generating a personalized roadmap. This may take a few moments."
              ) : (
                "Organizing your roadmap into phases and tasks. Almost ready to launch!"
              )}
            </p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div className={`h-2 rounded-full transition-all duration-500 ${
                llmLoadingStage === 'llm-generation' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse'
              }`} style={{
                width: llmLoadingStage === 'llm-generation' ? '50%' : '100%'
              }}></div>
            </div>

          </div>
        </div>
      </div>
    );
  }

    // Error Modal - Shows different content for LLM vs Network errors (fallback for other errors)
  if (showErrorModal) {
    return (
      <div className={`fixed inset-0 ${isDark ? 'bg-dark-background/80' : 'bg-gray-900/80'} flex items-center justify-center p-4 z-[9999]`}>
        <div className="max-w-md w-full mx-auto">
          <div className={`${isDark ? 'bg-dark-card' : 'bg-white'} rounded-2xl shadow-2xl border ${isDark ? 'border-dark-border/20' : 'border-gray-200'} p-6 text-center`}>

            {/* Error Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            <h2 className={`text-lg font-bold ${isDark ? 'text-red-400' : 'text-red-700'} mb-2`}>
              {isLlmError ? 'Roadmap Creation Error' : 'Network Interruption'}
            </h2>
            
            <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-600'} mb-4`}>
              {isLlmError 
                ? 'There was an issue creating your roadmap from the AI response.'
                : 'The connection was interrupted. Please try again.'
              }
            </p>

            {/* Show LLM error details if available */}
            {isLlmError && llmErrorDetails && (
              <div className={`text-xs ${isDark ? 'text-red-300' : 'text-red-600'} bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-4 text-left`}>
                <strong>Error Details:</strong> {llmErrorDetails}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              {isLlmError ? (
                // For roadmap creation errors, show regenerate button
                <button
                  onClick={() => {
                    setShowErrorModal(false);
                    setIsLlmError(false);
                    setLlmErrorDetails('');
                    // Reset to loading step to retry
                    setCurrentStep('llm-loading');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-2xl hover:from-orange-700 hover:to-orange-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  🔄 Regenerate Roadmap
                </button>
              ) : (
                // For network errors, show retry button
                <button
                  onClick={() => {
                    setShowErrorModal(false);
                    setCurrentStep('llm-loading');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl hover:from-blue-700 hover:to-blue-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  🔄 Retry
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LLM Error Step
  if (currentStep === 'llm-error' && llmError) {
    return (
      <div className={`fixed inset-0 ${isDark ? 'bg-dark-background' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'} flex items-center justify-center p-4 z-[9999]`}>
        {isDark && <StarryBackground />}
        <div className="max-w-md w-full mx-auto text-center">
          <div className={`${isDark ? 'bg-dark-card/90' : 'bg-white/80'} backdrop-blur-sm rounded-3xl shadow-2xl border ${isDark ? 'border-dark-border/20' : 'border-white/20'} p-8`}>
            
            {/* Error Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h2 className={`text-xl font-bold ${isDark ? 'text-red-400' : 'text-red-700'} mb-4`}>
              LLM Generation Failed ❌
            </h2>
            <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-600'} mb-6`}>
              {llmError}
            </p>
            
            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setCurrentStep('scoring-results')}
                className="px-6 py-3 bg-gray-500 text-white rounded-2xl hover:bg-gray-600 transition-all duration-300 font-semibold"
              >
                Back to Scoreboard
              </button>
              <button
                onClick={() => {
                  // Retry the LLM generation
                  setCurrentStep('llm-confirmation');
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-300 font-semibold"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'results' && stage && assessmentData) {
    const overallProgress = calculateOverallProgress();

    return (
      <div className={`fixed inset-0 ${isDark ? 'bg-dark-background' : 'bg-gray-50'} flex z-[9999]`}>
        {isDark && <StarryBackground />}
        {/* Sidebar */}
        <div className={`w-72 ${isDark ? 'bg-dark-card/90' : 'bg-white/90'} backdrop-blur-sm shadow-2xl flex flex-col border-r ${isDark ? 'border-dark-border' : 'border-gray-200'}`}>
                     <div className={`p-6 border-b ${isDark ? 'border-dark-border' : 'border-gray-200'}`}>
            <div className="flex items-center">
               <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div>
                 <h1 className={`font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'} text-lg`}>AI Roadmap</h1>
                 <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-500'} font-medium`}>Student Portal</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-6">
            <div className="space-y-3">
               <div className={`flex items-center px-4 py-3 ${isDark ? 'text-dark-text hover:bg-dark-border' : 'text-gray-700 hover:bg-gray-50'} rounded-xl transition-all duration-200`}>
                <BookOpen className="w-5 h-5 mr-3" />
                <span className="font-medium">Dashboard</span>
              </div>
               <div className={`flex items-center px-4 py-3 ${isDark ? 'text-dark-text hover:bg-dark-border' : 'text-gray-700 hover:bg-gray-50'} rounded-xl transition-all duration-200`}>
                <Target className="w-5 h-5 mr-3" />
                <span className="font-medium">Program Search</span>
              </div>
               <div className={`flex items-center px-4 py-3 ${isDark ? 'text-dark-text hover:bg-dark-border' : 'text-gray-700 hover:bg-gray-50'} rounded-xl transition-all duration-200`}>
                <CheckCircle className="w-5 h-5 mr-3" />
                <span className="font-medium">My Programs</span>
              </div>
               <div className={`flex items-center px-4 py-3 ${isDark ? 'text-dark-text hover:bg-dark-border' : 'text-gray-700 hover:bg-gray-50'} rounded-xl transition-all duration-200`}>
                <Circle className="w-5 h-5 mr-3" />
                <span className="font-medium">My Checklists</span>
              </div>
               <div className={`flex items-center px-4 py-3 ${isDark ? 'text-dark-text hover:bg-dark-border' : 'text-gray-700 hover:bg-gray-50'} rounded-xl transition-all duration-200`}>
                <Target className="w-5 h-5 mr-3" />
                <span className="font-medium">Academic Goals</span>
              </div>
               <div className={`flex items-center px-4 py-3 ${isDark ? 'bg-primary-900/30 text-primary-400 border-primary-800' : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 border-indigo-100'} rounded-xl font-semibold shadow-sm border`}>
                <Target className="w-5 h-5 mr-3" />
                <span>Roadmap Planner</span>
              </div>
               <div className={`flex items-center px-4 py-3 ${isDark ? 'text-dark-text hover:bg-dark-border' : 'text-gray-700 hover:bg-gray-50'} rounded-xl transition-all duration-200`}>
                <User className="w-5 h-5 mr-3" />
                <span className="font-medium">User Profile</span>
              </div>
            </div>
          </nav>

                     <div className={`p-6 border-t ${isDark ? 'border-dark-border' : 'border-gray-200'}`}>
            <button
              onClick={resetAssessment}
               className={`flex items-center ${isDark ? 'text-red-400 hover:text-red-300 hover:bg-red-900/30' : 'text-red-600 hover:text-red-700 hover:bg-red-50'} transition-colors font-medium px-3 py-2 rounded-xl`}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
         <div className={`flex-1 overflow-auto ${isDark ? 'bg-dark-background' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`}>
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center mb-8">
               <button className={`mr-6 p-3 ${isDark ? 'hover:bg-dark-card/50' : 'hover:bg-white/50'} rounded-2xl transition-all duration-200`}>
                <ArrowRight className="w-5 h-5 rotate-180" />
              </button>
               <h1 className={`text-3xl font-bold ${isDark ? 'text-dark-text' : 'bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'}`}>Roadmap</h1>
            </div>

            {/* Roadmap Header Card */}
                            <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 rounded-3xl p-8 text-white mb-8 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Target className="w-8 h-8 mr-4" />
                  <h2 className="text-2xl font-bold">Roadmap</h2>
                </div>
                <Edit className="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Student</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{stage.phases.reduce((sum, phase) => sum + phase.total, 0)} tasks remaining</span>
                </div>
              </div>
            </div>

            {/* Overall Progress */}
             <div className={`${isDark ? 'bg-dark-card/80' : 'bg-white/80'} backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border ${isDark ? 'border-dark-border/20' : 'border-white/20'}`}>
              <div className="space-y-4">
                 <span className={`${isDark ? 'text-dark-text' : 'text-gray-800'} font-semibold text-lg`}>Overall Progress: {overallProgress}%</span>
                 <div className={`w-full ${isDark ? 'bg-dark-border' : 'bg-gray-200'} rounded-full h-4 shadow-inner`}>
                  <div 
                     className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-700 shadow-sm"
                    style={{ width: `${overallProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Category Scores */}
             <div className={`${isDark ? 'bg-dark-card/80' : 'bg-white/80'} backdrop-blur-sm rounded-3xl shadow-lg border ${isDark ? 'border-dark-border/20' : 'border-white/20'} overflow-hidden mb-8`}>
              <div 
                 className={`p-6 cursor-pointer ${isDark ? 'hover:bg-dark-card/50' : 'hover:bg-white/50'} transition-all duration-300`}
                onClick={() => setShowAssessmentResults(!showAssessmentResults)}
              >
                <div className="flex items-center justify-between">
                   <h3 className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>Your Readiness Assessment</h3>
                  <div className="flex items-center">
                     <span className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-500'} mr-4`}>
                      {showAssessmentResults ? 'Hide Details' : 'Show Details'}
                    </span>
                    {showAssessmentResults ? (
                       <ChevronUp className={`w-6 h-6 ${isDark ? 'text-dark-muted' : 'text-gray-400'}`} />
                    ) : (
                       <ChevronDown className={`w-6 h-6 ${isDark ? 'text-dark-muted' : 'text-gray-400'}`} />
                    )}
                  </div>
                </div>
              </div>

              {showAssessmentResults && (
                <div className="px-8 pb-8">
                  <div className="grid grid-cols-1 gap-6">
                    {Object.entries({
                      clarity: { label: 'Clarity', icon: Target, color: 'bg-blue-500' },
                      engagement: { label: 'Engagement', icon: BookOpen, color: 'bg-green-500' },
                      preparation: { label: 'Preparation', icon: CheckCircle, color: 'bg-purple-500' },
                      support: { label: 'Support', icon: Users, color: 'bg-orange-500' }
                    }).map(([category, config]) => {
                      const score = assessmentData[category as keyof AssessmentData] as number;
                      const Icon = config.icon;
                      
                      return (
                        <div key={category} className="p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mr-4">
                                <Icon className="w-5 h-5 text-gray-600" />
                              </div>
                              <span className="font-semibold text-gray-800 text-lg">{config.label}</span>
                            </div>
                            <span className="text-lg font-bold text-gray-900">{score}/100</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner overflow-hidden">
                            <div 
                              className={`${config.color} h-3 rounded-full transition-all duration-700 shadow-sm relative overflow-hidden`}
                              style={{ width: `${score}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                            </div>
                          </div>
                          <div className="flex justify-between mt-2 text-sm text-gray-500 w-full">
                            <span>0</span>
                            <span className="font-medium">{score}%</span>
                            <span>100</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Stage Summary */}
                  <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
                    <div className="flex items-center mb-2">
                      <div className={`w-4 h-4 rounded-full mr-3 ${
                        stage.level === 'early' ? 'bg-yellow-500' :
                        stage.level === 'mid' ? 'bg-blue-500' : 'bg-green-500'
                      }`}></div>
                      <h4 className="font-bold text-gray-900 text-lg">{stage.title}</h4>
                    </div>
                    <p className="text-gray-600 mb-4 leading-relaxed">{stage.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-semibold text-green-700 mb-3">Strengths:</h5>
                        <ul className="text-gray-600 space-y-2">
                          {stage.strengths.map((strength, index) => (
                            <li key={index} className="flex items-center">
                              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                              </div>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-orange-700 mb-3">Growth Areas:</h5>
                        <ul className="text-gray-600 space-y-2">
                          {stage.growthAreas.map((area, index) => (
                            <li key={index} className="flex items-center">
                              <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                <Target className="w-3 h-3 text-orange-600" />
                              </div>
                              {area}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Phases */}
            <div className="space-y-6">
              {stage.phases.map((phase, index) => (
                <div key={phase.id} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 overflow-hidden">
                  <div 
                    className="p-6 cursor-pointer hover:bg-white/50 transition-all duration-300"
                    onClick={() => togglePhase(phase.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 text-green-700 rounded-2xl flex items-center justify-center mr-5 font-bold shadow-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{phase.title}</h3>
                          <p className="text-gray-600 font-medium">{phase.tasks.length} tasks</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="flex items-center mr-4">
                          <Edit className="w-5 h-5 text-gray-400 mr-3 cursor-pointer hover:text-gray-600 transition-colors" />
                          <Trash2 className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
                        </div>
                        <span className="text-gray-600 font-medium mr-6">{phase.completed}/{phase.total}</span>
                        {expandedPhases.has(phase.id) ? (
                          <ChevronUp className="w-6 h-6 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedPhases.has(phase.id) && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 mb-6 ml-16 leading-relaxed">{phase.description}</p>
                      
                      <div className="space-y-4 ml-16">
                        {phase.tasks.map((task) => (
                          <div key={task.id} className="flex items-start group p-4 rounded-2xl hover:bg-gray-50 transition-all duration-200">
                            <button
                              onClick={() => toggleTask(phase.id, task.id)}
                              className="mt-1 mr-5"
                            >
                              {task.completed ? (
                                <CheckCircle className="w-6 h-6 text-green-500" />
                              ) : (
                                <Circle className="w-6 h-6 text-gray-400 hover:text-indigo-500 transition-colors" />
                              )}
                            </button>
                            <div className="flex-1">
                              <p className={`font-semibold text-lg ${
                                task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                              }`}>
                                {task.title}
                              </p>
                              <p className="text-gray-600 mt-2 leading-relaxed">{task.description}</p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center">
                              <Edit className="w-5 h-5 text-gray-400 mr-3 cursor-pointer hover:text-gray-600 transition-colors" />
                              <Trash2 className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
                              <ChevronDown className="w-5 h-5 text-gray-400 ml-3 cursor-pointer hover:text-gray-600 transition-colors" />
                            </div>
                          </div>
                        ))}

                        {/* Add Custom Task */}
                        <div className="flex items-center mt-6 p-4 bg-gray-50 rounded-2xl">
                          <input
                            type="text"
                            value={customTask}
                            onChange={(e) => setCustomTask(e.target.value)}
                            placeholder="Add a custom step..."
                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-medium"
                            onKeyPress={(e) => e.key === 'Enter' && addCustomTask(phase.id)}
                          />
                          <button
                            onClick={() => addCustomTask(phase.id)}
                            className="ml-3 p-3 text-indigo-600 hover:bg-indigo-100 rounded-2xl transition-all duration-200"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Phase Reflection */}
                      <div className="mt-8 ml-16">
                        <h4 className="font-bold text-gray-900 mb-4 text-lg">Phase Reflection</h4>
                        <textarea
                          placeholder={`Reflect on your journey in this ${phase.title} phase...`}
                          className="w-full p-4 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-24 transition-all duration-200 font-medium leading-relaxed"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default AIRoadmapBuilder;