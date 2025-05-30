'use client';

import React from 'react';
import { PieChart as ChartPie } from 'lucide-react';

interface ProgressTrackerProps {
  completed: number;
  total: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ completed, total }) => {
  const percentage = Math.round((completed / total) * 100);
  const circleCircumference = 2 * Math.PI * 36; // radius is 36
  const strokeDashoffset = circleCircumference - (percentage / 100) * circleCircumference;

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden p-6">
          <div className="flex items-center space-x-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              {/* Background circle */}
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  className="stroke-gray-200"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  className="stroke-indigo-500"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
                {/* Percentage text */}
                <text
                  x="50"
                  y="50"
                  className="text-indigo-600 text-lg font-bold"
                  dominantBaseline="middle"
                  textAnchor="middle"
                >
                  {percentage}%
                </text>
              </svg>
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <ChartPie className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xl font-semibold text-gray-800">Progress Tracker</h3>
              </div>
              <p className="text-gray-600 mb-1">
                {completed} of {total} tasks done
              </p>
              <a href="#" className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center transition-colors duration-200">
                View My Journey
                <span className="ml-1">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProgressTracker; 