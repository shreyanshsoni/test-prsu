export interface Student {
  id: string;
  name: string;
  avatar?: string; // Made optional since we're using initials now
  grade: number | string | null;
  collegeGoal: string | null;
  lastActivity?: number; // days
  progress: number; // percentage
  progressText?: string; // Progress display text (e.g., "5/27" or "No roadmap")
  totalRoadmaps?: number; // NEW: Total roadmaps count
  completedRoadmaps?: number; // NEW: Completed roadmaps count
  inProgressRoadmaps?: number; // NEW: In progress roadmaps count
  pausedRoadmaps?: number; // NEW: Paused roadmaps count
  cancelledRoadmaps?: number; // NEW: Cancelled roadmaps count
  taskCompletion?: {
    total: number;
    completed: number;
  };
  matrixScores?: {
    clarity: number;
    engagement: number;
    preparation: number;
    support: number;
  } | null;
  scoreHistory?: Array<{
    date: string;
    score: number;
  }>;
  roadmapStage?: 'Early' | 'Mid' | 'Late'; // Made optional
  assessmentStage?: 'Early' | 'Mid' | 'Late'; // NEW: Assessment-based stage
  status?: 'On Track' | 'Needs Attention' | 'At Risk';
  milestones?: Array<{
    id: string;
    name: string;
    completed: boolean;
    dateCompleted?: string;
    description?: string;
  }>;
  counselorNotes?: Array<{
    id: string;
    text: string;
    author: string;
    date: string;
    updatedAt?: string;
    counselorUserId?: string;
    isOwnNote?: boolean;
  }>;
  recentActivity?: Array<{
    id: string;
    type: 'goal_update' | 'reflection' | 'milestone' | 'activity';
    description: string;
    date: string;
  }>;
  academicGoals?: Array<{
    id: string;
    title: string;
    category: 'Academic' | 'Extracurricular' | 'Career' | 'Personal';
    status: 'Completed' | 'Incomplete';
    dateCreated: string;
    dateCompleted?: string;
    description?: string;
    dueDate?: string;
    priority?: 'high' | 'medium' | 'low';
  }>;
}

export type FilterType = 'All' | number | string;
export type ViewMode = 'dashboard' | 'table' | 'focus' | 'goals';

export interface FilterOption {
  value: FilterType;
  label: string;
}

export interface DashboardStats {
  averageProgress: number;
  stageDistribution: {
    Early: number;
    Mid: number;
    Late: number;
  };
  averageMatrix: {
    clarity: number;
    engagement: number;
    preparation: number;
    support: number;
  };
  topPerformers: Student[];
  atRiskStudents: Student[];
}
