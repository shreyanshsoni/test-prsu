export interface Student {
  id: string;
  name: string;
  avatar: string;
  grade: number;
  collegeGoal: string;
  lastActivity: number; // days
  progress: number; // percentage
  matrixScores: {
    clarity: number;
    engagement: number;
    preparation: number;
    support: number;
  };
  scoreHistory: Array<{
    date: string;
    score: number;
  }>;
  roadmapStage: 'Early' | 'Mid' | 'Late';
  status: 'On Track' | 'Needs Attention' | 'At Risk';
  milestones: Array<{
    id: string;
    name: string;
    completed: boolean;
    dateCompleted?: string;
    description?: string;
  }>;
  counselorNotes: string;
  recentActivity: Array<{
    id: string;
    type: 'goal_update' | 'reflection' | 'milestone' | 'activity';
    description: string;
    date: string;
  }>;
  academicGoals: Array<{
    id: string;
    title: string;
    category: 'Academic' | 'Extracurricular' | 'Career' | 'Personal';
    status: 'Completed' | 'Incomplete';
    dateCreated: string;
    dateCompleted?: string;
    description?: string;
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