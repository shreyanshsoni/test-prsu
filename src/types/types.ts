export interface Program {
  id: string;
  title: string;
  organization: string;
  description: string;
  deadline: string;
  location: string;
  type: string | 'internship' | 'scholarship' | 'summer' | 'research';
  imageUrl: string;
  eligibility: string | string[];
  stipend?: string;
  field?: string;
  degreeLevel?: string;
  requirements?: string | string[];
  startDate?: string;
}

// Tool type for the roadmap planner sidebar
export type ToolType = 'journal' | 'resume' | 'statement' | 'recommendations' | 'resources';

export interface ChecklistItem {
  id: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'completed';
  deadline: string;
  programId: string;
  type: 'standard' | 'program_specific';
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'deadline' | 'preparation' | 'prerequisite';
  completed: boolean;
}

export interface AcademicYear {
  year: number;
  milestones: RoadmapMilestone[];
}

// New types for academic roadmaps feature
export interface AcademicRoadmapModel {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  programs: Program[];
}

export interface RoadmapProgramMapping {
  id: string;
  roadmapId: string;
  programId: string;
}

// New types for Roadmap Planner feature
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  notes: string;
  dueDate: string | null;
}

export interface PhaseData {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
  reflection?: string;
}

export interface Goal {
  title: string;
  identity: string;
  deadline: string;
  careerBlurb?: string;
}

export interface RoadmapPlanner {
  id: string;
  goal: Goal;
  careerBlurb?: string;
  phases: PhaseData[];
  createdAt: string;
  lastModified: string;
}