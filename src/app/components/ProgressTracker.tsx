'use client';

import React from 'react';
import { PieChart as ChartPie } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ProgressTrackerProps {
  completed: number;
  total: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ completed, total }) => {
  const percentage = Math.round((completed / total) * 100);
  const circleCircumference = 2 * Math.PI * 36; // radius is 36
  const strokeDashoffset = circleCircumference - (percentage / 100) * circleCircumference;
  const { theme } = useTheme();

  return (
    <section className="py-8 sm:py-10 md:py-16 bg-light-card dark:bg-dark-card/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-light-background dark:bg-dark-card rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 mx-auto sm:mx-0">
              {/* Background circle */}
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  className="stroke-gray-200 dark:stroke-dark-border"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  className="stroke-primary-500 dark:stroke-primary-600"
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
                  className="text-sm sm:text-base md:text-lg font-bold"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fill={theme === 'dark' ? '#FFFFFF' : '#000000'}
                >
                  {percentage}%
                </text>
              </svg>
            </div>
            
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                <ChartPie className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary-600 dark:text-primary-400" />
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-light-text dark:text-dark-text">Progress Tracker</h3>
              </div>
              <p className="text-xs sm:text-sm md:text-base text-light-muted dark:text-dark-muted mb-1">
                {completed} of {total} tasks done
              </p>
              <a href="#" className="text-xs sm:text-sm md:text-base text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium inline-flex items-center transition-colors duration-200">
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