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
  roadmapStage?: 'Early' | 'Mid' | 'Late';
  assessmentStage?: 'Early' | 'Mid' | 'Late';
  createdAt: string;
  updatedAt: string;
}

interface DashboardSummary {
  totalStudents: number;
  studentsWithAssessments: number;
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
        
        // Check localStorage for cached data first
        const cacheKey = 'dashboardStatsCache';
        const cacheTimestampKey = 'dashboardStatsTimestamp';
        const cacheExpiry = 5 * 60 * 1000; // 5 minutes in milliseconds
        
        if (typeof window !== 'undefined') {
          const cachedData = localStorage.getItem(cacheKey);
          const cachedTimestamp = localStorage.getItem(cacheTimestampKey);
          
          if (cachedData && cachedTimestamp) {
            const now = Date.now();
            const cacheAge = now - parseInt(cachedTimestamp);
            
            if (cacheAge < cacheExpiry) {
              // Use cached data if it's less than 5 minutes old
              const parsedData = JSON.parse(cachedData);
              setStats(parsedData.stats);
              setSummary(parsedData.summary);
              setIsLoading(false);
              return;
            } else {
              // Cache expired, clear it
              localStorage.removeItem(cacheKey);
              localStorage.removeItem(cacheTimestampKey);
            }
          }
        }
        
        const response = await fetch(`/api/counselor/dashboard-stats?t=${Date.now()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: DashboardStatsResponse = await response.json();
        
        if (data.success) {
          setStats(data.stats);
          setSummary(data.summary);
          
          // Cache the data
          if (typeof window !== 'undefined') {
            localStorage.setItem(cacheKey, JSON.stringify({
              stats: data.stats,
              summary: data.summary
            }));
            localStorage.setItem(cacheTimestampKey, Date.now().toString());
          }
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
      // Clear cache and force fresh data fetch
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dashboardStatsCache');
        localStorage.removeItem('dashboardStatsTimestamp');
      }
      setIsLoading(true);
      setError(null);
      // Re-trigger the useEffect
      window.location.reload();
    },
    clearCache: () => {
      // Clear cache without refetching
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dashboardStatsCache');
        localStorage.removeItem('dashboardStatsTimestamp');
      }
    }
  };
};
