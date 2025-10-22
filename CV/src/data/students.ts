import { Student } from '../types';

export const students: Student[] = [
  {
    id: '1',
    name: 'Sophia Lee',
    avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=200',
    grade: 12,
    collegeGoal: 'Stanford',
    lastActivity: 3,
    progress: 85,
    roadmapStage: 'Late',
    status: 'On Track',
    matrixScores: {
      clarity: 90,
      engagement: 88,
      preparation: 85,
      support: 80
    },
    scoreHistory: [
      { date: '2024-01-01', score: 75 },
      { date: '2024-01-15', score: 78 },
      { date: '2024-02-01', score: 82 },
      { date: '2024-02-15', score: 85 },
      { date: '2024-03-01', score: 85 }
    ],
    milestones: [
      { id: '1', name: 'Complete College Research', completed: true, dateCompleted: '2024-01-15' },
      { id: '2', name: 'Submit Applications', completed: true, dateCompleted: '2024-02-01' },
      { id: '3', name: 'Financial Aid Forms', completed: false }
    ],
    counselorNotes: 'Excellent progress on Stanford application. Strong academic performance.',
    recentActivity: [
      { id: '1', type: 'milestone', description: 'Completed college application essays', date: '2024-03-01' },
      { id: '2', type: 'reflection', description: 'Submitted weekly reflection', date: '2024-02-28' }
    ],
    academicGoals: [
      { id: '1', title: 'Maintain 4.0 GPA', category: 'Academic', status: 'Completed', dateCreated: '2024-01-01', dateCompleted: '2024-02-15' },
      { id: '2', title: 'Complete SAT prep course', category: 'Academic', status: 'Completed', dateCreated: '2024-01-10', dateCompleted: '2024-02-20' },
      { id: '3', title: 'Join debate team', category: 'Extracurricular', status: 'Completed', dateCreated: '2024-01-15', dateCompleted: '2024-01-30' },
      { id: '4', title: 'Research Stanford programs', category: 'Career', status: 'Completed', dateCreated: '2024-02-01', dateCompleted: '2024-02-10' }
    ]
  },
  {
    id: '2',
    name: 'Jacob Mitchell',
    avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=200',
    grade: 12,
    collegeGoal: 'Top Engineering School',
    lastActivity: 5,
    progress: 70,
    roadmapStage: 'Mid',
    status: 'Needs Attention',
    matrixScores: {
      clarity: 75,
      engagement: 60,
      preparation: 85,
      support: 65
    },
    scoreHistory: [
      { date: '2024-01-01', score: 60 },
      { date: '2024-01-15', score: 62 },
      { date: '2024-02-01', score: 65 },
      { date: '2024-02-15', score: 68 },
      { date: '2024-03-01', score: 70 }
    ],
    milestones: [
      { id: '1', name: 'Complete College Research', completed: true, dateCompleted: '2024-01-10' },
      { id: '2', name: 'Submit Applications', completed: false },
      { id: '3', name: 'Financial Aid Forms', completed: false }
    ],
    counselorNotes: 'Strong in academics but needs help with planning and engagement.',
    recentActivity: [
      { id: '1', type: 'activity', description: 'Attended engineering workshop', date: '2024-02-25' }
    ],
    academicGoals: [
      { id: '1', title: 'Complete calculus with B+ or higher', category: 'Academic', status: 'Incomplete', dateCreated: '2024-01-05' },
      { id: '2', title: 'Join robotics club', category: 'Extracurricular', status: 'Completed', dateCreated: '2024-01-12', dateCompleted: '2024-01-25' },
      { id: '3', title: 'Shadow an engineer', category: 'Career', status: 'Incomplete', dateCreated: '2024-02-01' }
    ]
  },
  {
    id: '3',
    name: 'Lily Carter',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200',
    grade: 11,
    collegeGoal: 'Liberal Arts College',
    lastActivity: 8,
    progress: 60,
    roadmapStage: 'Mid',
    status: 'Needs Attention',
    matrixScores: {
      clarity: 60,
      engagement: 65,
      preparation: 70,
      support: 55
    },
    scoreHistory: [
      { date: '2024-01-01', score: 50 },
      { date: '2024-01-15', score: 53 },
      { date: '2024-02-01', score: 56 },
      { date: '2024-02-15', score: 58 },
      { date: '2024-03-01', score: 60 }
    ],
    milestones: [
      { id: '1', name: 'Explore Career Interests', completed: true, dateCompleted: '2024-01-20' },
      { id: '2', name: 'College Research Phase', completed: false },
      { id: '3', name: 'Standardized Test Prep', completed: false }
    ],
    counselorNotes: 'Making steady progress. Encourage more career exploration activities.',
    recentActivity: [
      { id: '1', type: 'reflection', description: 'Completed career interest survey', date: '2024-02-20' }
    ],
    academicGoals: [
      { id: '1', title: 'Improve math grade to B', category: 'Academic', status: 'Incomplete', dateCreated: '2024-01-08' },
      { id: '2', title: 'Join student government', category: 'Extracurricular', status: 'Incomplete', dateCreated: '2024-01-20' },
      { id: '3', title: 'Attend college fair', category: 'Career', status: 'Completed', dateCreated: '2024-02-05', dateCompleted: '2024-02-15' }
    ]
  },
  {
    id: '4',
    name: 'Ethan Rivera',
    avatar: 'https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg?auto=compress&cs=tinysrgb&w=200',
    grade: 11,
    collegeGoal: 'Ivy League',
    lastActivity: 10,
    progress: 55,
    roadmapStage: 'Mid',
    status: 'Needs Attention',
    matrixScores: {
      clarity: 50,
      engagement: 45,
      preparation: 80,
      support: 45
    },
    scoreHistory: [
      { date: '2024-01-01', score: 45 },
      { date: '2024-01-15', score: 47 },
      { date: '2024-02-01', score: 50 },
      { date: '2024-02-15', score: 52 },
      { date: '2024-03-01', score: 55 }
    ],
    milestones: [
      { id: '1', name: 'Academic Planning', completed: true, dateCompleted: '2024-01-05' },
      { id: '2', name: 'Extracurricular Development', completed: false },
      { id: '3', name: 'Leadership Opportunities', completed: false }
    ],
    counselorNotes: 'High academic potential but low engagement. Needs motivation boost.',
    recentActivity: [
      { id: '1', type: 'goal_update', description: 'Updated college goal to Ivy League', date: '2024-02-15' }
    ],
    academicGoals: [
      { id: '1', title: 'Maintain honor roll status', category: 'Academic', status: 'Completed', dateCreated: '2024-01-03', dateCompleted: '2024-02-01' },
      { id: '2', title: 'Start tutoring younger students', category: 'Personal', status: 'Incomplete', dateCreated: '2024-01-25' },
      { id: '3', title: 'Research Ivy League requirements', category: 'Career', status: 'Incomplete', dateCreated: '2024-02-10' }
    ]
  },
  {
    id: '5',
    name: 'Isabella Green',
    avatar: 'https://images.pexels.com/photos/1987301/pexels-photo-1987301.jpeg?auto=compress&cs=tinysrgb&w=200',
    grade: 12,
    collegeGoal: 'Pre-Med Program',
    lastActivity: 3,
    progress: 45,
    roadmapStage: 'Early',
    status: 'Needs Attention',
    matrixScores: {
      clarity: 40,
      engagement: 40,
      preparation: 75,
      support: 35
    },
    scoreHistory: [
      { date: '2024-01-01', score: 35 },
      { date: '2024-01-15', score: 38 },
      { date: '2024-02-01', score: 41 },
      { date: '2024-02-15', score: 43 },
      { date: '2024-03-01', score: 45 }
    ],
    milestones: [
      { id: '1', name: 'Medical Career Exploration', completed: false },
      { id: '2', name: 'Science Course Planning', completed: true, dateCompleted: '2024-01-25' },
      { id: '3', name: 'Volunteer Experience', completed: false }
    ],
    counselorNotes: 'Late starter but showing improvement. Focus on planning skills.',
    recentActivity: [
      { id: '1', type: 'activity', description: 'Started volunteer work at hospital', date: '2024-02-28' }
    ],
    academicGoals: [
      { id: '1', title: 'Complete biology with A-', category: 'Academic', status: 'Incomplete', dateCreated: '2024-01-15' },
      { id: '2', title: 'Volunteer at local hospital', category: 'Extracurricular', status: 'Completed', dateCreated: '2024-02-01', dateCompleted: '2024-02-28' },
      { id: '3', title: 'Shadow a doctor', category: 'Career', status: 'Incomplete', dateCreated: '2024-02-10' }
    ]
  },
  {
    id: '6',
    name: 'Aiden Hughes',
    avatar: 'https://images.pexels.com/photos/2599510/pexels-photo-2599510.jpeg?auto=compress&cs=tinysrgb&w=200',
    grade: 10,
    collegeGoal: 'Pre-Med Program',
    lastActivity: 40,
    progress: 40,
    roadmapStage: 'Early',
    status: 'At Risk',
    matrixScores: {
      clarity: 30,
      engagement: 20,
      preparation: 60,
      support: 25
    },
    scoreHistory: [
      { date: '2024-01-01', score: 30 },
      { date: '2024-01-15', score: 32 },
      { date: '2024-02-01', score: 35 },
      { date: '2024-02-15', score: 38 },
      { date: '2024-03-01', score: 40 }
    ],
    milestones: [
      { id: '1', name: 'Academic Foundation', completed: false },
      { id: '2', name: 'Study Skills Development', completed: false },
      { id: '3', name: 'Goal Setting Workshop', completed: false }
    ],
    counselorNotes: 'Requires immediate intervention. Low engagement across all areas.',
    recentActivity: [],
    academicGoals: [
      { id: '1', title: 'Pass all current classes', category: 'Academic', status: 'Incomplete', dateCreated: '2024-01-10' },
      { id: '2', title: 'Meet with school counselor weekly', category: 'Personal', status: 'Incomplete', dateCreated: '2024-01-15' }
    ]
  },
  {
    id: '7',
    name: 'Mia Patel',
    avatar: 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=200',
    grade: 11,
    collegeGoal: 'In-State Program',
    lastActivity: 35,
    progress: 36,
    roadmapStage: 'Early',
    status: 'At Risk',
    matrixScores: {
      clarity: 35,
      engagement: 25,
      preparation: 50,
      support: 30
    },
    scoreHistory: [
      { date: '2024-01-01', score: 25 },
      { date: '2024-01-15', score: 28 },
      { date: '2024-02-01', score: 31 },
      { date: '2024-02-15', score: 34 },
      { date: '2024-03-01', score: 36 }
    ],
    milestones: [
      { id: '1', name: 'Career Interest Assessment', completed: false },
      { id: '2', name: 'Academic Planning', completed: false },
      { id: '3', name: 'College Awareness', completed: false }
    ],
    counselorNotes: 'Slow progress. Consider alternative engagement strategies.',
    recentActivity: [
      { id: '1', type: 'activity', description: 'Missed scheduled meeting', date: '2024-02-10' }
    ],
    academicGoals: [
      { id: '1', title: 'Improve attendance', category: 'Personal', status: 'Incomplete', dateCreated: '2024-01-20' },
      { id: '2', title: 'Complete career assessment', category: 'Career', status: 'Incomplete', dateCreated: '2024-02-01' }
    ]
  },
  {
    id: '8',
    name: 'Logan Turner',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200',
    grade: 10,
    collegeGoal: 'Local University',
    lastActivity: 20,
    progress: 20,
    roadmapStage: 'Early',
    status: 'At Risk',
    matrixScores: {
      clarity: 20,
      engagement: 10,
      preparation: 40,
      support: 15
    },
    scoreHistory: [
      { date: '2024-01-01', score: 15 },
      { date: '2024-01-15', score: 16 },
      { date: '2024-02-01', score: 17 },
      { date: '2024-02-15', score: 18 },
      { date: '2024-03-01', score: 20 }
    ],
    milestones: [
      { id: '1', name: 'Initial Assessment', completed: false },
      { id: '2', name: 'Goal Setting', completed: false },
      { id: '3', name: 'Academic Support', completed: false }
    ],
    counselorNotes: 'Critical intervention needed. Very low engagement and progress.',
    recentActivity: [],
    academicGoals: [
      { id: '1', title: 'Meet minimum GPA requirement', category: 'Academic', status: 'Incomplete', dateCreated: '2024-01-25' },
      { id: '2', title: 'Attend study skills workshop', category: 'Personal', status: 'Incomplete', dateCreated: '2024-02-05' }
    ]
  }
];

export const getUniqueGrades = (): number[] => {
  return [...new Set(students.map(student => student.grade))].sort((a, b) => a - b);
};

export const getUniqueCollegeGoals = (): string[] => {
  return [...new Set(students.map(student => student.collegeGoal))].sort();
};

export const calculateDashboardStats = () => {
  const averageProgress = students.reduce((sum, student) => sum + student.progress, 0) / students.length;
  
  const stageDistribution = students.reduce((acc, student) => {
    acc[student.roadmapStage]++;
    return acc;
  }, { Early: 0, Mid: 0, Late: 0 });

  // Convert to percentages
  const total = students.length;
  Object.keys(stageDistribution).forEach(key => {
    stageDistribution[key] = Math.round((stageDistribution[key] / total) * 100);
  });

  const averageMatrix = students.reduce((acc, student) => {
    acc.clarity += student.matrixScores.clarity;
    acc.engagement += student.matrixScores.engagement;
    acc.preparation += student.matrixScores.preparation;
    acc.support += student.matrixScores.support;
    return acc;
  }, { clarity: 0, engagement: 0, preparation: 0, support: 0 });

  Object.keys(averageMatrix).forEach(key => {
    averageMatrix[key] = Math.round(averageMatrix[key] / students.length);
  });

  const topPerformers = [...students]
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 5);

  const atRiskStudents = students.filter(student => student.status === 'At Risk');

  return {
    averageProgress: Math.round(averageProgress),
    stageDistribution,
    averageMatrix,
    topPerformers,
    atRiskStudents
  };
};