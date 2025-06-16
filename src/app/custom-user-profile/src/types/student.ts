export interface StudentData {
  // Where I Am
  gradeLevel: string;
  schoolType: string;
  gpa: {
    weighted: string;
    unweighted: string;
  };
  classRank?: string;
  
  // What I've Done
  standardizedTests: Array<{
    type: string;
    score: string;
    date?: string;
  }>;
  advancedClasses: Array<{
    type: string;
    subject: string;
    score?: string;
  }>;
  academicAwards: string[];
  
  // How I Spend My Time
  extracurriculars: Array<{
    title: string;
    role: string;
    hoursPerWeek: string;
    duration: string;
    description?: string;
  }>;
  workExperience: Array<{
    title: string;
    company: string;
    duration: string;
    description?: string;
  }>;
  familyResponsibilities: string[];
  
  // What I'm Proud Of
  projects: Array<{
    title: string;
    description: string;
    skills?: string[];
  }>;
  passions: string[];
  uniqueFact: string;
  
  // What I'm Working Toward
  careerGoals: string[];
  collegeGoals: string[];
  interests: string[];
  opportunityTypes: string[];
}

export interface SectionProgress {
  whereIAm: boolean;
  whatIveDone: boolean;
  howISpendTime: boolean;
  whatImProudOf: boolean;
  whatImWorkingToward: boolean;
}