import { PhaseData, RoadmapPlanner } from '../../types/types';

export const initialPhaseData: PhaseData[] = [
  {
    id: 'phase-1',
    title: 'Self-Discovery',
    description: 'Explore your interests, strengths, and academic aspirations',
    tasks: [
      {
        id: 'task-1-1',
        title: 'Complete strengths and interests assessment',
        completed: true,
        notes: 'I found that my analytical and problem-solving skills are strong. I really enjoy working with data visualization.',
        dueDate: null
      },
      {
        id: 'task-1-2',
        title: 'Research potential career paths in data science',
        completed: true,
        notes: '',
        dueDate: null
      },
      {
        id: 'task-1-3',
        title: 'Interview a professional in your field of interest',
        completed: false,
        notes: '',
        dueDate: '2024-10-15'
      },
      {
        id: 'task-1-4',
        title: 'Define your academic and career goals',
        completed: false,
        notes: '',
        dueDate: null
      }
    ]
  },
  {
    id: 'phase-2',
    title: 'Academic Alignment',
    description: 'Identify programs and courses that match your goals',
    tasks: [
      {
        id: 'task-2-1',
        title: 'Research top data science MS programs',
        completed: false,
        notes: '',
        dueDate: null
      },
      {
        id: 'task-2-2',
        title: 'Compare program requirements and prerequisites',
        completed: false,
        notes: '',
        dueDate: null
      },
      {
        id: 'task-2-3',
        title: 'Identify gaps in your academic preparation',
        completed: false,
        notes: '',
        dueDate: null
      },
      {
        id: 'task-2-4',
        title: 'Create plan to address academic prerequisites',
        completed: false,
        notes: '',
        dueDate: null
      }
    ]
  },
  {
    id: 'phase-3',
    title: 'Application Prep',
    description: 'Prepare materials and build your application portfolio',
    tasks: [
      {
        id: 'task-3-1',
        title: 'Update academic resume',
        completed: false,
        notes: '',
        dueDate: null
      },
      {
        id: 'task-3-2',
        title: 'Request transcripts from previous institutions',
        completed: false,
        notes: '',
        dueDate: null
      },
      {
        id: 'task-3-3',
        title: 'Draft personal statement',
        completed: false,
        notes: '',
        dueDate: null
      },
      {
        id: 'task-3-4',
        title: 'Identify and contact potential recommendation writers',
        completed: false,
        notes: '',
        dueDate: null
      },
      {
        id: 'task-3-5',
        title: 'Register for required standardized tests',
        completed: false,
        notes: '',
        dueDate: null
      }
    ]
  },
  {
    id: 'phase-4',
    title: 'Submission & Follow-Up',
    description: 'Submit applications and manage the waiting period',
    tasks: [
      {
        id: 'task-4-1',
        title: 'Submit applications before deadlines',
        completed: false,
        notes: '',
        dueDate: null
      },
      {
        id: 'task-4-2',
        title: 'Confirm all materials were received',
        completed: false,
        notes: '',
        dueDate: null
      },
      {
        id: 'task-4-3',
        title: 'Prepare for potential interviews',
        completed: false,
        notes: '',
        dueDate: null
      },
      {
        id: 'task-4-4',
        title: 'Research financial aid and scholarship opportunities',
        completed: false,
        notes: '',
        dueDate: null
      }
    ]
  },
  {
    id: 'phase-5',
    title: 'Reflection & Next Steps',
    description: 'Evaluate offers and prepare for your academic journey',
    tasks: [
      {
        id: 'task-5-1',
        title: 'Compare acceptance offers',
        completed: false,
        notes: '',
        dueDate: null
      },
      {
        id: 'task-5-2',
        title: 'Make final decision and submit deposit',
        completed: false,
        notes: '',
        dueDate: null
      },
      {
        id: 'task-5-3',
        title: 'Create pre-enrollment preparation plan',
        completed: false,
        notes: '',
        dueDate: null
      },
      {
        id: 'task-5-4',
        title: 'Reflect on application journey and lessons learned',
        completed: false,
        notes: '',
        dueDate: null
      }
    ]
  }
];

export const initialRoadmapPlanners: RoadmapPlanner[] = [
  {
    id: 'roadmap-1',
    goal: {
      title: "Get into Data Science MS Program",
      identity: "First-gen STEM Researcher",
      deadline: "2025-05-15",
    },
    phases: initialPhaseData,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  }
]; 