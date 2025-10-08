'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, Circle, Clock, TrendingUp, Calendar, Target } from 'lucide-react';

const progressItems = [
  {
    id: 1,
    title: "Complete College Research",
    description: "Research and shortlist 10-15 colleges that match your interests",
    status: "completed",
    dueDate: "Sep 15, 2024",
    category: "Academic Planning"
  },
  {
    id: 2,
    title: "Submit Summer Program Applications",
    description: "Apply to 3-5 summer programs in your field of interest",
    status: "in-progress",
    dueDate: "Oct 30, 2024",
    category: "Opportunities"
  },
  {
    id: 3,
    title: "Draft Personal Statement",
    description: "Write first draft of college application essay",
    status: "pending",
    dueDate: "Nov 15, 2024",
    category: "Applications"
  },
  {
    id: 4,
    title: "Schedule SAT/ACT Retake",
    description: "Register for standardized test retake if needed",
    status: "pending",
    dueDate: "Dec 1, 2024",
    category: "Testing"
  }
];

const ProgressTracker = () => {
  const [inView, setInView] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('progress-tracker-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-6 h-6 text-blue-500" />;
      default:
        return <Circle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'in-progress':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const completedCount = progressItems.filter(item => item.status === 'completed').length;
  const progressPercentage = (completedCount / progressItems.length) * 100;

  return (
    <section id="progress-tracker-section" className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 progress-tracker-animate ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-semibold mb-6">
            <TrendingUp className="w-4 h-4" />
            Progress Tracker
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Track Your <span className="text-blue-600 dark:text-blue-400">Journey</span>
          </h2>
          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            Visualize your progress, stay on track with deadlines, and celebrate every milestone 
            as you work toward your goals.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Progress Overview */}
          <div className={`lg:col-span-1 progress-tracker-animate ${
            inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Progress</h3>
              
              {/* Progress Circle */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${progressPercentage * 3.14} 314`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(progressPercentage)}%</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {completedCount} of {progressItems.length} tasks completed
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Completed: {completedCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-600">In Progress: {progressItems.filter(item => item.status === 'in-progress').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Pending: {progressItems.filter(item => item.status === 'pending').length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Task List */}
          <div className={`lg:col-span-2 progress-tracker-animate ${
            inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Current Tasks</h3>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  <Target className="w-4 h-4" />
                  Add Task
                </button>
              </div>

              <div className="space-y-4">
                {progressItems.map((item, index) => {
                  const delay = index * 0.1;
                  
                  return (
                    <div
                      key={item.id}
                      className={`p-6 rounded-xl border-2 transition-all duration-500 hover:shadow-md cursor-pointer ${getStatusColor(item.status)} ${
                        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      }`}
                      style={{ transitionDelay: `${delay + 0.3}s` }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getStatusIcon(item.status)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{item.title}</h4>
                            <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                              {item.category}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-300 mb-3">{item.description}</p>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            Due: {item.dueDate}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <a 
            href="/api/auth/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            View Full Dashboard
            <TrendingUp className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProgressTracker;