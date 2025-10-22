import { useState, useEffect } from 'react';

interface DashboardStats {
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
  students: Student[];
}

interface Student {
  id: string;
  name: string;
  grade: string | null;
  collegeGoal: string | null;
  progress: number;
  totalRoadmaps: number;
  completedRoadmaps: number;
  inProgressRoadmaps: number;
  pausedRoadmaps: number;
  cancelledRoadmaps: number;
  matrixScores: any;
  assessmentStage?: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardSummary {
  totalStudents: number;
  totalRoadmaps: number;
  completedRoadmaps: number;
  totalPhases: number;
  completedPhases: number;
  totalTasks: number;
  completedTasks: number;
  totalAssessments: number;
  averageAssessmentScore: number;
}

interface DashboardStatsResponse {
  success: boolean;
  message: string;
  stats: DashboardStats;
  summary: DashboardSummary;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/counselor/dashboard-stats?t=${Date.now()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: DashboardStatsResponse = await response.json();
        
        if (data.success) {
          setStats(data.stats);
          setSummary(data.summary);
        } else {
          throw new Error(data.message || 'Failed to fetch dashboard stats');
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return {
    stats,
    summary,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      setError(null);
      // Re-trigger the useEffect
      window.location.reload();
    }
  };
};
