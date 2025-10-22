import React from 'react';
import CircularProgress from './CircularProgress';
import StageDistributionChart from './StageDistributionChart';
import CustomRadarChart from './RadarChart';
import StudentsByStage from './StudentsByStage';
import { useDashboardStats } from '../../../hooks/useDashboardStats';
import { useTheme } from '../../../contexts/ThemeContext';

const DashboardOverview: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { stats, summary, isLoading, error } = useDashboardStats();

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>Dashboard Overview</h1>
          <p className={`${isDark ? 'text-dark-muted' : 'text-gray-600'} mt-2`}>Loading dashboard statistics...</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}>
            <div className="animate-pulse">
              <div className="h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded"></div>
            </div>
          </div>
          <div className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-4"></div>
              <div className="h-32 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>Dashboard Overview</h1>
          <p className={`${isDark ? 'text-dark-muted' : 'text-gray-600'} mt-2`}>Error loading dashboard statistics</p>
        </div>
        <div className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}>
          <div className="text-center">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-gray-900'} mb-2`}>Unable to Load Dashboard</h3>
            <p className={`${isDark ? 'text-dark-muted' : 'text-gray-600'} mb-4`}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className={`px-4 py-2 ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-lg transition-colors`}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!stats || !summary) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>Dashboard Overview</h1>
          <p className={`${isDark ? 'text-dark-muted' : 'text-gray-600'} mt-2`}>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>Dashboard Overview</h1>
        <p className={`${isDark ? 'text-dark-muted' : 'text-gray-600'} mt-2`}>
          Monitor student progress and engagement across your cohort
        </p>
        <div className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-500'} mt-1`}>
          Real-time data from {summary.totalStudents} students • {summary.completedRoadmaps}/{summary.totalRoadmaps} roadmaps completed
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Average Progress Circle */}
        <div className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}>
          <div className="flex flex-col items-center">
            <CircularProgress progress={stats.averageProgress} />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-gray-900'} mt-4`}>Average Roadmap Completion</h3>
            <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-500'} text-center mt-2`}>
              Overall progress across all students in your cohort
            </p>
            <div className={`text-xs ${isDark ? 'text-dark-muted' : 'text-gray-400'} mt-1`}>
              Based on {summary.totalRoadmaps} total roadmaps
            </div>
          </div>
        </div>

        {/* Stage Distribution */}
        <div className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-gray-900'} mb-4`}>Stage Distribution</h3>
          <StageDistributionChart data={stats.stageDistribution} />
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-200 rounded mr-2"></div>
              <span className={`text-xs ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>Early ({stats.stageDistribution.Early}%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-400 rounded mr-2"></div>
              <span className={`text-xs ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>Mid ({stats.stageDistribution.Mid}%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
              <span className={`text-xs ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>Late ({stats.stageDistribution.Late}%)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PRSU Matrix Radar Chart */}
        <div className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-gray-900'} mb-4`}>Student Readiness Overview</h3>
          <CustomRadarChart data={stats.averageMatrix} />
          <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-500'} text-center mt-4`}>
            Average scores across key readiness areas
          </p>
          <div className={`text-xs ${isDark ? 'text-dark-muted' : 'text-gray-400'} text-center mt-2`}>
            Based on {summary.totalAssessments} assessments
          </div>
        </div>

        {/* Students by Stage */}
        <div className={`${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-gray-900'} mb-4`}>Students by Roadmap Stage</h3>
          <StudentsByStage students={stats.students} />
        </div>
      </div>

    </div>
  );
};

export default DashboardOverview;
