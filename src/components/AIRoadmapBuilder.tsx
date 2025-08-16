import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, User, BookOpen, Target, Users, ArrowRight, RotateCcw, Edit, Trash2, Plus, Calendar, Clock, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useTheme } from '../app/contexts/ThemeContext';
import { StarryBackground } from './ui/StarryBackground';
import { calculateScores, getCategoryDescription, SCORING_CONSTANTS } from '../lib/utils/scoring';
import { TASK_LIBRARY } from '../lib/types/taskLibrary';

interface AssessmentData {
  clarity: number;
  engagement: number;
  preparation: number;
  support: number;
  responses: Record<string, string>;
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
    question: 'How clear do you feel about what you want to study or do after high school?',
    options: [
      { value: 'A', label: 'I\'m still exploring and figuring things out' },
      { value: 'B', label: 'I have some ideas but not completely sure' },
      { value: 'C', label: 'I have a good idea of what I want to do' },
      { value: 'D', label: 'I\'m confident and have a specific plan' },
      { value: 'E', label: 'I do not wish to answer' }
    ]
  },
  {
    id: 'clarity_thinking',
    category: 'clarity',
    question: 'How often do you think about your future goals or dreams?',
    options: [
      { value: 'A', label: 'Not very often yet' },
      { value: 'B', label: 'Sometimes when I get the chance' },
      { value: 'C', label: 'Often — I like thinking about it' },
      { value: 'D', label: 'Almost every day' },
      { value: 'E', label: 'I do not wish to answer' }
    ]
  },
  {
    id: 'clarity_research',
    category: 'clarity',
    question: 'Have you tried learning more about careers or subjects that interest you?',
    options: [
      { value: 'A', label: 'Not yet, but I want to' },
      { value: 'B', label: 'I\'ve done a little research' },
      { value: 'C', label: 'Yes, I\'ve looked into several options' },
      { value: 'D', label: 'Yes, I have a clear favorite and know what to do next' },
      { value: 'E', label: 'I do not wish to answer' }
    ]
  },
  {
    id: 'engagement_activities',
    category: 'engagement',
    question: 'How involved are you in activities related to your interests, like clubs, sports, or volunteering?',
    options: [
      { value: 'A', label: 'I\'m not involved right now' },
      { value: 'B', label: 'I sometimes join activities or events' },
      { value: 'C', label: 'I\'m regularly involved in a few activities' },
      { value: 'D', label: 'I\'m very active and take leadership roles' },
      { value: 'E', label: 'I do not wish to answer' }
    ]
  },
  {
    id: 'engagement_motivation',
    category: 'engagement',
    question: 'How motivated do you feel to work towards your goals?',
    options: [
      { value: 'A', label: 'I\'m still trying to find motivation' },
      { value: 'B', label: 'I feel motivated sometimes' },
      { value: 'C', label: 'I\'m mostly motivated to keep going' },
      { value: 'D', label: 'I feel excited and driven most days' },
      { value: 'E', label: 'I do not wish to answer' }
    ]
  },
  {
    id: 'engagement_projects',
    category: 'engagement',
    question: 'Have you completed any projects, competitions, or experiences connected to your interests?',
    options: [
      { value: 'A', label: 'Not yet, but I want to try soon' },
      { value: 'B', label: 'I have done one or two things' },
      { value: 'C', label: 'I have done several' },
      { value: 'D', label: 'I have lots of experience in this area' },
      { value: 'E', label: 'I do not wish to answer' }
    ]
  },
  {
    id: 'preparation_confidence',
    category: 'preparation',
    question: 'How confident do you feel about your schoolwork or skills related to your goals?',
    options: [
      { value: 'A', label: 'I\'m still building my confidence' },
      { value: 'B', label: 'I feel okay but want to improve' },
      { value: 'C', label: 'I feel confident most of the time' },
      { value: 'D', label: 'I\'m very confident and prepared' },
      { value: 'E', label: 'I do not wish to answer' }
    ]
  },
  {
    id: 'preparation_classes',
    category: 'preparation',
    question: 'Have you taken classes or started learning skills connected to what you want to do?',
    options: [
      { value: 'A', label: 'Not yet, but I plan to' },
      { value: 'B', label: 'I\'ve started a few classes or activities' },
      { value: 'C', label: 'I\'m taking most of the right classes or learning skills' },
      { value: 'D', label: 'I\'m fully engaged in the right classes and skill-building' },
      { value: 'E', label: 'I do not wish to answer' }
    ]
  },
  {
    id: 'preparation_tests',
    category: 'preparation',
    question: 'Have you done any tests, certifications, or special programs related to your goals?',
    options: [
      { value: 'A', label: 'Not yet' },
      { value: 'B', label: 'I\'ve started some' },
      { value: 'C', label: 'I\'ve completed a few' },
      { value: 'D', label: 'I\'ve completed all or most that I need' },
      { value: 'E', label: 'I do not wish to answer' }
    ]
  },
  {
    id: 'support_encouragement',
    category: 'support',
    question: 'Do you feel you have people who encourage you in your goals (family, teachers, friends)?',
    options: [
      { value: 'A', label: 'Not really, I mostly feel on my own' },
      { value: 'B', label: 'Sometimes I get encouragement' },
      { value: 'C', label: 'Yes, I have a few supportive people' },
      { value: 'D', label: 'Yes, I have many people cheering me on' },
      { value: 'E', label: 'I do not wish to answer' }
    ]
  },
  {
    id: 'support_asking_help',
    category: 'support',
    question: 'How comfortable do you feel asking for help when you need it?',
    options: [
      { value: 'A', label: 'It\'s hard for me to ask for help' },
      { value: 'B', label: 'I sometimes ask when I really need it' },
      { value: 'C', label: 'I usually ask for help without much trouble' },
      { value: 'D', label: 'I feel very comfortable reaching out' },
      { value: 'E', label: 'I do not wish to answer' }
    ]
  },
  {
    id: 'support_mentors',
    category: 'support',
    question: 'Have you connected with mentors, counselors, or others who help with your academic or career plans?',
    options: [
      { value: 'A', label: 'Not yet, but I\'d like to' },
      { value: 'B', label: 'I\'ve met one or two people' },
      { value: 'C', label: 'I regularly talk with some mentors or advisors' },
      { value: 'D', label: 'I have a strong support network of mentors and counselors' },
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
}

function AIRoadmapBuilder({ onClose }: AIRoadmapBuilderProps) {
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
  const [scoringResults, setScoringResults] = useState<any>(null);
  const [llmResponse, setLlmResponse] = useState<any>(null);
  const [isLoadingLlm, setIsLoadingLlm] = useState(false);
  const [llmError, setLlmError] = useState<string | null>(null);

  const calculateAssessment = (responses: Record<string, string>): AssessmentData => {
    // Convert responses to array format for new scoring system
    const answersArray = ASSESSMENT_QUESTIONS.map(q => (responses[q.id] || 'E')) as ('A' | 'B' | 'C' | 'D' | 'E')[];
    
    try {
      const results = calculateScores(answersArray) as any;

    return {
        clarity: results.clarity.score,
        engagement: results.engagement.score,
        preparation: results.preparation.score,
        support: results.support.score,
      responses
    };
    } catch (error) {
      console.error('Scoring error:', error);
      // Fallback to neutral scores
      return {
        clarity: 50,
        engagement: 50,
        preparation: 50,
        support: 50,
        responses
      };
    }
  };

  const generateStage = (data: AssessmentData): Stage => {
    const totalScore = data.clarity + data.engagement + data.preparation + data.support;
    const strengths: string[] = [];
    const growthAreas: string[] = [];

    // Identify strengths and growth areas
    if (data.clarity > 75) strengths.push('Clear sense of direction');
    else growthAreas.push('Career/academic clarity');

    if (data.engagement > 75) strengths.push('High engagement and motivation');
    else growthAreas.push('Engagement and participation');

    if (data.preparation > 75) strengths.push('Strong academic preparation');
    else growthAreas.push('Academic and planning preparation');

    if (data.support > 75) strengths.push('Good support system');
    else growthAreas.push('Support network and resources');

    let level: 'early' | 'mid' | 'late';
    let title: string;
    let description: string;
    let phases: Phase[];
    let reflectionPrompts: string[];

    if (totalScore < 250) {
      level = 'early';
      title = 'Early Stage: Foundation Building';
      description = 'Focus on exploration, building awareness, and establishing good habits.';
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
    } else if (totalScore < 300) {
      level = 'mid';
      title = 'Mid Stage: Focused Development';
      description = 'Build on your foundation with more specific planning and skill development.';
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
      description = 'Execute your plans with concrete applications and final preparations.';
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
    if (assessmentStep < ASSESSMENT_QUESTIONS.length - 1) {
      setAssessmentStep(prev => prev + 1);
    } else {
      // Calculate scores using new system
      const answersArray = ASSESSMENT_QUESTIONS.map(q => (responses[q.id] || 'E')) as ('A' | 'B' | 'C' | 'D' | 'E')[];
      try {
        const results = calculateScores(answersArray);
        setScoringResults(results);
        setCurrentStep('scoring-results');
      } catch (error) {
        console.error('Scoring error:', error);
        // Fallback to old system
      const data = calculateAssessment(responses);
      setAssessmentData(data);
      const generatedStage = generateStage(data);
      setStage(generatedStage);
      setCurrentStep('results');
      }
    }
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
    setScoringResults(null);
    setLlmResponse(null);
    setIsLoadingLlm(false);
    setLlmError(null);
  };

  const calculateOverallProgress = () => {
    if (!stage) return 0;
    const totalTasks = stage.phases.reduce((sum, phase) => sum + phase.total, 0);
    const completedTasks = stage.phases.reduce((sum, phase) => sum + phase.completed, 0);
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const generateLLMRoadmap = async (assessmentData: any) => {
    setIsLoadingLlm(true);
    setLlmError(null);
    
    try {
      const response = await fetch('/api/ai-roadmap-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assessmentData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Add error information if the response indicates failure
      const responseData = result.data;
      if (responseData && (responseData.error || !responseData.roadmap || responseData.roadmap.length === 0)) {
        responseData.error = responseData.error || 'Failed to generate roadmap';
      }

      setLlmResponse(responseData);
      setCurrentStep('llm-results');
    } catch (error) {
      console.error('LLM Roadmap Generation Error:', error);
      setLlmError(error instanceof Error ? error.message : 'Failed to generate roadmap');
      // Fallback to old system
      const data = calculateAssessment(responses);
      setAssessmentData(data);
      const generatedStage = generateStage(data);
      setStage(generatedStage);
      setCurrentStep('results');
    } finally {
      setIsLoadingLlm(false);
    }
  };

  const createRoadmapFromLLM = async () => {
    if (!llmResponse || !llmResponse.roadmap || llmResponse.roadmap.length === 0) {
      return;
    }

    try {
      // Create goal from assessment data
      const goal = {
        title: `AI-Generated ${scoringResults.stage} Stage Roadmap`,
        identity: `${scoringResults.stage} Stage Student`,
        deadline: new Date(Date.now() + 4 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 4 months from now
      };

      // Transform LLM roadmap to phases
      const phases = llmResponse.roadmap.map((month: any, index: number) => ({
        title: `Month ${month.month}`,
        description: `Tasks and reflections for month ${month.month}`,
        tasks: [
          ...month.tasks.map((task: any, taskIndex: number) => ({
            title: task.task,
            notes: `${task.area} - ${task.zone}`,
            dueDate: null,
            completed: false
          })),
          {
            title: month.reflection?.task || 'Reflection Task',
            notes: `${month.reflection?.area || 'Support'} - ${month.reflection?.zone || 'Development'}`,
            dueDate: null,
            completed: false
          }
        ],
        reflection: month.reflection?.task || ''
      }));

      // Create the roadmap using the existing API
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

      if (!response.ok) {
        throw new Error('Failed to create roadmap');
      }

      const result = await response.json();
      
      if (result.roadmapPlanner) {
        // Redirect to the roadmap planner tab
        window.location.href = '/?tab=roadmapPlanner';
      }
    } catch (error) {
      console.error('Error creating roadmap from LLM:', error);
      alert('Failed to create roadmap. Please try again.');
    }
  };

  if (currentStep === 'welcome') {
    return (
      <div className={`fixed inset-0 ${isDark ? 'bg-dark-background' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'} flex items-center justify-center p-4 z-[9999]`}>
        {isDark && <StarryBackground />}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-light-card/20 dark:bg-dark-card/20 backdrop-blur-sm text-light-text dark:text-dark-text hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
        <div className="max-w-2xl mx-auto text-center">
          <div className={`${isDark ? 'bg-dark-card/90' : 'bg-white/80'} backdrop-blur-sm rounded-3xl shadow-2xl border ${isDark ? 'border-dark-border/20' : 'border-white/20'} p-10 transition-all duration-500 hover:shadow-3xl`}>
            <div className="mb-6">
              <div className="w-10 h-16 flex items-center justify-center mx-auto mb-6">
                <img src="/P_Logo.png" alt="P Logo" className="w-10 h-16" />
              </div>
                             <h1 className={`text-4xl font-bold bg-gradient-to-r ${isDark ? 'from-white to-gray-300' : 'from-gray-900 to-gray-700'} bg-clip-text text-transparent mb-3`}>
                Your Personalized AI Roadmap
              </h1>
               <p className={`text-xl ${isDark ? 'text-dark-text' : 'text-gray-600'} leading-relaxed`}>
                Get a tailored academic and career plan designed just for you
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              {Object.entries(CATEGORY_ICONS).map(([category, Icon]) => (
                 <div key={category} className={`text-center p-6 rounded-2xl ${isDark ? 'bg-dark-card border-dark-border' : 'bg-gradient-to-br from-white to-gray-50 border border-gray-100'} shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1`}>
                   <Icon className="w-10 h-10 mx-auto mb-3 text-blue-600" />
                   <p className={`text-sm font-semibold capitalize ${isDark ? 'text-dark-text' : 'text-gray-700'}`}>{category}</p>
                </div>
              ))}
            </div>

            <div className="text-left space-y-4 mb-10">
              <div className="flex items-center">
                 <div className={`w-8 h-8 ${isDark ? 'bg-green-900' : 'bg-green-100'} rounded-full flex items-center justify-center mr-4`}>
                   <CheckCircle className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                 <span className={`${isDark ? 'text-dark-text' : 'text-gray-700'} font-medium`}>Quick 5-minute assessment</span>
              </div>
              <div className="flex items-center">
                 <div className={`w-8 h-8 ${isDark ? 'bg-green-900' : 'bg-green-100'} rounded-full flex items-center justify-center mr-4`}>
                   <CheckCircle className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                 <span className={`${isDark ? 'text-dark-text' : 'text-gray-700'} font-medium`}>Personalized action plan</span>
              </div>
              <div className="flex items-center">
                 <div className={`w-8 h-8 ${isDark ? 'bg-green-900' : 'bg-green-100'} rounded-full flex items-center justify-center mr-4`}>
                   <CheckCircle className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                 <span className={`${isDark ? 'text-dark-text' : 'text-gray-700'} font-medium`}>Built-in reflection tools</span>
              </div>
              <div className="flex items-center">
                 <div className={`w-8 h-8 ${isDark ? 'bg-green-900' : 'bg-green-100'} rounded-full flex items-center justify-center mr-4`}>
                   <CheckCircle className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                 <span className={`${isDark ? 'text-dark-text' : 'text-gray-700'} font-medium`}>Progress tracking</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep('assessment')}
               className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-4 px-8 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-500 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Start Your Assessment
              <ArrowRight className="w-5 h-5 ml-3" />
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
      <div className={`fixed inset-0 ${isDark ? 'bg-dark-background' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'} py-12 px-4 z-[9999]`}>
        {isDark && <StarryBackground />}
        <div className="max-w-2xl mx-auto h-full flex flex-col justify-center">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${isDark ? 'text-dark-text' : 'text-gray-600'}`}>Question {assessmentStep + 1} of {ASSESSMENT_QUESTIONS.length}</span>
              <span className={`text-sm font-medium ${isDark ? 'text-dark-text' : 'text-gray-600'}`}>{Math.round(progress)}% Complete</span>
            </div>
                         <div className={`w-full ${isDark ? 'bg-dark-card/50' : 'bg-white/50'} rounded-full h-3 shadow-inner`}>
              <div 
                 className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className={`${isDark ? 'bg-dark-card/90' : 'bg-white/80'} backdrop-blur-sm rounded-3xl shadow-2xl border ${isDark ? 'border-dark-border/20' : 'border-white/20'} p-10`}>
            <div className="mb-6">
              <div className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-semibold mb-6 ${CATEGORY_COLORS[currentQuestion.category as keyof typeof CATEGORY_COLORS]} shadow-sm`}>
                {React.createElement(CATEGORY_ICONS[currentQuestion.category as keyof typeof CATEGORY_ICONS], { className: "w-4 h-4 mr-2" })}
                {currentQuestion.category.charAt(0).toUpperCase() + currentQuestion.category.slice(1)}
              </div>
                             <h2 className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'} mb-2 leading-relaxed`}>
                {currentQuestion.question}
              </h2>
            </div>

            <div className="space-y-4">
              {currentQuestion.options.map((option) => (
                <label
                  key={option.value}
                   className={`flex items-center p-5 border-2 ${isDark ? 'border-dark-border hover:bg-dark-card/50 hover:border-primary-600' : 'border-gray-200 hover:bg-blue-50 hover:border-indigo-300'} rounded-2xl cursor-pointer transition-all duration-300 group`}
                >
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={option.value}
                    onChange={() => handleResponse(currentQuestion.id, option.value)}
                    checked={responses[currentQuestion.id] === option.value}
                     className="w-5 h-5 text-blue-600 mr-4 focus:ring-2 focus:ring-blue-500"
                  />
                   <span className={`${isDark ? 'text-dark-text group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'} font-medium transition-colors`}>{option.label}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-between mt-10">
              <button
                onClick={() => assessmentStep > 0 ? setAssessmentStep(prev => prev - 1) : setCurrentStep('welcome')}
                 className={`px-8 py-3 border-2 ${isDark ? 'border-dark-border text-dark-text hover:bg-dark-card hover:border-primary-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'} rounded-2xl transition-all duration-300 font-medium`}
              >
                Back
              </button>
              <button
                onClick={nextAssessmentStep}
                disabled={responses[currentQuestion.id] === undefined}
                   className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-2xl hover:from-blue-700 hover:to-blue-500 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {assessmentStep === ASSESSMENT_QUESTIONS.length - 1 ? 'Get My Roadmap' : 'Next'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'scoring-results' && scoringResults) {
    return (
      <div className={`fixed inset-0 ${isDark ? 'bg-dark-background' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'} flex items-center justify-center p-4 z-[9999]`}>
        {isDark && <StarryBackground />}
        <div className="max-w-2xl w-full mx-auto">
          <div className={`${isDark ? 'bg-dark-card/90' : 'bg-white/80'} backdrop-blur-sm rounded-3xl shadow-2xl border ${isDark ? 'border-dark-border/20' : 'border-white/20'} p-8`}>
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className={`text-3xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'} mb-2`}>
                {scoringResults.stage} Stage
              </h1>
              <p className={`text-xl ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>
                Total Score: {scoringResults.totalScore} / {SCORING_CONSTANTS.TOTAL_MAX_SCORE}
              </p>
            </div>

            {/* Area Scores */}
            <div className="space-y-6 mb-8">
              {[
                { key: 'clarity', label: 'Clarity', icon: Target, color: 'bg-blue-500' },
                { key: 'engagement', label: 'Engagement', icon: BookOpen, color: 'bg-green-500' },
                { key: 'preparation', label: 'Preparation', icon: CheckCircle, color: 'bg-purple-500' },
                { key: 'support', label: 'Support', icon: Users, color: 'bg-orange-500' }
              ].map(({ key, label, icon: Icon, color }) => {
                const area = scoringResults[key];
                return (
                  <div key={key} className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mr-4">
                          <Icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <span className="font-semibold text-gray-800 text-lg">{label}</span>
                          <p className="text-sm text-gray-500">{getCategoryDescription(area.category)}</p>
                        </div>
                      </div>
                                             <div className="text-right">
                         <span className="text-lg font-bold text-gray-900">{area.score}</span>
                         <span className="text-sm text-gray-500">/ {SCORING_CONSTANTS.AREA_MAX_SCORE}</span>
                         <div className="text-xs font-medium mt-1">
                           {area.category === 'Development Area' && (
                             <span className="text-red-600 bg-red-100 px-2 py-1 rounded-full">Development</span>
                           )}
                           {area.category === 'Balanced Zone' && (
                             <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">Balanced</span>
                           )}
                           {area.category === 'Proficiency Area' && (
                             <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full">Proficiency</span>
                           )}
                         </div>
                       </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner overflow-hidden">
                      <div 
                        className={`${color} h-3 rounded-full transition-all duration-700 shadow-sm`}
                        style={{ width: `${(area.score / SCORING_CONSTANTS.AREA_MAX_SCORE) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Error Display */}
            {llmError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm">Error: {llmError}</p>
              </div>
            )}

            {/* OK Button */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  generateLLMRoadmap(scoringResults);
                }}
                disabled={isLoadingLlm}
                className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-2xl hover:from-blue-700 hover:to-blue-500 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${isLoadingLlm ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoadingLlm ? 'Generating Roadmap...' : 'OK'}
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
                           llmResponse.summary?.includes('Unable to generate') ||
                           llmResponse.summary?.includes('try again') ||
                           llmResponse.summary?.includes('Failed to generate') ||
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
                {isErrorResponse ? 'Error Response' : 'LLM Response'}
              </h1>
              <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>
                {isErrorResponse ? 'Error details from AI Roadmap Generator' : 'Raw JSON output from AI Roadmap Generator'}
              </p>
            </div>

            {/* Scrollable JSON Output */}
            <div className="flex-1 overflow-auto mb-6">
              <pre className={`${isDark ? 'bg-gray-900 text-green-400' : 'bg-gray-100 text-gray-800'} p-4 rounded-xl text-sm font-mono whitespace-pre-wrap overflow-x-auto`}>
                {JSON.stringify(llmResponse, null, 2)}
              </pre>
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
                        <div key={category} className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center justify-between mb-4">
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