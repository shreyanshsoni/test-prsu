import React from 'react';
import CircularProgress from './CircularProgress';
import StageDistributionChart from './StageDistributionChart';
import CustomRadarChart from './RadarChart';
import StudentsByStage from './StudentsByStage';
import { calculateDashboardStats, students } from '../../data/students';

const DashboardOverview: React.FC = () => {
  const stats = calculateDashboardStats();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Monitor student progress and engagement across your cohort</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Average Progress Circle */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col items-center">
            <CircularProgress progress={stats.averageProgress} />
            <h3 className="text-lg font-semibold text-gray-900 mt-4">Average Roadmap Completion</h3>
            <p className="text-sm text-gray-500 text-center mt-2">
              Overall progress across all students in your cohort
            </p>
          </div>
        </div>

        {/* Stage Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stage Distribution</h3>
          <StageDistributionChart data={stats.stageDistribution} />
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-200 rounded mr-2"></div>
              <span className="text-xs text-gray-600">Early</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-400 rounded mr-2"></div>
              <span className="text-xs text-gray-600">Mid</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
              <span className="text-xs text-gray-600">Late</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PRSU Matrix Radar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Readiness Overview</h3>
          <CustomRadarChart data={stats.averageMatrix} />
          <p className="text-sm text-gray-500 text-center mt-4">
            Average scores across key readiness areas
          </p>
        </div>

        {/* Students by Stage */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Students by Roadmap Stage</h3>
          <StudentsByStage students={students} />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;